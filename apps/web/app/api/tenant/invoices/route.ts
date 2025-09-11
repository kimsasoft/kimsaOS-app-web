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
    console.log('🔍 Cargando facturas para usuario:', userId);
    
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
      console.log('❌ No se encontró membresía para usuario:', userId);
      return NextResponse.json({ 
        error: "No tenant membership found" 
      }, { status: 404 });
    }

    console.log('✅ Tenant encontrado para facturas:', membership.tenant.id);

    // Obtener las facturas del tenant
    const invoices = await prisma.invoice.findMany({
      where: {
        tenant_id: membership.tenant.id,
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        number: true,
        amount: true,
        status: true,
        created_at: true,
      },
    });

    console.log('✅ Facturas cargadas:', invoices.length);

    return NextResponse.json({ invoices });
  } catch (error: any) {
    console.error('❌ Error cargando facturas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
