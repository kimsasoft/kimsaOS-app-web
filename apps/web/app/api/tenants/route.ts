import { NextResponse } from "next/server";
import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@repo/database";
import { supabaseServer } from "@repo/supabase";
import { checkAuth } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  domain: z.string().optional(),
});

export async function POST(req: Request) {
  const { error, userId } = checkAuth(headers());
  if (error) return error;

  let input: any;
  const ctype = req.headers.get("content-type") || "";
  if (ctype.includes("application/json")) {
    input = await req.json();
  } else {
    const fd = await req.formData();
    input = {
      name: String(fd.get("name") || ""),
      slug: String(fd.get("slug") || ""),
      domain: fd.get("domain") ? String(fd.get("domain")) : undefined,
    };
  }
  
  try {
    input = schema.parse(input);
  } catch (validationError) {
    return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
  }

  try {
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: input.slug }
    });

    if (existingTenant) {
      return NextResponse.json({ 
        error: `El slug "${input.slug}" ya está en uso. Por favor elige otro.` 
      }, { status: 400 });
    }

    const supabase = supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unable to get user data" },
        { status: 401 }
      );
    }

    let profile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      const existingProfile = await prisma.profile.findUnique({
        where: { email: user.email! },
      });

      if (existingProfile) {
        profile = existingProfile;
      } else {
        try {
          profile = await prisma.profile.create({
            data: {
              id: userId,
              email: user.email!,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
              avatar_url: user.user_metadata?.avatar_url || null,
            },
          });
        } catch (createError: any) {
          if (createError.code === 'P2002') {
            return NextResponse.json({ 
              error: "Error de usuario duplicado. Por favor contacta soporte." 
            }, { status: 500 });
          }
          throw createError;
        }
      }
    }

    if (!profile) {
      throw new Error('No se pudo obtener el perfil del usuario');
    }

    const existingMembership = await prisma.membership.findFirst({
      where: { user_id: profile.id }
    });

    if (existingMembership) {
      return NextResponse.json({ 
        error: "Ya tienes una empresa asociada a tu cuenta" 
      }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: input.name,
        },
      });

      const tenant = await tx.tenant.create({
        data: {
          name: input.name,
          slug: input.slug,
          company_id: company.id,
        },
      });

      const membership = await tx.membership.create({
        data: {
          tenant_id: tenant.id,
          user_id: profile.id,
          role: "owner",
        },
      });

      return { tenant, membership };
    });
    if (!ctype.includes("application/json")) {
      return NextResponse.redirect(
        new URL(
          "/dashboard",
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        )
      );
    } else {
      return NextResponse.json({ tenant: result.tenant });
    }
  } catch (error: any) {
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      if (field === 'slug') {
        return NextResponse.json({ 
          error: `El slug "${input.slug}" ya está en uso. Por favor elige otro.` 
        }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      error: error.message || "Error interno del servidor" 
    }, { status: 500 });
  }
}
