import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@repo/database";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");

  if (!code) {
    console.error("No code parameter in callback");
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      }
    }
  );

  const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);
  
  if (error || !user) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
  }
  
  try {
    const existingProfile = await prisma.profile.findUnique({
      where: { id: user.id }
    });
    
    if (!existingProfile) {
      console.log("Creando perfil para usuario:", user.email);
      
      if (!user.email) {
        console.error("Usuario sin email");
        return NextResponse.redirect(`${origin}/login?error=missing_email`);
      }
      
      await prisma.profile.create({
        data: {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url || null,
          is_super_admin: false,
        },
      });
      console.log("Perfil creado");
    }
  } catch (profileError) {
    console.error("Error al crear perfil:", profileError);
  }
  
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  try {
    const memberships = await prisma.membership.findMany({
      where: { user_id: user.id }
    });

    if (!memberships || memberships.length === 0) {
      return NextResponse.redirect(`${origin}/onboarding`);
    }
  } catch (error) {
    console.error("Error checking memberships:", error);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
