import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@repo/database";
import { checkAuth } from "@/lib/api-utils";

export async function GET() {
  const { error, userId } = checkAuth(headers());
  if (error) return error;

  try {
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
            status: true,
            created_at: true,
            company: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                created_at: true,
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    if (!membership || !membership.tenant) {
      return NextResponse.json({ 
        error: "No tenant found for user. Please create or join a tenant first." 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      tenant: membership.tenant,
      membership: {
        id: membership.id,
        role: membership.role
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
