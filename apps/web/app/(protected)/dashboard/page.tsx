"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
}

interface Invoice {
  id: string;
  number: string;
  amount: string;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Primero asegurar que el perfil existe
      await fetch("/api/user/profile", { method: "POST" });

      // Cargar información del tenant actual
      const tenantResponse = await fetch("/api/tenant/current");
      if (!tenantResponse.ok) {
        throw new Error("No se pudo cargar la información del tenant");
      }
      const tenantData = await tenantResponse.json();
      setTenant(tenantData.tenant);

      // Cargar facturas
      const invoicesResponse = await fetch("/api/tenant/invoices");
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json();
        setInvoices(invoicesData.invoices || []);
      }
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
      document.cookie =
        "tenant_domain=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <main className="p-6">
        <div>Cargando dashboard...</div>
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
        <div>Tenant no encontrado</div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Dashboard — {tenant.name}</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-medium mb-4">Facturas</h2>
        {invoices.length === 0 ? (
          <p className="text-gray-500">No hay facturas aún</p>
        ) : (
          <ul className="space-y-2">
            {invoices.map((invoice) => (
              <li
                key={invoice.id}
                className="p-3 border rounded-lg flex justify-between items-center"
              >
                <div>
                  <span className="font-medium">{invoice.number}</span>
                  <span className="ml-2 text-gray-600">${invoice.amount}</span>
                </div>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    invoice.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : invoice.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {invoice.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
