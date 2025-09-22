"use client";

import { useState } from "react";
import { Button } from "../../../button";
import { Input } from "../../../input";
import { Label } from "../../../label";
import { Alert } from "../../../alert";

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  loading?: boolean;
  className?: string;
}

export function ForgotPasswordForm({ onSubmit, loading = false, className = "" }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError("El email es requerido");
      return false;
    }
    if (!emailRegex.test(email)) {
      setError("Ingresa un email válido");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateEmail(email)) {
      return;
    }

    try {
      await onSubmit(email.trim());
    } catch (err: any) {
      setError(err.message || "Hubo un error al enviar el email. Inténtalo de nuevo.");
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-card border border-border rounded-lg p-8 shadow-lg card-enhanced">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">¿Olvidaste tu contraseña?</h1>
          <p className="text-sm text-muted-foreground">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu-email@ejemplo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              disabled={loading}
              className="h-11 px-3 bg-background border-input focus:border-ring focus:ring-1 focus:ring-ring input-enhanced"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium button-enhanced"
            disabled={loading || !email.trim()}
          >
            {loading ? "Enviando..." : "Enviar enlace de recuperación"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Recordaste tu contraseña?{" "}
            <a href="/login" className="text-primary hover:underline font-medium">
              Volver al login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}