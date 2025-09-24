import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@repo/database";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const h = headers();
    const userId = h.get("x-user-id")!;
    const data = await request.json();
    
    const {
      companyName,
      companyEmail,
      companyPhone,
      companyAddress,
      tenantName,
      tenantSlug
    } = data;

    if (!companyName || !companyEmail || !tenantName || !tenantSlug) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug }
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: `El slug "${tenantSlug}" ya está en uso. Intenta con otro.` },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.findUnique({
        where: { id: userId }
      });

      if (!profile) {
        return NextResponse.json(
          { error: "Perfil de usuario no encontrado. Contacta al soporte." },
          { status: 400 }
        );
      }

      const company = await tx.company.create({
        data: {
          name: companyName,
          email: companyEmail,
          phone: companyPhone || null,
          address: companyAddress || null,
        }
      });

      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          slug: tenantSlug,
          company_id: company.id,
        }
      });

      const membership = await tx.membership.create({
        data: {
          user_id: profile.id,
          tenant_id: tenant.id,
          role: "owner"
        }
      });

      return { company, tenant, membership, profile };
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Ya existe un registro con esa información. Intenta con datos diferentes." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}