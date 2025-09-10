import { NextResponse } from "next/server";
import { supabaseServer } from "@repo/supabase";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  if (code) {
    const supabase = supabaseServer();
    // Intercambia el código por la sesión y la guarda en las cookies
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(
    new URL("/dashboard", process.env.NEXT_PUBLIC_APP_URL)
  );
}
