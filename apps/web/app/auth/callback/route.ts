import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { supabaseServer } from "@repo/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/onboarding";

  if (code) {
    const supabase = supabaseServer();
    await supabase.auth.exchangeCodeForSession(code);
    
    // Determinar la redirección basada en el tipo
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/reset-password`);
    }
    
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
