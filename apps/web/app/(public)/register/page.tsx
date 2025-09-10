"use client";
import { useState } from "react";
import { supabase } from "@repo/supabase";
import { Button, Input, Label } from "@repo/ui";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPwd] = useState("");
  const [fullName, setFullName] = useState("");

  const onRegister = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) return alert(error.message);
    location.href = "/onboarding";
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Crear cuenta
            </h1>
            <p className="text-sm text-muted-foreground">
              Únete a nuestra plataforma
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="full"
                className="text-sm font-medium text-foreground"
              >
                Nombre completo
              </Label>
              <Input
                id="full"
                placeholder="Tu nombre completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 px-3 bg-background border-input focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 px-3 bg-background border-input focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Crea una contraseña segura"
                value={password}
                onChange={(e) => setPwd(e.target.value)}
                className="h-11 px-3 bg-background border-input focus:border-ring focus:ring-1 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Debe tener al menos 8 caracteres
              </p>
            </div>

            <Button
              onClick={onRegister}
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium mt-6"
            >
              Crear cuenta
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
                href="/login"
              >
                Iniciar sesión
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
