"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { ForgotPasswordForm } from "../../../../../packages/ui/src/molecules/form/forgot-password";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleForgotPassword = async (email: string) => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
    } catch (err: any) {
      console.error("Error enviando email de reset:", err);
      // El componente ForgotPasswordForm maneja los errores internamente
      throw err; // Re-throw para que el componente pueda manejarlo
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 shadow-lg text-center space-y-6">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground">¡Email enviado!</h1>
            <p className="text-muted-foreground">
              Hemos enviado un enlace para restablecer tu contraseña a tu email.
              Revisa tu bandeja de entrada y sigue las instrucciones.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-md p-4">
              <p className="text-sm text-primary">
                <strong>Nota:</strong> El enlace expirará en 1 hora. Si no ves el email, 
                revisa tu carpeta de spam.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setEmailSent(false);
              }}
              className="text-primary hover:text-primary/80 font-medium text-sm"
            >
              ¿No recibiste el email? Enviar de nuevo
            </button>
            <div>
              <a
                href="/login"
                className="text-muted-foreground hover:text-foreground font-medium text-sm"
              >
                Volver al login
              </a>
            </div>
          </div>
        </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <ForgotPasswordForm onSubmit={handleForgotPassword} loading={loading} />
        </div>
      </div>
    </main>
  );
}