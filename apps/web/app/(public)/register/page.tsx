"use client";
import { supabase } from "@repo/supabase";
import { RegisterForm } from "@repo/ui";

export default function Register() {
  const onRegister = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw new Error(error.message);
    location.href = "/onboarding";
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <RegisterForm
        onRegister={onRegister}
        loginHref="/login"
      />
    </main>
  );
}
