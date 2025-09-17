"use client";
import { useEffect, useState } from "react";
import { Button, Input, Label } from "@repo/ui";
import { useRouter } from "next/navigation";
import { z } from "zod";

// Schema de validación con Zod
const companySchema = z.object({
  name: z.string()
    .min(1, "El nombre de la empresa es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .trim(),
  slug: z.string()
    .min(1, "El slug es requerido")
    .min(2, "El slug debe tener al menos 2 caracteres")
    .max(30, "El slug no puede exceder 30 caracteres")
    .regex(/^[a-z0-9-]+$/, "El slug solo puede contener letras minúsculas, números y guiones")
    .trim()
});

type CompanyFormData = z.infer<typeof companySchema>;

export default function Onboarding() {
  const [loading, setLoading] = useState(true);
  const [hasMembership, setHasMembership] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string>("");
  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkMemberships();
  }, []);

  // Generar slug automáticamente basado en el nombre de la empresa
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Múltiples guiones a uno solo
      .trim()
      .slice(0, 30); // Limitar longitud
  };

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setCompanyName(name);
    setSlug(generateSlug(name));
    setError(""); // Limpiar errores cuando se cambie el input
  };

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
    setError("");

    // Validación con Zod
    try {
      const validatedData = companySchema.parse({
        name: companyName,
        slug: slug
      });

      // Usar datos validados
      const response = await fetch("/api/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: validatedData.name,
          slug: validatedData.slug,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log("✅ Tenant creado exitosamente:", data);
        router.push("/dashboard");
      } else {
        console.error("❌ Error del servidor:", data);
        setError(data.error || "Error desconocido");
        
        // Si el slug ya existe, generar uno nuevo
        if (data.error?.includes("slug") && data.error?.includes("ya está en uso")) {
          const timestamp = Date.now().toString().slice(-4);
          setSlug(slug + "-" + timestamp);
          setError(data.error + ` Intenta con: ${slug}-${timestamp}`);
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        setError(firstError.message);
      } else {
        console.error("❌ Error:", error);
        setError("Error de conexión. Por favor intenta de nuevo.");
      }
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
        
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="name">Nombre de la empresa</Label>
          <Input
            id="name"
            name="name"
            value={companyName}
            onChange={handleCompanyNameChange}
            placeholder="Mi Empresa"
            required
            disabled={creating}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="slug">Identificador único (slug)</Label>
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="mi-empresa"
            required
            disabled={creating}
          />
          <p className="text-xs text-gray-500">
            Se generará automáticamente basado en el nombre
          </p>
        </div>
        
        <Button type="submit" className="w-full" disabled={creating || !companyName.trim()}>
          {creating ? "Creando..." : "Crear organización"}
        </Button>
      </form>
    </main>
  );
}
