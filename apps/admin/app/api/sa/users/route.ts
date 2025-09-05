import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth";

const schema = z.object({
  userId: z.string().uuid(),
  isSuperAdmin: z.boolean(),
});

export async function PATCH(req: Request) {
  const { supabase, user: actor } = await requireSuperAdmin();
  const input = schema.parse(await req.json());
  if (input.userId === actor.id) {
    return NextResponse.json(
      { error: "No puedes modificarte a ti mismo" },
      { status: 400 }
    );
  }
  const { error } = await supabase
    .from("profiles")
    .update({ is_super_admin: input.isSuperAdmin })
    .eq("user_id", input.userId);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("audit_logs").insert({
    actor: actor.id,
    action: "set_super_admin",
    target_type: "user",
    target_id: input.userId,
    metadata: { to: input.isSuperAdmin },
  });
  return NextResponse.json({ ok: true });
}
