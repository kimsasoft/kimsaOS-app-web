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
});

export async function POST(req: Request) {
  // Obtener user ID del header establecido por el middleware
  const h = headers();
  const userId = h.get("x-user-id")!; // El middleware garantiza que existe para rutas protegidas

  let input: any;
  const ctype = req.headers.get("content-type") || "";
  if (ctype.includes("application/json")) {
    input = await req.json();
  } else {
    const fd = await req.formData();
    input = {
      name: String(fd.get("name") || ""),
      slug: String(fd.get("slug") || ""),
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

    // Obtener datos del usuario de Supabase (el middleware ya verificó la autenticación)
    const supabase = supabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    // El middleware ya garantiza que hay un usuario autenticado
    if (!user) {
      throw new Error('Usuario no encontrado después de autenticación del middleware');
    }

    console.log('✅ Usuario de Supabase obtenido:', { id: user.id, email: user.email });

    // Buscar perfil del usuario (debe existir ya que onboarding garantiza su creación)
    const profile = await prisma.profile.findUnique({
      where: { id: userId }
    });

    if (!profile) {
      console.error('❌ Perfil no encontrado para usuario:', userId);
      return NextResponse.json({ 
        error: "Perfil de usuario no encontrado. Por favor contacta soporte." 
      }, { status: 500 });
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

    // Usar transacción para crear company, tenant y membresía juntos
    const result = await prisma.$transaction(async (tx) => {
      // Crear la company primero
      const company = await tx.company.create({
        data: {
          name: input.name,
          email: user.email,
        },
      });

      console.log('✅ Company creada:', company.id);

      // Crear el tenant
      const tenant = await tx.tenant.create({
        data: {
          name: input.name,
          slug: input.slug,
          company_id: company.id,
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

      return { tenant, membership, company };
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
