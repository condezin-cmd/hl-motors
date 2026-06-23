"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMe, type Role } from "@/lib/admin/auth";

const ROLES: Role[] = ["gestor", "admin", "vendedor"];

async function ensureGestor() {
  const me = await getMe();
  if (!me || me.role !== "gestor") throw new Error("Sem permissão.");
  return me;
}

export async function createUser(_prev: unknown, formData: FormData) {
  await ensureGestor();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const nome = String(formData.get("nome") || "").trim();
  const role = String(formData.get("role") || "vendedor") as Role;

  if (!email || password.length < 6)
    return { error: "Informe e-mail e senha (mín. 6 caracteres)." };
  if (!ROLES.includes(role)) return { error: "Papel inválido." };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome },
  });
  if (error) return { error: error.message };

  await admin
    .from("profiles")
    .update({ role, nome: nome || email })
    .eq("id", data.user.id);

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function setRole(userId: string, role: Role) {
  const me = await ensureGestor();
  if (userId === me.id) return; // não rebaixa a si mesmo
  if (!ROLES.includes(role)) return;
  const admin = createAdminClient();
  await admin.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/admin/usuarios");
}

export async function deleteUser(userId: string) {
  const me = await ensureGestor();
  if (userId === me.id) return; // não exclui a si mesmo
  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(userId);
  revalidatePath("/admin/usuarios");
}
