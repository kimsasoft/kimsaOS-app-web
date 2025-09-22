import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@repo/database";

// Forzar que esta ruta sea dinámica
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Obtener user ID del header establecido por el middleware
    const h = headers();
    const userId = h.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();
    const {
      companyName,
      companyEmail,
      companyPhone,
      companyAddress,
      tenantName,
      tenantSlug
    } = data;

    // Validar campos requeridos
    if (!companyName || !companyEmail || !tenantName || !tenantSlug) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el slug ya existe
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug }
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: `El slug "${tenantSlug}" ya está en uso. Intenta con otro.` },
        { status: 400 }
      );
    }

    // Crear en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // 1. Obtener o crear el perfil del usuario
      let profile = await tx.profile.findUnique({
        where: { id: userId }
      });

      if (!profile) {
        return NextResponse.json(
          { error: "Perfil de usuario no encontrado. Contacta al soporte." },
          { status: 400 }
        );
      }

      // 2. Crear la empresa
      const company = await tx.company.create({
        data: {
          name: companyName,
          email: companyEmail,
          phone: companyPhone || null,
          address: companyAddress || null,
        }
      });

      // 3. Crear el tenant
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          slug: tenantSlug,
          company_id: company.id,
        }
      });

      // 4. Crear la membresía (usuario como admin)
      console.log("🔍 Onboarding - Creando membership con datos:", {
        user_id: profile.id,
        tenant_id: tenant.id,
        role: "admin"
      });

      const membership = await tx.membership.create({
        data: {
          user_id: profile.id,
          tenant_id: tenant.id,
          role: "admin"
        }
      });

      console.log("✅ Onboarding - Membership creada:", membership);
      return { company, tenant, membership, profile };
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Error in onboarding:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "Ya existe un registro con esa información. Intenta con datos diferentes." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}