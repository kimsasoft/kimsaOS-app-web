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
    const memberships = await prisma.membership.findMany({
      where: {
        user_id: userId,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            domain: true,
          },
        },
      },
    });

    return NextResponse.json({ memberships });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
