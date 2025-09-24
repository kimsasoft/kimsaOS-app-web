"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { InfoCard } from "@/components/molecules/InfoCard";
import { Building, Users } from "lucide-react";
import { Tenant } from "@/types/company";
import { useLoading } from "../../../contexts/LoadingContext";

export default function Company() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    showLoading();
    try {
      await fetch("/api/user/profile", { method: "POST" });

      const tenantResponse = await fetch("/api/user/tenant");
      if (!tenantResponse.ok) {
        const errorData = await tenantResponse.json();
        throw new Error(errorData.error || "No se pudo cargar la información del tenant");
      }
      const tenantData = await tenantResponse.json();
      setTenant(tenantData.tenant);
    } catch (err: any) {
      setError(err.message);
    } finally {
      hideLoading();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "tenant_slug=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  const handleEditCompany = () => {
    
  };

  if (error) {
    return (
      <main className="p-6">
        <div className="text-red-600">Error: {error}</div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Cerrar Sesión
        </button>
      </main>
    );
  }

  if (!tenant) {
    return (
      <main className="p-6">
        <div>Información no encontrada</div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Company"
        description="Información de tu empresa y workspace"
        action={{
          label: "Cerrar Sesión",
          onClick: handleLogout,
          variant: "outline",
          className: "bg-red-500 text-white hover:bg-red-600 border-red-500"
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <InfoCard
          title="Company Information"
          icon={Building}
          iconColor="text-white"
          iconBgColor="bg-blue-500"
          action={{
            label: "Editar",
            onClick: handleEditCompany
          }}
        >
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Nombre:</span>
              <p className="text-foreground">{tenant.company.name}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-muted-foreground">Email:</span>
              <p className="text-foreground">{tenant.company.email || 'No configurado'}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-muted-foreground">Teléfono:</span>
              <p className="text-foreground">{tenant.company.phone || 'No configurado'}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-muted-foreground">Dirección:</span>
              <p className="text-foreground">{tenant.company.address || 'No configurado'}</p>
            </div>

            <div>
              <span className="text-sm font-medium text-muted-foreground">Fecha de creación:</span>
              <p className="text-foreground">
                {new Date(tenant.company.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </InfoCard>

        <InfoCard
          title="Workspace Settings"
          icon={Users}
          iconColor="text-white"
          iconBgColor="bg-green-500"
        >
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Nombre:</span>
              <p className="text-foreground">{tenant.name}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-muted-foreground">URL:</span>
              <p className="text-foreground font-mono bg-muted px-2 py-1 rounded text-sm">
                /{tenant.slug}
              </p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-muted-foreground">Estado:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                tenant.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {tenant.status === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div>
              <span className="text-sm font-medium text-muted-foreground">Creado:</span>
              <p className="text-foreground">
                {new Date(tenant.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </InfoCard>
      </div>
    </main>
  );
}
