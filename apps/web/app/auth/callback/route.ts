import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // Para detectar si es recovery/reset
  const next = searchParams.get("next") ?? "/onboarding";

  if (code) {
    // Determinar la redirección basada en el tipo
    let redirectUrl = `${origin}${next}`;
    if (type === 'recovery') {
      redirectUrl = `${origin}/reset-password`;
    }
    
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: any) {
            response.cookies.set({
              name,
              value: '',
              expires: new Date(0),
              ...options,
            });
          },
        },
      }
    );

    // Intercambiar código por sesión
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Error in callback:", error);
      return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
    }

    // Si es recovery (reset password), ir directo a /reset-password
    if (data.user && data.session && type === 'recovery') {
      const resetResponse = NextResponse.redirect(`${origin}/reset-password`);
      
      // Copiar cookies de la respuesta original
      response.cookies.getAll().forEach(cookie => {
        resetResponse.cookies.set(cookie);
      });
      
      return resetResponse;
    }

    // Si el usuario se acaba de confirmar (signup), redirigir al onboarding
    if (data.user && data.session) {
      const onboardingResponse = NextResponse.redirect(`${origin}/onboarding`);
      
      // Copiar cookies de la respuesta original
      response.cookies.getAll().forEach(cookie => {
        onboardingResponse.cookies.set(cookie);
      });
      
      return onboardingResponse;
    }

    return response;
  }

  // Si no hay código o algo salió mal, redirigir al login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
