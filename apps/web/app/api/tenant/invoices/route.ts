import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { prisma } from "@repo/database";

// Forzar que esta ruta sea dinámica
export const dynamic = "force-dynamic";

export async function GET() {
  // Obtener user ID del header establecido por el middleware
  const h = headers();
  const userId = h.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const c = cookies();
  const slug = c.get("tenant_slug")?.value;
  const domain = c.get("tenant_domain")?.value;

  if (!slug && !domain) {
    return NextResponse.json({ error: "No tenant specified" }, { status: 400 });
  }

  try {
    // Primero encontrar el tenant
    const tenant = await prisma.tenant.findFirst({
      where: domain ? { domain } : { slug },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Verificar que el usuario tenga acceso a este tenant
    const membership = await prisma.membership.findFirst({
      where: {
        user_id: userId,
        tenant_id: tenant.id,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Obtener las facturas
    const invoices = await prisma.invoice.findMany({
      where: {
        tenant_id: tenant.id,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({ invoices });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
