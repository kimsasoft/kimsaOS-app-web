import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { prisma } from "@repo/database";

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

    // Si ya hay cookies, no hacer nada por ahora
    // El tenant se resolverá en las API routes individuales
    if (existingSlug) {
      return;
    }
  } catch (error) {
    // Si hay error, continuar sin establecer cookies
  }
}

// Función auxiliar para manejar dominios de producción
function handleProductionDomains(host: string, res: NextResponse) {
  const isBase = BASE.some((d) => host.endsWith(d));

  if (isBase) {
    const parts = host.split(".");
    if (parts.length >= 3) {
      res.cookies.set("tenant_slug", parts[0], { path: "/" });
    } else {
      res.cookies.delete("tenant_slug");
    }
  } else {
    // Para dominios personalizados, usar el host como slug
    res.cookies.set("tenant_slug", host.replace(/\./g, '-'), { path: "/" });
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
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/onboarding") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/company");

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

      // Verificar permisos específicos para /company
      if (pathname.startsWith("/company")) {
        try {
          const membership = await prisma.membership.findFirst({
            where: { 
              user_id: user.id 
            },
            select: {
              role: true
            }
          });
          
          if (membership?.role === 'member') {
            return NextResponse.redirect(new URL("/dashboard?access_denied=company", req.url));
          }
        } catch (error) {
          // En caso de error, permitir acceso y que se maneje en la página
        }
      }      // Agregar user ID a los headers para que las API routes puedan usarlo
      res.headers.set("x-user-id", user.id);
    }
    
    // Manejo de tenant cookies
    if (isLocalhost) {
      await handleLocalhost(req, res, supabase);
    } else {
      handleProductionDomains(host, res);
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
export const config = {
  matcher: ["/((?!_next|.*\\.|auth/callback).*)"],
};
