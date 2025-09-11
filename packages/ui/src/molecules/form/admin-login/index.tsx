"use client";
import { useState } from "react";
import { Button } from "../../../button";
import { Input } from "../../../input";
import { Label } from "../../../label";

export interface AdminLoginFormProps {
  onPasswordLogin?: (email: string, password: string) => Promise<void>;
  className?: string;
}

export function AdminLoginForm({
  onPasswordLogin,
  className = "",
}: AdminLoginFormProps) {
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

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-card border border-border rounded-lg p-8 shadow-lg card-enhanced">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Súper Admin</h1>
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
        </div>
      </div>
    </div>
  );
}
