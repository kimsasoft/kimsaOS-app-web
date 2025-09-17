import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@repo/database";

export async function GET() {
  // Obtener user ID del header establecido por el middleware
  const h = headers();
  const userId = h.get("x-user-id");
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log('🔍 Buscando tenant para usuario:', userId);
    
    // Buscar la membresía del usuario (debería tener solo una como owner)
    const membership = await prisma.membership.findFirst({
      where: { 
        user_id: userId 
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            created_at: true,
          }
        }
      },
      orderBy: {
        created_at: 'desc' // Obtener la más reciente
      }
    });

    if (!membership || !membership.tenant) {
      console.log('❌ No se encontró membresía o tenant para usuario:', userId);
      return NextResponse.json({ 
        error: "No tenant found for user. Please create or join a tenant first." 
      }, { status: 404 });
    }

    console.log('✅ Tenant encontrado:', {
      id: membership.tenant.id,
      name: membership.tenant.name,
      slug: membership.tenant.slug
    });

    return NextResponse.json({ 
      tenant: membership.tenant,
      membership: {
        id: membership.id,
        role: membership.role
      }
    });
  } catch (error: any) {
    console.error('❌ Error en /api/user/tenant:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
