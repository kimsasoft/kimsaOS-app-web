import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { prisma } from "@repo/database";
import {
  checkDatabaseConfig,
  handleApiError,
  checkAuth,
} from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const c = cookies();
    const slug = c.get("tenant_slug")?.value;
    if (!slug) {
      return NextResponse.json(
        { error: "No tenant specified" },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findFirst({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    return NextResponse.json({ tenant });
  } catch (error: any) {
    return handleApiError(error, "/api/tenant/current");
  }
}
