import { NextResponse } from "next/server";

export function checkDatabaseConfig() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL no configurada");
    return false;
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error("NEXT_PUBLIC_SUPABASE_URL no configurada");
    return false;
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY no configurada");
    return false;
  }
  
  return true;
}

export function checkSupabaseConfig() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.error("Supabase variables not configured");
    return NextResponse.json(
      { error: "Supabase configuration missing" },
      { status: 500 }
    );
  }
  return null;
}

export function handleApiError(error: any, context: string) {
  console.error(`Error in ${context}:`, error);
  return NextResponse.json(
    {
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    },
    { status: 500 }
  );
}

export function checkAuth(headers: Headers) {
  const userId = headers.get("x-user-id");
  if (!userId) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      userId: null,
    };
  }
  return { error: null, userId };
}
