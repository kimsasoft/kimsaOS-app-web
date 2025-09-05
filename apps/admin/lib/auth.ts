import { supabaseServer } from "@repo/supabase";
import { prisma } from "@repo/database";

export async function requireSuperAdmin() {
  // Use regular client - RLS policies already allow super_admin access
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("UNAUTHENTICATED");

  // Use Prisma to check super admin status
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { is_super_admin: true },
  });

  if (!profile?.is_super_admin) throw new Error("FORBIDDEN");

  // Return regular client - RLS policies handle super admin permissions
  return { supabase, user, prisma };
}
