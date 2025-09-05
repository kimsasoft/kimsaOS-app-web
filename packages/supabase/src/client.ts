import {
  createBrowserClient,
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";

// Get environment variables with fallbacks
const getEnvVars = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn(
      "⚠️ Supabase environment variables not configured. Using placeholder values."
    );
    return {
      url: "https://your-project.supabase.co",
      anonKey: "your-anon-key-here",
    };
  }

  return { url, anonKey };
};

// Pre-configured browser client (for client components)
export const supabase = (() => {
  const { url, anonKey } = getEnvVars();
  return createBrowserClient(url, anonKey);
})();

// Function to create server client (for server components)
export const createServerSupabase = (
  getCookie: (name: string) => string | undefined,
  setCookie?: (name: string, value: string, options: CookieOptions) => void
) => {
  const { url, anonKey } = getEnvVars();
  return createServerClient(url, anonKey, {
    cookies: { get: getCookie, set: setCookie },
  });
};

// Legacy exports (for backwards compatibility)
export const supabaseBrowser = (url: string, anonKey: string) =>
  createBrowserClient(url, anonKey);

export const supabaseServerLegacy = (
  url: string,
  anonKey: string,
  getCookie: (name: string) => string | undefined,
  setCookie?: (name: string, value: string, options: CookieOptions) => void
) =>
  createServerClient(url, anonKey, {
    cookies: { get: getCookie, set: setCookie },
  });
