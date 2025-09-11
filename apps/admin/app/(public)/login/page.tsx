"use client";
import { useState } from "react";
import { supabase } from "@repo/supabase";
import { Button, Input, Label } from "@repo/ui";

const providers = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
] as const;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPwd] = useState("");

  const onPwd = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return alert(error.message);
    location.href = "/sa";
  };

  const onOAuth = async (provider: string) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) alert(error.message);
  };

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-sm border rounded-lg p-6 bg-card shadow-sm">
        <h1 className="text-xl font-semibold mb-4">Súper Admin — Login</h1>
        <div className="space-y-2 mb-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2 mb-4">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPwd(e.target.value)}
          />
        </div>
        <div className="flex gap-2 mb-4">
          <Button onClick={onPwd}>Entrar</Button>
        </div>
        <div className="space-y-2">
          {providers.map((p) => (
            <Button
              key={p.id}
              variant="outline"
              className="w-full"
              onClick={() => onOAuth(p.id)}
            >
              Continuar con {p.label}
            </Button>
          ))}
        </div>
      </div>
    </main>
  );
}
