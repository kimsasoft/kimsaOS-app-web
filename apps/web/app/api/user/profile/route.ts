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
    // Verificar configuración
    const dbCheck = checkDatabaseConfig();
    if (dbCheck) return dbCheck;

    // Verificar autenticación
    const { error: authError, userId } = checkAuth(headers());
    if (authError) return authError;

    const profile = await prisma.profile.findUnique({
      where: { id: userId! },
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
    return handleApiError(error, "/api/user/profile GET");
  }
}

export async function POST() {
  try {
    // Verificar configuración
    const dbCheck = checkDatabaseConfig();
    if (dbCheck) return dbCheck;

    // Verificar autenticación
    const { error: authError, userId } = checkAuth(headers());
    if (authError) return authError;

    // Obtener datos del usuario de Supabase Auth
    const supabase = supabaseServer();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unable to get user data" },
        { status: 401 }
      );
    }

    // Verificar si ya existe un perfil
    let profile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (profile) {
      // Si existe, actualizarlo
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
    } else {
      // Si no existe, crear uno nuevo
      try {
        profile = await prisma.profile.create({
          data: {
            id: userId,
            email: user.email!,
            full_name:
              user.user_metadata?.full_name || user.user_metadata?.name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
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
      } catch (createError: any) {
        // Si falla por email duplicado, buscar el perfil existente
        if (createError.code === 'P2002' && createError.meta?.target?.includes('email')) {
          const existingProfile = await prisma.profile.findUnique({
            where: { email: user.email! },
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
          
          if (existingProfile) {
            return NextResponse.json({ profile: existingProfile });
          }
        }
        throw createError;
      }
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Error in profile API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
