"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { PageHeader } from "../../../components/molecules/PageHeader";
import { showErrorNotification } from "@repo/ui";

export default function Dashboard() {
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
      // Solo verificar autenticación
      await fetch("/api/user/profile", { method: "POST" });
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

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Dashboard"
        action={{
          label: "Cerrar Sesión",
          onClick: handleLogout,
          variant: "outline",
          className: "bg-red-500 text-white hover:bg-red-600 border-red-500"
        }}
      />
    </main>
  );
}
