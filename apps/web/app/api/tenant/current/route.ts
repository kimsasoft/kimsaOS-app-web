import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { prisma } from "@repo/database";
import {
  checkDatabaseConfig,
  handleApiError,
  checkAuth,
} from "@/lib/api-utils";

// Forzar que esta ruta sea dinámica
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verificar configuración
    const dbCheck = checkDatabaseConfig();
    if (dbCheck) return dbCheck;

    // Verificar autenticación
    const { error: authError } = checkAuth(headers());
    if (authError) return authError;

    const c = cookies();
    const slug = c.get("tenant_slug")?.value;
    const domain = c.get("tenant_domain")?.value;
    if (!slug && !domain) {
      return NextResponse.json(
        { error: "No tenant specified" },
        { status: 400 }
      );
    }

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
    return handleApiError(error, "/api/tenant/current");
  }
}
