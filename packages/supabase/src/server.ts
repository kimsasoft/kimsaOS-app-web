import { cookies } from "next/headers";
import { createServerSupabase } from "./client";

// Pre-configured server client with Next.js cookies
export const supabaseServer = () => {
  const store = cookies();
  return createServerSupabase((name) => store.get(name)?.value);
};
