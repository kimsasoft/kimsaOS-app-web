"use client";
import { supabase } from "@repo/supabase";
import { LoginForm } from "@repo/ui";

export default function Login() {
  const onPasswordLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new Error(error.message);
    }
    
    if (data.user) {
      try {
        const response = await fetch("/api/user/memberships");
        const { memberships } = await response.json();
        
        if (!memberships || memberships.length === 0) {
          throw new Error("Tu cuenta aún no está configurada. Por favor revisa tu correo electrónico para completar el registro.");
        }
        
        location.href = "/dashboard";
      } catch (fetchError) {
        await supabase.auth.signOut();
        throw new Error("Tu cuenta aún no está configurada. Por favor revisa tu correo electrónico para completar el registro.");
      }
    }
  };

  const onMagicLinkLogin = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      throw new Error("No se pudo enviar el enlace mágico");
    } else {
      alert("Revisa tu correo electrónico para el enlace de acceso");
    }
  };

  const onOAuthLogin = async (provider: string) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: { 
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      },
    });
    if (error) {
      throw new Error(`Error al conectar con ${provider}`);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <LoginForm
        onPasswordLogin={onPasswordLogin}
        onMagicLinkLogin={onMagicLinkLogin}
        onOAuthLogin={onOAuthLogin}
        registerHref="/register"
      />
    </main>
  );
}