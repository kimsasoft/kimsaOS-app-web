import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // We can't set cookies here, they'll be set in the redirect response
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalhost = request.headers.get("host")?.includes("localhost");

      if (isLocalhost) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      // For production, construct the URL properly
      const protocol = forwardedHost ? "https" : "http";
      const host = forwardedHost || request.headers.get("host");
      return NextResponse.redirect(`${protocol}://${host}${next}`);
    }
  }

  // Return to login if something went wrong
  return NextResponse.redirect(`${origin}/login`);
}

// Mark this route as dynamic
export const runtime = "edge";
