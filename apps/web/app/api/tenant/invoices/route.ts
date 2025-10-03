import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@repo/database";
import { checkAuth } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error, userId } = checkAuth(headers());
  if (error) return error;

  try {
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
