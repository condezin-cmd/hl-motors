"use server";

import { createReadClient } from "@/lib/supabase/server";

export type LeadPublicoInput = {
  nome: string;
  telefone: string;
  email?: string;
  veiculo_id?: string | null;
  veiculo_texto?: string | null;
  mensagem?: string | null;
  origem?: string;
};

const isUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

// No site o "id" do carro é o slug — resolve para o uuid real do estoque.
async function resolverVeiculoId(sb: any, ref?: string | null): Promise<string | null> {
  if (!ref) return null;
  if (isUuid(ref)) return ref;
  const { data } = await sb.from("veiculos").select("id").eq("slug", ref).maybeSingle();
  return data?.id ?? null;
}


// Grava um lead vindo do site público (RLS permite insert anônimo).
export async function registrarLeadPublico(input: LeadPublicoInput): Promise<{ ok: boolean }> {
  const nome = (input.nome ?? "").trim();
  const telefone = (input.telefone ?? "").trim();
  if (!nome || !telefone) return { ok: false };
  try {
    const sb = await createReadClient();
    const veiculoId = await resolverVeiculoId(sb, input.veiculo_id);

    await sb.from("leads").insert({
      origem: input.origem || "site",
      nome,
      telefone,
      email: (input.email ?? "").trim() || null,
      veiculo_id: veiculoId,
      veiculo_texto: (input.veiculo_texto ?? "").trim() || null,
      mensagem: (input.mensagem ?? "").trim() || null,
      status: "novo",
    });
    return { ok: true };
  } catch {
    // Nunca bloquear o contato do cliente por erro de gravação.
    return { ok: false };
  }
}
