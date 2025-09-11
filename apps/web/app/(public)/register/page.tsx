"use client";
import { useState } from "react";
import { supabase } from "@repo/supabase";
import { RegisterForm } from "@repo/ui";

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const onRegister = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Show confirmation message instead of redirecting
      setRegisteredEmail(email);
      setEmailSent(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  // Show email confirmation message
  if (emailSent) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 shadow-lg text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                ¡Confirma tu correo!
              </h1>
              <p className="text-sm text-muted-foreground">
                Hemos enviado un enlace de confirmación a:
              </p>
              <p className="text-sm font-medium text-foreground mt-2">
                {registeredEmail}
              </p>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Haz clic en el enlace del correo para activar tu cuenta y continuar con el proceso de registro.
              </p>
              
              <button 
                onClick={() => {setEmailSent(false); setRegisteredEmail("");}}
                className="w-full px-4 py-2 text-sm border border-input rounded-md hover:bg-accent"
              >
                ← Volver al registro
              </button>
              
              <a 
                href="/login" 
                className="block w-full px-4 py-2 text-sm text-primary hover:underline text-center"
              >
                ¿Ya confirmaste? Inicia sesión
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <RegisterForm
        onRegister={onRegister}
        loginHref="/login"
      />
    </main>
  );
}
