"use client";
import { supabase } from "@repo/supabase";
import { AdminLoginForm } from "@repo/ui";

export default function Login() {
  const onPasswordLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    location.href = "/sa";
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <AdminLoginForm
        onPasswordLogin={onPasswordLogin}
      />
    </main>
  );
}
