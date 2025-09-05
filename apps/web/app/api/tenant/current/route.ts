import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { prisma } from "@repo/database";

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
    const tenant = await prisma.tenant.findFirst({
      where: domain ? { domain } : { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    return NextResponse.json({ tenant });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
