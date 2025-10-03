
"use client";
import { requireSuperAdmin } from "@/lib/auth";
import { supabase } from "@repo/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SAHome() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const { data } = await supabase.from("tenants")
        .select("id,name,slug,domain,created_at")
        .order("created_at", { ascending: false });
      setTenants(data || []);
    } catch (error) {
      console.error("Error loading tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <main className="p-6">
        <div>Cargando...</div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* Header con botón de cerrar sesión */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Súper Admin — Tenants</h1>
          <p className="text-muted-foreground mt-1">Gestiona todos los tenants del sistema</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Lista de tenants */}
      <ul className="space-y-2">
        {tenants.map((t: any) => (
          <li key={t.id} className="border p-3 rounded">
            <div className="font-medium">{t.name} ({t.slug})</div>
            <div className="text-sm text-gray-600">{t.domain ?? "sin dominio"}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
