"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { showErrorNotification, showSuccessNotification } from "@repo/ui";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { OnboardingStep } from "./components/OnboardingStep";
import { CompanyForm } from "./components/CompanyForm";
import { WorkspaceForm } from "./components/WorkspaceForm";

interface OnboardingData {
  // Company fields
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  
  // Tenant fields
  tenantName: string;
  tenantSlug: string;
}

export default function Onboarding() {
  const [loading, setLoading] = useState(true);
  const [hasMembership, setHasMembership] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState(1);
  
  const [data, setData] = useState<OnboardingData>({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    tenantName: "",
    tenantSlug: ""
  });
  
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

  const nextStep = () => {
    if (step === 1) {
      // Validate required fields for step 1
      if (!data.companyName || !data.companyEmail) {
        showErrorNotification("Por favor completa todos los campos obligatorios");
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    // Validación básica
    if (!data.companyName.trim()) {
      setError("El nombre de la empresa es requerido");
      setCreating(false);
      return;
    }

    if (!data.tenantSlug.trim()) {
      setError("El slug es requerido");
      setCreating(false);
      return;
    }

    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Establecer cookie del tenant para localhost
        if (result.data?.tenant?.slug) {
          document.cookie = `tenant_slug=${result.data.tenant.slug}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 días
        }
        
        showSuccessNotification("¡Empresa creada exitosamente!");
        router.push("/dashboard");
      } else {
        setError(result.error || "Error desconocido");
        
        // Si el slug ya existe, generar uno nuevo
        if (result.error?.includes("slug") && result.error?.includes("ya está en uso")) {
          const timestamp = Date.now().toString().slice(-4);
          setData(prev => ({
            ...prev,
            tenantSlug: prev.tenantSlug + "-" + timestamp
          }));
          setError(result.error + ` Intenta con: ${data.tenantSlug}-${timestamp}`);
        }
      }
    } catch (error) {
      setError("Error de conexión. Por favor intenta de nuevo.");
      showErrorNotification("Error de conexión. Por favor intenta de nuevo.");
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

  // Handle data changes
  const handleDataChange = (field: string, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug and sync tenant name when company name changes
    if (field === 'companyName') {
      const newSlug = generateSlug(value);
      setData(prev => ({ 
        ...prev, 
        companyName: value,
        tenantName: value, // Auto-sync tenant name
        tenantSlug: newSlug 
      }));
    }
    
    setError(""); // Limpiar errores cuando se cambie cualquier input
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-card rounded-lg shadow-sm border border-border p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Configura tu empresa
            </h1>
            <p className="text-muted-foreground">
              Completa la información de tu empresa para comenzar.
            </p>
          </div>
          
          <ProgressIndicator 
            currentStep={step} 
            totalSteps={2}
            stepLabels={["Información básica", "Configuración avanzada"]}
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            {step === 1 && (
              <OnboardingStep 
                title="Información básica"
                description="Proporciona los datos principales de tu empresa"
              >
                <CompanyForm
                  data={{
                    companyName: data.companyName,
                    companyEmail: data.companyEmail,
                    companyPhone: data.companyPhone
                  }}
                  onChange={handleDataChange}
                  onNext={nextStep}
                  disabled={creating}
                />
              </OnboardingStep>
            )}

            {step === 2 && (
              <OnboardingStep 
                title="Configuración del workspace"
                description="Define cómo funcionará tu espacio de trabajo"
              >
                <WorkspaceForm
                  data={{
                    companyAddress: data.companyAddress,
                    tenantName: data.tenantName,
                    tenantSlug: data.tenantSlug
                  }}
                  onChange={handleDataChange}
                  onPrevious={prevStep}
                  onSubmit={() => {
                    const form = document.querySelector('form') as HTMLFormElement;
                    if (form) {
                      const event = new Event('submit', { bubbles: true, cancelable: true });
                      form.dispatchEvent(event);
                    }
                  }}
                  generating={creating}
                  disabled={creating}
                  generateSlug={generateSlug}
                />
              </OnboardingStep>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
