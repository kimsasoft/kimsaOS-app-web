import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { prisma } from "@repo/database";

const BASE = (process.env.NEXT_PUBLIC_BASE_DOMAINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

async function handleLocalhost(req: NextRequest, res: NextResponse, supabase: any) {
  try {
    const existingSlug = req.cookies.get("tenant_slug")?.value;
    if (existingSlug) return;
  } catch (error) {}
}

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
    res.cookies.set("tenant_slug", host.replace(/\./g, '-'), { path: "/" });
  }
}

export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;
    const host = req.headers.get("host") || "";
    const res = NextResponse.next();
    const isLocalhost = process.env.NODE_ENV === "development" || 
                        process.env.FORCE_LOCALHOST === "true" ||
                        host.includes("localhost") || 
                        host.includes("127.0.0.1");

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

    const isApiRoute = pathname.startsWith("/api/");
    const isProtectedPageRoute = pathname.startsWith("/dashboard") ||
                                pathname.startsWith("/onboarding") ||
                                pathname.startsWith("/profile") ||
                                pathname.startsWith("/company");

    const isPublicApiRoute = pathname.startsWith("/api/auth/") || pathname === "/api/health";

    if (isApiRoute && !isPublicApiRoute) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      res.headers.set("x-user-id", user.id);
    }

    if (isProtectedPageRoute) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      if (pathname.startsWith("/company")) {
        try {
          const membership = await prisma.membership.findFirst({
            where: { user_id: user.id },
            select: { role: true }
          });
          
          if (membership?.role === 'member') {
            return NextResponse.redirect(new URL("/dashboard?error=403", req.url));
          }
        } catch (dbError) {}
      }

      res.headers.set("x-user-id", user.id);
    }
    
    if (isLocalhost) {
      await handleLocalhost(req, res, supabase);
    } else {
      handleProductionDomains(host, res);
    }

    return res;
  } catch (error) {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next|.*\\.|auth).*)"],
};
