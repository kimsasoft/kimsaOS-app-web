"use client";

import { useState } from "react";
import { supabase } from "@repo/supabase";
import { ForgotPasswordForm } from "../../../../../packages/ui/src/molecules/form/forgot-password";

export default function ForgotPasswordPage() {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const handleForgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }

    setSentEmail(email);
    setIsEmailSent(true);
  };

  const handleResendEmail = () => {
    setIsEmailSent(false);
    setSentEmail("");
  };

  if (isEmailSent) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 shadow-lg text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">¡Email enviado!</h1>
              <p className="text-sm text-muted-foreground">
                Hemos enviado un enlace de recuperación a <strong>{sentEmail}</strong>. 
                Revisa tu bandeja de entrada y sigue las instrucciones.
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleResendEmail}
                className="text-sm text-primary hover:underline font-medium"
              >
                ¿No recibiste el email? Enviar de nuevo
              </button>
              
              <div className="pt-4 border-t border-border">
                <a 
                  href="/login" 
                  className="text-sm text-muted-foreground hover:text-foreground"
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
          <ForgotPasswordForm onSubmit={handleForgotPassword} />
        </div>
      </div>
    </main>
  );
}
