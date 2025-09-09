import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const BASE = (process.env.NEXT_PUBLIC_BASE_DOMAINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Validar variables de entorno requeridas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL no está configurada");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada");
}

// Función auxiliar para manejar localhost
async function handleLocalhost(
  req: NextRequest,
  res: NextResponse,
  supabase: any
) {
  try {
    const existingSlug = req.cookies.get("tenant_slug")?.value;
    const existingDomain = req.cookies.get("tenant_domain")?.value;

    // Si ya hay cookies, no hacer nada
    if (existingSlug || existingDomain) {
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("❌ Error obteniendo usuario:", userError.message);
      return;
    }

    if (!user) {
      return;
    }

    // Obtener el primer tenant del usuario usando el cliente normal
    const { data: memberships, error: membershipError } = await supabase
      .from("memberships")
      .select(
        `
        tenant_id,
        tenants!tenant_id (
          id,
          slug,
          domain
        )
      `
      )
      .eq("user_id", user.id)
      .limit(1);

    if (membershipError) {
      console.error(
        "❌ Error obteniendo memberships:",
        membershipError.message
      );
      return;
    }

    if (memberships && memberships.length > 0) {
      const tenant = memberships[0].tenants as any;

      if (tenant) {
        // Establecer cookies automáticamente
        if (tenant.domain) {
          res.cookies.set("tenant_domain", tenant.domain, { path: "/" });
          res.cookies.delete("tenant_slug");
        } else if (tenant.slug) {
          res.cookies.set("tenant_slug", tenant.slug, { path: "/" });
          res.cookies.delete("tenant_domain");
        }
      }
    }
  } catch (error) {
    // Si hay error, continuar sin establecer cookies
    console.error(
      "❌ Error en middleware localhost:",
      error instanceof Error ? error.message : "Error desconocido"
    );
  }
}

// Función auxiliar para manejar dominios de producción
function handleProductionDomains(host: string, res: NextResponse) {
  const isBase = BASE.some((d) => host.endsWith(d));

  if (isBase) {
    const parts = host.split(".");
    if (parts.length >= 3) {
      res.cookies.set("tenant_slug", parts[0], { path: "/" });
      res.cookies.delete("tenant_domain");
    } else {
      res.cookies.delete("tenant_slug");
      res.cookies.delete("tenant_domain");
    }
  } else {
    res.cookies.set("tenant_domain", host, { path: "/" });
    res.cookies.delete("tenant_slug");
  }
}

export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;
    const host = req.headers.get("host") || "";
    const res = NextResponse.next();
    const isLocalhost =
      process.env.NODE_ENV === "development" ||
      process.env.FORCE_LOCALHOST === "true" ||
      host.includes("localhost") ||
      host.includes("127.0.0.1");

    // Crear cliente de Supabase para validar autenticación
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Verificar autenticación para rutas protegidas
    const isProtectedRoute =
      pathname.startsWith("/api/") ||
      pathname.startsWith("/(protected)") ||
      pathname === "/dashboard" ||
      pathname === "/onboarding";

    if (isProtectedRoute) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        // Redirigir a login si no está autenticado
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        } else {
          return NextResponse.redirect(new URL("/login", req.url));
        }
      }

      // Agregar user ID a los headers para que las API routes puedan usarlo
      res.headers.set("x-user-id", user.id);
      console.log(
        "🔍 Middleware estableciendo header x-user-id:",
        user.id,
        "para ruta:",
        pathname
      );
    }

    // Manejo de tenant cookies
    if (isLocalhost) {
      await handleLocalhost(req, res, supabase);
      console.log("🏠 Local:", host);
    } else {
      handleProductionDomains(host, res);
      console.log("🌐 Prod:", host);
    }

    return res;
  } catch (error) {
    console.error(
      "❌ Error en middleware:",
      error instanceof Error ? error.message : "Error desconocido"
    );
    // En caso de error, retornar respuesta normal sin cookies
    return NextResponse.next();
  }
}
export const config = { matcher: ["/((?!_next|.*\\..*).*)"] };
