"use client";
import { supabase } from "@repo/supabase";
import { LoginForm } from "@repo/ui";

export default function Login() {
  const onPasswordLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    location.href = "/dashboard";
  };

  const onMagicLinkLogin = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      alert(error.message);
    } else {
      alert("Revisa tu correo");
    }
  };

  const onOAuthLogin = async (provider: string) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) alert(error.message);
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
