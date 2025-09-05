"use client";
import { useEffect, useState } from "react";
import { Button, Input, Label } from "@repo/ui";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const [loading, setLoading] = useState(true);
  const [hasMembership, setHasMembership] = useState(false);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkMemberships();
  }, []);

  const checkMemberships = async () => {
    try {
      // Primero asegurar que el perfil existe
      await fetch("/api/user/profile", { method: "POST" });

      // Luego verificar membresías
      const response = await fetch("/api/user/memberships");
      if (response.ok) {
        const data = await response.json();
        if (data.memberships && data.memberships.length > 0) {
          setHasMembership(true);
          // Redirigir al dashboard después de un breve delay
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Error checking memberships:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          slug: formData.get("slug"),
        }),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating tenant:", error);
      alert("Error al crear el tenant");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div>Cargando...</div>
      </main>
    );
  }

  if (hasMembership) {
    return (
      <main className="p-6 max-w-lg mx-auto">
        <h1 className="text-xl font-semibold mb-2">Ya tienes un tenant</h1>
        <p>Redirigiendo a tu dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 border rounded-lg p-6 bg-card shadow-sm"
      >
        <h1 className="text-xl font-semibold">Crear tu organización</h1>
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            placeholder="Mi Empresa"
            required
            disabled={creating}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            placeholder="miempresa"
            required
            disabled={creating}
          />
        </div>
        <Button type="submit" className="w-full" disabled={creating}>
          {creating ? "Creando..." : "Crear tenant"}
        </Button>
      </form>
    </main>
  );
}
