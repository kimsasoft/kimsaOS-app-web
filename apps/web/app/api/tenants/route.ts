import { NextResponse } from "next/server";
import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@repo/database";
import { supabaseServer } from "@repo/supabase";

// Forzar que esta ruta sea dinámica
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  domain: z.string().optional(),
});

export async function POST(req: Request) {
  // Obtener user ID del header establecido por el middleware
  const h = headers();
  const userId = h.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  input = schema.parse(input);

  try {
    // Primero obtener datos del usuario de Supabase Auth para crear el perfil
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

    // Crear o verificar que existe el perfil del usuario
    await prisma.profile.upsert({
      where: { id: userId },
      update: {}, // No actualizar nada si ya existe
      create: {
        id: userId,
        email: user.email!,
        full_name:
          user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      },
    });

    // Usar Prisma para crear el tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: input.name,
        slug: input.slug,
        domain: input.domain,
      },
    });

    // Crear la membresía usando Prisma
    await prisma.membership.create({
      data: {
        tenant_id: tenant.id,
        user_id: userId,
        role: "owner",
      },
    });

    // Verificar el tipo de contenido para la respuesta
    if (!ctype.includes("application/json")) {
      return NextResponse.redirect(
        new URL(
          "/dashboard",
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        )
      );
    } else {
      return NextResponse.json({ tenant });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
