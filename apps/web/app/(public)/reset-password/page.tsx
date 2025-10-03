"use client";

import { useState, useEffect } from "react";
import { supabase } from "@repo/supabase";
import { ResetPasswordForm } from "../../../../../packages/ui/src/molecules/form/reset-password";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isPasswordUpdated, setIsPasswordUpdated] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          setIsValidSession(false);
        } else {
          setIsValidSession(true);
        }
      } catch (error) {
        setIsValidSession(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsValidSession(true);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setIsValidSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleResetPassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      throw new Error(error.message);
    }

    setIsPasswordUpdated(true);
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 shadow-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-black">Verificando enlace...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!isValidSession) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Enlace inválido</h1>
            <p className="text-sm text-muted-foreground mb-6">
              El enlace de recuperación es inválido o ha expirado. Por favor, solicita un nuevo enlace.
            </p>
            <a 
              href="/forgot-password" 
              className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 font-medium"
            >
              Solicitar nuevo enlace
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (isPasswordUpdated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">¡Contraseña actualizada!</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Tu contraseña ha sido actualizada exitosamente. Serás redirigido al login en unos segundos.
            </p>
            <a 
              href="/login" 
              className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 font-medium"
            >
              Ir al login
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <ResetPasswordForm onSubmit={handleResetPassword} />
        </div>
      </div>
    </main>
  );
}
