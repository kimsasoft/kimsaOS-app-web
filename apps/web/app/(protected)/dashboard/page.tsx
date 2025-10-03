"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "../../../components/molecules/PageHeader";
import { showErrorNotification } from "@repo/ui";
import { useLoading } from "../../../contexts/LoadingContext";
import { Button } from "@repo/ui";

export default function Dashboard() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showLoading, hideLoading } = useLoading();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === '403') {
      return;
    }
    loadDashboardData();
  }, [searchParams]);

  const loadDashboardData = async () => {
    showLoading();
    try {
      await fetch("/api/user/profile", { method: "POST" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      hideLoading();
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      document.cookie =
        "tenant_slug=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/login");
    } catch (error) {
      showErrorNotification("Error al cerrar sesión");
    }
  };

  const errorParam = searchParams.get('error');
  
  if (errorParam === '403') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-white mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Página no encontrada
            </h2>
            <p className="text-white">
              No tienes permisos para acceder a esta página.
            </p>
          </div>
        </div>
      </div>
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
