import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@repo/database";
import { supabaseServer } from "@repo/supabase";

export async function GET() {
  // Obtener user ID del header establecido por el middleware
  const h = headers();
  const userId = h.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        is_super_admin: true,
        created_at: true,
      },
    });

    return NextResponse.json({ profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  // Obtener user ID del header establecido por el middleware
  const h = headers();
  const userId = h.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    // Crear o actualizar el perfil del usuario
    const profile = await prisma.profile.upsert({
      where: { id: userId },
      update: {
        email: user.email!,
        full_name:
          user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      },
      create: {
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
      },
    });

    return NextResponse.json({ profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
