"use client";
import { useState } from "react";
import { Button } from "../../../button";
import { Input } from "../../../input";
import { Label } from "../../../label";

export interface LoginFormProps {
  onPasswordLogin?: (email: string, password: string) => Promise<void>;
  onMagicLinkLogin?: (email: string) => Promise<void>;
  onOAuthLogin?: (provider: string) => Promise<void>;
  registerHref?: string;
  className?: string;
}

const providers = [
  { id: "google", label: "Continuar con Google" },
  { id: "github", label: "Continuar con GitHub" },
] as const;

export function LoginForm({
  onPasswordLogin,
  onMagicLinkLogin,
  onOAuthLogin,
  registerHref = "/register",
  className = "",
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPwd] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordLogin = async () => {
    if (!email || !password || !onPasswordLogin) return;
    setIsLoading(true);
    try {
      await onPasswordLogin(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email || !onMagicLinkLogin) return;
    setIsLoading(true);
    try {
      await onMagicLinkLogin(email);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: string) => {
    if (!onOAuthLogin) return;
    setIsLoading(true);
    try {
      await onOAuthLogin(provider);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-card border border-border rounded-lg p-8 shadow-lg card-enhanced">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Iniciar sesión</h1>
          <p className="text-sm text-muted-foreground">Ingresa a tu cuenta</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="h-11 px-3 bg-background border-input focus:border-ring focus:ring-1 focus:ring-ring input-enhanced"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPwd(e.target.value)}
              disabled={isLoading}
              className="h-11 px-3 bg-background border-input focus:border-ring focus:ring-1 focus:ring-ring input-enhanced"
            />
          </div>
          
          <Button 
            onClick={handlePasswordLogin} 
            disabled={isLoading || !email || !password}
            className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium button-enhanced"
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">O continúa con</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {providers.map((p) => (
              <Button
                key={p.id}
                variant="outline"
                className="w-full h-11 border-input hover:bg-accent hover:text-accent-foreground font-medium button-enhanced"
                onClick={() => handleOAuth(p.id)}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  {p.id === 'github' ? (
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  ) : (
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  )}
                </svg>
                {p.label}
              </Button>
            ))}
            
            <Button 
              variant="ghost" 
              onClick={handleMagicLink}
              disabled={isLoading || !email}
              className="w-full h-11 text-muted-foreground hover:text-foreground font-medium button-enhanced"
            >
              Enviar enlace mágico
            </Button>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <a 
              className="text-primary hover:underline font-medium" 
              href={registerHref}
            >
              Crear cuenta
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
