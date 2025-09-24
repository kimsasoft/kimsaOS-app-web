import { NextResponse } from "next/server";
import { headers } from "next/headers";
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

  try {
    // Buscar la membresía del usuario para obtener el tenant
    const membership = await prisma.membership.findFirst({
      where: { 
        user_id: userId 
      },
      include: {
        tenant: true
      }
    });

    if (!membership || !membership.tenant) {
      return NextResponse.json({ 
        error: "No tenant membership found" 
      }, { status: 404 });
    }

    // Obtener las órdenes del tenant
    const orders = await prisma.order.findMany({
      where: {
        tenant_id: membership.tenant.id,
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        number: true,
        total: true,
        status: true,
        created_at: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
