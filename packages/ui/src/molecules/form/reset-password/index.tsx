"use client";

import { useState } from "react";
import { Button } from "../../../button";
import { Input } from "../../../input";
import { Label } from "../../../label";
import { Alert } from "../../../alert";
import { Eye, EyeOff } from "lucide-react";

interface ResetPasswordFormProps {
  onSubmit: (password: string) => Promise<void>;
  loading?: boolean;
  className?: string;
}

export function ResetPasswordForm({ onSubmit, loading = false, className = "" }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePasswords = (): boolean => {
    if (!password) {
      setError("La contraseña es requerida");
      return false;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (!confirmPassword) {
      setError("Confirma tu contraseña");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validatePasswords()) {
      return;
    }

    try {
      await onSubmit(password);
    } catch (err: any) {
      setError(err.message || "Hubo un error al actualizar la contraseña. Inténtalo de nuevo.");
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-card border border-border rounded-lg p-8 shadow-lg card-enhanced">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Restablecer contraseña</h1>
          <p className="text-sm text-muted-foreground">
            Ingresa tu nueva contraseña para completar el proceso.
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
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Nueva contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                disabled={loading}
                className="h-11 px-3 pr-10 bg-background border-input focus:border-ring focus:ring-1 focus:ring-ring input-enhanced"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
              Confirmar contraseña
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                disabled={loading}
                className="h-11 px-3 pr-10 bg-background border-input focus:border-ring focus:ring-1 focus:ring-ring input-enhanced"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium button-enhanced"
            disabled={loading || !password || !confirmPassword}
          >
            {loading ? "Actualizando..." : "Actualizar contraseña"}
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