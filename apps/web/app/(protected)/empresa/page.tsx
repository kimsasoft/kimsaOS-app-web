"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/molecules/PageHeader";
import { InfoCard } from "@/components/molecules/InfoCard";
import { Building, Users, Edit, Settings } from "lucide-react";

interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  company: Company;
  created_at: string;
}

export default function Empresa() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      console.log('🔄 Cargando datos de la empresa...');
      
      // Primero asegurar que el perfil existe
      await fetch("/api/user/profile", { method: "POST" });

      // Cargar información del tenant del usuario usando la nueva API
      const tenantResponse = await fetch("/api/user/tenant");
      if (!tenantResponse.ok) {
        const errorData = await tenantResponse.json();
        console.error('❌ Error cargando tenant:', errorData);
        throw new Error(errorData.error || "No se pudo cargar la información del tenant");
      }
      const tenantData = await tenantResponse.json();
      console.log('✅ Datos del tenant cargados:', tenantData);
      setTenant(tenantData.tenant);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Limpiar cookies de tenant
      document.cookie =
        "tenant_slug=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleEditCompany = () => {
    console.log("Editando información de la empresa...");
  };

  if (loading) {
    return (
      <main className="p-6">
        <div>Cargando información de la empresa...</div>
      </main>
    );
  }

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
        <div>Información de la empresa no encontrada</div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Empresa"
        description="Información de tu empresa y workspace"
        action={{
          label: "Cerrar Sesión",
          onClick: handleLogout,
          variant: "outline",
          className: "bg-red-500 text-white hover:bg-red-600 border-red-500"
        }}
      />

      {/* Información de la empresa y workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <InfoCard
          title="Información de la Empresa"
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
          title="Configuración del Workspace"
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