import { createAdminClient } from "@/lib/supabase/admin";
import { UsuariosManager } from "@/components/admin/UsuariosManager";

// A middleware garante que só o gestor acessa /admin/usuarios (em GET).
// Não chamamos getUser no render para não quebrar os Server Actions.
export default async function UsuariosPage() {
  const admin = createAdminClient();
  const { data: list } = await admin.auth.admin.listUsers();
  const { data: profiles } = await admin.from("profiles").select("id, nome, role");
  const pmap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const users = (list?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email ?? "",
    nome: pmap.get(u.id)?.nome ?? "",
    role: (pmap.get(u.id)?.role ?? "vendedor") as "gestor" | "admin" | "vendedor",
    created: u.created_at,
  }));

  return <UsuariosManager users={users} />;
}
