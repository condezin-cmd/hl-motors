"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createReadClient } from "@/lib/supabase/server";
import { moverParaLixeira } from "@/lib/lixeira";

export async function setLeadStatus(id: string, status: string) {
  const sb = await createReadClient();
  await sb.from("leads").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/leads");
}

export async function deleteLead(id: string) {
  const sb = await createReadClient();
  await moverParaLixeira(sb, "leads", id);
  revalidatePath("/admin/leads");
}

export async function criarLeadManual(formData: FormData) {
  const sb = await createReadClient();
  const g = (k: string) => String(formData.get(k) ?? "").trim();
  if (!g("nome")) redirect("/admin/leads?erro=Informe%20o%20nome.");
  await sb.from("leads").insert({
    origem: g("origem") || "manual",
    nome: g("nome"),
    telefone: g("telefone") || null,
    email: g("email") || null,
    veiculo_texto: g("veiculo_texto") || null,
    mensagem: g("mensagem") || null,
    status: "novo",
  });
  revalidatePath("/admin/leads");
  redirect("/admin/leads");
}

// Converte o lead em negociação: cria (ou reaproveita) o cliente e abre a venda.
export async function converterLead(id: string) {
  const sb = await createReadClient();
  const { data: lead } = await sb.from("leads").select("*").eq("id", id).single();
  if (!lead) redirect("/admin/leads?erro=Lead%20n%C3%A3o%20encontrado.");

  // reaproveita cliente pelo telefone, senão cria
  let compradorId: string | null = null;
  const tel = (lead.telefone ?? "").replace(/\D/g, "");
  if (tel) {
    const { data: existentes } = await sb.from("clientes").select("id, telefone");
    const hit = (existentes ?? []).find((c: any) => (c.telefone ?? "").replace(/\D/g, "") === tel);
    compradorId = hit?.id ?? null;
  }
  if (!compradorId) {
    const { data: novo } = await sb
      .from("clientes")
      .insert({ nome: lead.nome || "Cliente do lead", telefone: lead.telefone || null, email: lead.email || null })
      .select("id")
      .single();
    compradorId = novo?.id ?? null;
  }

  // valor sugerido = preço do carro de interesse
  let valor = 0;
  if (lead.veiculo_id) {
    const { data: v } = await sb.from("veiculos").select("preco").eq("id", lead.veiculo_id).single();
    valor = Number(v?.preco) || 0;
  }

  const { data: neg } = await sb
    .from("negociacoes")
    .insert({ comprador_id: compradorId, veiculo_id: lead.veiculo_id || null, status: "aberta", valor })
    .select("id")
    .single();

  if (neg?.id) {
    await sb.from("leads").update({ status: "negociacao", negociacao_id: neg.id, updated_at: new Date().toISOString() }).eq("id", id);
    revalidatePath("/admin/leads");
    revalidatePath("/admin/negociacoes");
    redirect(`/admin/negociacoes/${neg.id}`);
  }
  redirect("/admin/leads?erro=N%C3%A3o%20consegui%20abrir%20a%20negocia%C3%A7%C3%A3o.");
}
