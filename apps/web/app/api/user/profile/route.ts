import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@repo/database";
import { supabaseServer } from "@repo/supabase";
import { handleApiError, checkAuth } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { error, userId } = checkAuth(headers());
    if (error) return error;

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

    return NextResponse.json({ profile });
  } catch (error: any) {
    return handleApiError(error, "/api/user/profile GET");
  }
}

export async function POST() {
  try {
    const { error, userId } = checkAuth(headers());
    if (error) return error;
    
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

    let profile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

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
    return handleApiError(error, "/api/user/profile POST");
  }
}
