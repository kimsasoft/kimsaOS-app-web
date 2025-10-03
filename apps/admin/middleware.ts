import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;
    const res = NextResponse.next();

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
    const isProtectedRoute = pathname.startsWith("/sa") || pathname.startsWith("/api/sa");
    const isPublicRoute = pathname.startsWith("/login") || pathname === "/";

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
    }

    // Si está autenticado y trata de acceder a login, redirigir a /sa
    if (isPublicRoute && pathname === "/login") {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        return NextResponse.redirect(new URL("/sa", req.url));
      }
    }

    // Redirigir root a login si no está autenticado, o a /sa si está autenticado
    if (pathname === "/") {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        return NextResponse.redirect(new URL("/sa", req.url));
      } else {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return res;
  } catch (error) {
    console.error("Error en middleware admin:", error instanceof Error ? error.message : "Error desconocido");
    // En caso de error, permitir acceso a rutas públicas
    if (req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname === "/") {
      return NextResponse.next();
    }
    // Para rutas protegidas, redirigir a login
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next|.*\\.|favicon.ico).*)"],
};