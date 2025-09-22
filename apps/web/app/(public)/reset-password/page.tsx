"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@repo/ui";
import { ResetPasswordForm } from "../../../../../packages/ui/src/molecules/form/reset-password";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Verificar si hay una sesión válida después del redirect de Supabase
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error obteniendo sesión:", error);
          setSessionError("Enlace inválido o expirado. Solicita un nuevo enlace de recuperación.");
          return;
        }

        if (!session) {
          console.log("No hay sesión activa");
          setSessionError("Enlace inválido o expirado. Solicita un nuevo enlace de recuperación.");
          return;
        }

        console.log("Sesión válida para reset de contraseña");
        setSessionReady(true);
      } catch (err: any) {
        console.error("Error verificando sesión:", err);
        setSessionError("Hubo un error al verificar el enlace. Inténtalo de nuevo.");
      }
    };

    checkSession();

    // También escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session) {
        setSessionReady(true);
        setSessionError(null);
      } else if (event === 'SIGNED_OUT') {
        setSessionReady(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleResetPassword = async (password: string) => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      setPasswordUpdated(true);
    } catch (err: any) {
      console.error("Error actualizando contraseña:", err);
      // El componente ResetPasswordForm maneja los errores internamente
      throw err; // Re-throw para que el componente pueda manejarlo
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (passwordUpdated) {
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
            <h1 className="text-2xl font-bold text-foreground">¡Contraseña actualizada!</h1>
            <p className="text-muted-foreground">
              Tu contraseña ha sido actualizada correctamente. 
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
          </div>

          <Button
            onClick={handleGoToLogin}
            className="w-full"
          >
            Ir al login
          </Button>
        </div>
        </div>
      </main>
    );
  }

  if (sessionError) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 shadow-lg text-center space-y-6">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Enlace inválido</h1>
              <p className="text-muted-foreground">{sessionError}</p>
          </div>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <a href="/forgot-password">
                  Solicitar nuevo enlace
                </a>
              </Button>
              <a
                href="/login"
                className="block text-muted-foreground hover:text-foreground font-medium text-sm"
              >
                Volver al login
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!sessionReady) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 shadow-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Verificando enlace...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <ResetPasswordForm onSubmit={handleResetPassword} loading={loading} />
        </div>
      </div>
    </main>
  );
}