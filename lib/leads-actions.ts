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

// Grava um lead vindo do site público (RLS permite insert anônimo).
export async function registrarLeadPublico(input: LeadPublicoInput): Promise<{ ok: boolean }> {
  const nome = (input.nome ?? "").trim();
  const telefone = (input.telefone ?? "").trim();
  if (!nome || !telefone) return { ok: false };
  try {
    const sb = await createReadClient();
    await sb.from("leads").insert({
      origem: input.origem || "site",
      nome,
      telefone,
      email: (input.email ?? "").trim() || null,
      veiculo_id: input.veiculo_id || null,
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
