// Main exports - pre-configured clients
export { supabase } from "./client"; // For client components
export { supabaseServer } from "./server"; // For server components
export { createServerSupabase } from "./client"; // For custom server implementations

// Legacy exports (for backwards compatibility)
export { supabaseBrowser, supabaseServerLegacy } from "./client";
