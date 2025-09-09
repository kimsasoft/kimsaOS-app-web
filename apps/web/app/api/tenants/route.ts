import { NextResponse } from "next/server";
import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@repo/database";
import { supabaseServer } from "@repo/supabase";

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
  
  try {
    input = schema.parse(input);
  } catch (validationError) {
    return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
  }

  try {
    console.log('🔍 Creando tenant. UserId del header:', userId);
    
    // Verificar si el slug ya existe
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: input.slug }
    });

    if (existingTenant) {
      return NextResponse.json({ 
        error: `El slug "${input.slug}" ya está en uso. Por favor elige otro.` 
      }, { status: 400 });
    }

    // Obtener datos del usuario de Supabase Auth
    const supabase = supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('❌ Error obteniendo datos de usuario:', userError?.message);
      return NextResponse.json(
        { error: "Unable to get user data" },
        { status: 401 }
      );
    }

    console.log('✅ Usuario de Supabase obtenido:', { id: user.id, email: user.email });

    // Buscar o crear el perfil del usuario usando transacción
    let profile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      console.log('🔄 Perfil no encontrado, intentando crear...');
      
      // Verificar si existe un perfil con el mismo email
      const existingProfile = await prisma.profile.findUnique({
        where: { email: user.email! },
      });

      if (existingProfile) {
        console.log('⚠️ Perfil existente encontrado con el mismo email:', existingProfile.id);
        profile = existingProfile;
      } else {
        // Crear nuevo perfil
        try {
          profile = await prisma.profile.create({
            data: {
              id: userId,
              email: user.email!,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
              avatar_url: user.user_metadata?.avatar_url || null,
            },
          });
          console.log('✅ Nuevo perfil creado:', profile.id);
        } catch (createError: any) {
          console.error('❌ Error creando perfil:', createError);
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

    console.log('✅ Perfil final:', { id: profile.id, email: profile.email });

    // Verificar si el usuario ya tiene una membresía (evitar duplicados)
    const existingMembership = await prisma.membership.findFirst({
      where: { user_id: profile.id }
    });

    if (existingMembership) {
      return NextResponse.json({ 
        error: "Ya tienes una empresa asociada a tu cuenta" 
      }, { status: 400 });
    }

    // Usar transacción para crear tenant y membresía juntos
    const result = await prisma.$transaction(async (tx) => {
      // Crear el tenant
      const tenant = await tx.tenant.create({
        data: {
          name: input.name,
          slug: input.slug,
          domain: input.domain,
        },
      });

      console.log('✅ Tenant creado:', tenant.id);

      // Crear la membresía
      const membership = await tx.membership.create({
        data: {
          tenant_id: tenant.id,
          user_id: profile.id,
          role: "owner",
        },
      });

      console.log('✅ Membresía creada:', membership.id);

      return { tenant, membership };
    });

    console.log('🎉 Tenant y membresía creados exitosamente');

    // Verificar el tipo de contenido para la respuesta
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
    console.error('❌ Error en creación de tenant:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    
    // Manejar errores específicos de Prisma
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
