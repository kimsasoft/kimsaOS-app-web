import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@repo/database";
import { checkAuth } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error, userId } = checkAuth(headers());
  if (error) return error;

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
          },
        },
      },
    });

    return NextResponse.json({ memberships });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
