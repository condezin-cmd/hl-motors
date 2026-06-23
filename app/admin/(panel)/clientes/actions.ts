"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createReadClient } from "@/lib/supabase/server";

const fields = [
  "nome", "cpf", "rg", "orgao_emissor", "data_nascimento", "nacionalidade",
  "estado_civil", "profissao", "telefone", "email", "cep", "logradouro",
  "numero", "complemento", "bairro", "cidade", "uf", "observacoes",
] as const;

function parse(formData: FormData) {
  const row: Record<string, unknown> = {};
  for (const f of fields) {
    const v = String(formData.get(f) ?? "").trim();
    row[f] = v === "" ? null : v;
  }
  try {
    const raw = String(formData.get("arquivos") ?? "");
    row.arquivos = raw ? JSON.parse(raw) : [];
  } catch {
    row.arquivos = [];
  }
  return row;
}

export async function createCliente(_prev: unknown, formData: FormData) {
  const supabase = await createReadClient();
  const { error } = await supabase.from("clientes").insert(parse(formData));
  if (error) return { error: error.message };
  revalidatePath("/admin/clientes");
  redirect("/admin/clientes");
}

export async function updateCliente(id: string, _prev: unknown, formData: FormData) {
  const supabase = await createReadClient();
  const { error } = await supabase.from("clientes").update(parse(formData)).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/clientes");
  redirect("/admin/clientes");
}

export async function deleteCliente(id: string) {
  const supabase = await createReadClient();
  await supabase.from("clientes").delete().eq("id", id);
  revalidatePath("/admin/clientes");
}
