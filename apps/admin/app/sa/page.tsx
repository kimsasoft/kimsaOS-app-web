
import { requireSuperAdmin } from "@/lib/auth";

export default async function SAHome() {
  const { supabase } = await requireSuperAdmin();
  const { data: tenants } = await supabase.from("tenants")
    .select("id,name,slug,domain,created_at").order("created_at", { ascending: false });
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Súper Admin — Tenants</h1>
      <ul className="space-y-2">
        {(tenants ?? []).map((t:any)=> (
          <li key={t.id} className="border p-3 rounded">
            <div className="font-medium">{t.name} ({t.slug})</div>
            <div className="text-sm text-gray-600">{t.domain ?? "sin dominio"}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
