"use client";
import { useState } from "react";
import { Button } from "../../../button";
import { Input } from "../../../input";
import { Label } from "../../../label";
import { Alert } from "../../../alert";
import { Github, Chrome } from "../../../icons";

export interface LoginFormProps {
  onPasswordLogin?: (email: string, password: string) => Promise<void>;
  onMagicLinkLogin?: (email: string) => Promise<void>;
  onOAuthLogin?: (provider: string) => Promise<void>;
  registerHref?: string;
  className?: string;
}

const providers = [
  { 
    id: "google", 
    label: "Continuar con Google"
  },
  { 
    id: "github", 
    label: "Continuar con GitHub"
  },
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
  const [error, setError] = useState<string | null>(null);

  const handlePasswordLogin = async () => {
    if (!email || !password || !onPasswordLogin) return;
    
    setIsLoading(true);
    setError(null); // Limpiar errores anteriores
    
    try {
      await onPasswordLogin(email, password);
    } catch (err) {
      // Siempre mostrar un mensaje de prueba para debugging
      console.log('Error capturado:', err);
      setError('Credenciales incorrectas. Por favor verifica tu correo y contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email || !onMagicLinkLogin) return;
    
    setIsLoading(true);
    setError(null); // Limpiar errores anteriores
    
    try {
      await onMagicLinkLogin(email);
    } catch (err) {
      if (err instanceof Error) {
        setError('Error al enviar el enlace mágico. Por favor intenta de nuevo.');
      } else {
        setError('Ocurrió un error inesperado. Por favor intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: string) => {
    if (!onOAuthLogin) return;
    
    setIsLoading(true);
    setError(null); // Limpiar errores anteriores
    
    try {
      await onOAuthLogin(provider);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Error al iniciar sesión con ${provider}. Por favor intenta de nuevo.`);
      } else {
        setError('Ocurrió un error inesperado. Por favor intenta de nuevo.');
      }
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
        
        {/* Mostrar errores de forma bonita - Actualizado */}
        {error && (
          <div className="mb-6">
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}
        
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
          
          {(onOAuthLogin || onMagicLinkLogin) && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">O continúa con</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {onOAuthLogin && providers.map((provider) => (
                  <Button
                    key={provider.id}
                    variant="outline"
                    className="w-full h-11 border-input hover:bg-accent hover:text-accent-foreground font-medium button-enhanced"
                    onClick={() => handleOAuth(provider.id)}
                    disabled={isLoading}
                  >
                    {provider.id === 'github' ? (
                      <Github className="w-5 h-5 mr-2" />
                    ) : (
                      <Chrome className="w-5 h-5 mr-2" />
                    )}
                    {provider.label}
                  </Button>
                ))}
                
                {onMagicLinkLogin && (
                  <Button 
                    variant="ghost" 
                    onClick={handleMagicLink}
                    disabled={isLoading || !email}
                    className="w-full h-11 text-muted-foreground hover:text-foreground font-medium button-enhanced"
                  >
                    Enviar enlace mágico
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
        
        {registerHref && (
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
        )}
      </div>
    </div>
  );
}
