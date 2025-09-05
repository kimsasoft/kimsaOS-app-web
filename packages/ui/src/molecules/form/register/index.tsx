"use client";
import { useState } from "react";
import { Button } from "../../../button";
import { Input } from "../../../input";
import { Label } from "../../../label";

export interface RegisterFormProps {
  onRegister?: (email: string, password: string, fullName: string) => Promise<void>;
  loginHref?: string;
  className?: string;
}

export function RegisterForm({
  onRegister,
  loginHref = "/login",
  className = "",
}: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPwd] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !fullName || !onRegister) return;
    setIsLoading(true);
    try {
      await onRegister(email, password, fullName);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-card border border-border rounded-lg p-8 shadow-lg card-enhanced">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Crear cuenta</h1>
          <p className="text-sm text-muted-foreground">Únete a nuestra plataforma</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full" className="text-sm font-medium text-foreground">
              Nombre completo
            </Label>
            <Input
              id="full"
              placeholder="Tu nombre completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              className="h-11 px-3 bg-background border-input focus:border-ring focus:ring-1 focus:ring-ring input-enhanced"
            />
          </div>
          
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
              placeholder="Crea una contraseña segura"
              value={password}
              onChange={(e) => setPwd(e.target.value)}
              disabled={isLoading}
              className="h-11 px-3 bg-background border-input focus:border-ring focus:ring-1 focus:ring-ring input-enhanced"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Debe tener al menos 8 caracteres
            </p>
          </div>
          
          <Button 
            onClick={handleRegister} 
            className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium mt-6 button-enhanced"
            disabled={isLoading || !email || !password || !fullName}
          >
            {isLoading ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
          
          <div className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
            Al crear una cuenta, aceptas nuestros{" "}
            <a href="#" className="text-primary hover:underline">
              Términos de Servicio
            </a>{" "}
            y{" "}
            <a href="#" className="text-primary hover:underline">
              Política de Privacidad
            </a>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <a 
              className="text-primary hover:underline font-medium" 
              href={loginHref}
            >
              Iniciar sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
