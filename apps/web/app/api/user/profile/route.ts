import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@repo/database";
import { supabaseServer } from "@repo/supabase";
import {
  checkDatabaseConfig,
  handleApiError,
  checkAuth,
} from "@/lib/api-utils";

// Forzar que esta ruta sea dinámica
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("🔍 Profile GET - Iniciando...");
    
    // Verificar configuración
    const dbCheck = checkDatabaseConfig();
    if (dbCheck) {
      console.log("❌ Error de configuración de DB");
      return dbCheck;
    }

    // Verificar autenticación
    const h = headers();
    const userId = h.get("x-user-id");
    console.log("🔍 Profile GET - User ID del header:", userId);
    
    if (!userId) {
      console.log("❌ Profile GET - Sin user ID en header");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔍 Profile GET - Buscando perfil para usuario:", userId);
    
    // Primero, vamos a ver todos los perfiles que existen
    const allProfiles = await prisma.profile.findMany({
      select: { id: true, email: true }
    });
    console.log("🔍 Profile GET - Todos los perfiles:", allProfiles);
    
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        is_super_admin: true,
        created_at: true,
        updated_at: true,
      },
    });

    console.log("✅ Profile GET - Perfil encontrado:", profile ? "Sí" : "No");
    if (profile) {
      console.log("✅ Profile GET - Datos del perfil:", profile);
    }
    return NextResponse.json({ profile });
  } catch (error: any) {
    return handleApiError(error, "/api/user/profile GET");
  }
}

export async function POST() {
  try {
    console.log("🔍 Profile POST - Iniciando...");
    
    // Verificar configuración
    const dbCheck = checkDatabaseConfig();
    if (dbCheck) {
      console.log("❌ Error de configuración de DB");
      return dbCheck;
    }

    // Verificar autenticación
    const h = headers();
    const userId = h.get("x-user-id");
    console.log("🔍 Profile POST - User ID del header:", userId);
    
    if (!userId) {
      console.log("❌ Profile POST - Sin user ID en header");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔍 Profile POST - Obteniendo usuario de Supabase...");
    
    // Obtener datos del usuario de Supabase Auth
    const supabase = supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("🔍 Profile POST - Usuario obtenido:", user ? "Sí" : "No");
    if (userError) {
      console.log("❌ Profile POST - Error de Supabase:", userError);
    }

    if (userError || !user) {
      console.log("❌ Profile POST - Sin datos de usuario");
      return NextResponse.json(
        { error: "Unable to get user data" },
        { status: 401 }
      );
    }

    // Verificar si ya existe un perfil
    console.log("🔍 Profile POST - Verificando si perfil existe para userId:", userId);
    let profile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    console.log("🔍 Profile POST - Perfil existente:", profile ? "Sí" : "No");

    if (!profile) {
      console.log("❌ Profile POST - Perfil no encontrado");
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Solo actualizar el perfil existente
    profile = await prisma.profile.update({
      where: { id: userId },
      data: {
        full_name:
          user.user_metadata?.full_name || user.user_metadata?.name || profile.full_name,
        avatar_url: user.user_metadata?.avatar_url || profile.avatar_url,
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        is_super_admin: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Error in profile API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
