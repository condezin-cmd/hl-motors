import { createReadClient } from "@/lib/supabase/server";

export type Role = "gestor" | "admin" | "vendedor";

export type Me = {
  id: string;
  email: string;
  nome: string;
  role: Role;
};

// Papel + dados do usuário logado (server-side).
export async function getMe(): Promise<Me | null> {
  const supabase = await createReadClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, role")
    .eq("id", user.id)
    .single();

  const raw = (profile?.role as string) ?? "vendedor";
  const role: Role = raw === "lojista" ? "admin" : (raw as Role);
  return {
    id: user.id,
    email: user.email ?? "",
    nome: profile?.nome ?? user.email ?? "",
    role,
  };
}

// Matriz de permissões
const PERMS: Record<string, Role[]> = {
  manageUsers: ["gestor"],
  manageStock: ["gestor", "admin"], // adicionar/editar/excluir veículo, preço
  deleteClient: ["gestor", "admin"],
  vendas: ["gestor", "admin"],
};

export function can(role: Role, perm: keyof typeof PERMS): boolean {
  return PERMS[perm]?.includes(role) ?? false;
}

export const roleLabel: Record<Role, string> = {
  gestor: "Gestor",
  admin: "Admin",
  vendedor: "Vendedor",
};
