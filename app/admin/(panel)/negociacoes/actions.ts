"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createReadClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { site } from "@/lib/site";
import * as T from "@/lib/docs/templates";
import { renderPdf } from "@/lib/docs/render-pdf";
import { renderDocx } from "@/lib/docs/render-docx";

const loja: T.Loja = {
  nome: site.name,
  cnpj: (site as any).cnpj ?? "",
  rua: (site as any).addressStreet ?? site.address,
  numero: (site as any).addressNumber ?? "",
  cidade: site.city,
  uf: site.state,
};

function parse(formData: FormData) {
  const g = (k: string) => String(formData.get(k) ?? "").trim();
  const num = (k: string) => {
    const v = g(k).replace(/[^\d]/g, "");
    return v === "" ? 0 : Number(v);
  };
  const bool = (k: string) => g(k) === "on" || g(k) === "true";
  let pagamentos: T.Pagamento[] = [];
  try { pagamentos = g("pagamentos") ? JSON.parse(g("pagamentos")) : []; } catch { pagamentos = []; }

  const propDif = bool("proprietario_diferente");
  const temTroca = bool("tem_troca");
  const trocaDif = bool("troca_proprietario_diferente");

  return {
    comprador_id: g("comprador_id") || null,
    veiculo_id: g("veiculo_id") || null,
    proprietario_id: propDif ? (g("proprietario_id") || null) : null,
    tem_troca: temTroca,
    avaliacao_id: temTroca ? (g("avaliacao_id") || null) : null,
    troca_proprietario_id: temTroca && trocaDif ? (g("troca_proprietario_id") || null) : null,
    valor: num("valor"),
    pagamentos,
    status: g("status") || "aberta",
    observacoes: g("observacoes") || null,
  };
}

export async function createNegociacao(_prev: unknown, formData: FormData) {
  const sb = await createReadClient();
  const row = parse(formData);
  if (!row.comprador_id) return { error: "Selecione o comprador." };
  if (!row.veiculo_id) return { error: "Selecione o veículo." };
  const { data, error } = await sb.from("negociacoes").insert(row).select("id").single();
  if (error) return { error: error.message };
  revalidatePath("/admin/negociacoes");
  redirect(`/admin/negociacoes/${data.id}`);
}

export async function updateNegociacao(id: string, _prev: unknown, formData: FormData) {
  const sb = await createReadClient();
  const row = parse(formData);
  if (!row.comprador_id) return { error: "Selecione o comprador." };
  if (!row.veiculo_id) return { error: "Selecione o veículo." };
  const { error } = await sb.from("negociacoes").update(row).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/negociacoes");
  redirect(`/admin/negociacoes/${id}`);
}

export async function setNegociacaoStatus(id: string, status: string) {
  const sb = await createReadClient();
  await sb.from("negociacoes").update({ status }).eq("id", id);
  revalidatePath("/admin/negociacoes");
  revalidatePath(`/admin/negociacoes/${id}`);
}

export async function deleteNegociacao(id: string) {
  const sb = await createReadClient();
  await sb.from("negociacoes").delete().eq("id", id);
  revalidatePath("/admin/negociacoes");
  redirect("/admin/negociacoes");
}

function kebab(s: string) {
  return s.toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Criação rápida de cliente direto da negociação.
export async function quickCliente(payload: { nome: string; cpf?: string; telefone?: string }) {
  const sb = await createReadClient();
  if (!payload.nome?.trim()) return { error: "Informe o nome." };
  const { data, error } = await sb.from("clientes")
    .insert({ nome: payload.nome.trim(), cpf: payload.cpf || null, telefone: payload.telefone || null })
    .select("id, nome").single();
  if (error) return { error: error.message };
  revalidatePath("/admin/clientes");
  return { id: data.id as string, label: data.nome as string };
}

// Criação rápida de veículo direto da negociação.
export async function quickVeiculo(payload: { marca: string; modelo: string; ano_modelo?: string; preco?: string }) {
  const sb = await createReadClient();
  if (!payload.marca?.trim() || !payload.modelo?.trim()) return { error: "Informe marca e modelo." };
  const ano = payload.ano_modelo ? Number(String(payload.ano_modelo).replace(/[^\d]/g, "")) || null : null;
  const preco = payload.preco ? Number(String(payload.preco).replace(/[^\d]/g, "")) || 0 : 0;
  const slug = kebab(`${payload.marca}-${payload.modelo}-${ano ?? ""}`) + "-" + Math.random().toString(36).slice(2, 7);
  const { data, error } = await sb.from("veiculos")
    .insert({ marca: payload.marca.trim(), modelo: payload.modelo.trim(), ano_modelo: ano, preco, status: "disponivel", origem: "compra", slug })
    .select("id, marca, modelo, ano_modelo").single();
  if (error) return { error: error.message };
  revalidatePath("/admin/estoque");
  return { id: data.id as string, label: `${data.marca} ${data.modelo} ${data.ano_modelo ?? ""}`.trim() };
}

const avalToVeiculo = (a: any): T.Veiculo => ({
  marca: a?.marca, modelo: a?.modelo, versao: a?.versao,
  ano_fab: a?.ano_fab, ano_modelo: a?.ano_modelo, cor: a?.cor,
  placa: a?.placa, renavam: a?.renavam, chassi: a?.chassi,
});

// Gera um documento já preenchido a partir da negociação e o vincula a ela.
export async function gerarDocNegociacao(negId: string, tipo: string): Promise<void> {
  const read = await createReadClient();
  const { data: neg } = await read.from("negociacoes").select("*").eq("id", negId).single();
  if (!neg) return;

  const one = (table: string, id?: string | null) =>
    id ? read.from(table).select("*").eq("id", id).single() : Promise.resolve({ data: null });
  const [comp, prop, trocaProp, vei, aval] = await Promise.all([
    one("clientes", neg.comprador_id),
    one("clientes", neg.proprietario_id),
    one("clientes", neg.troca_proprietario_id),
    one("veiculos", neg.veiculo_id),
    one("avaliacoes", neg.avaliacao_id),
  ]);
  const comprador = (comp.data ?? {}) as T.Cliente;
  const veiculo = (vei.data ?? {}) as T.Veiculo;

  let doc: T.Doc;
  let veiculoIdDoc: string | null = neg.veiculo_id;

  if (tipo === "contrato") {
    const extra: T.Extra = { valor: neg.valor ? String(neg.valor) : "", pagamentos: neg.pagamentos ?? [] };
    doc = T.contrato(loja, comprador, veiculo, extra);
  } else if (tipo === "procuracao") {
    if (!prop.data) return; // botão só aparece quem tem proprietário de terceiro
    doc = T.procuracao(loja, prop.data as T.Cliente, comprador, veiculo);
  } else if (tipo === "procuracao_troca") {
    if (!aval.data) return;
    const outorgante = (trocaProp.data ?? comp.data) as T.Cliente;
    doc = T.procuracao(loja, outorgante, comprador, avalToVeiculo(aval.data));
    veiculoIdDoc = null;
  } else if (tipo === "declaracao_residencia") {
    doc = T.residencia(loja, comprador);
    veiculoIdDoc = null;
  } else {
    return;
  }

  const [pdf, docx] = await Promise.all([renderPdf(doc), renderDocx(doc)]);
  const admin = createAdminClient();
  const base = `${tipo}/${crypto.randomUUID()}`;
  const up1 = await admin.storage.from("documentos").upload(`${base}.pdf`, pdf, { contentType: "application/pdf" });
  const up2 = await admin.storage.from("documentos").upload(`${base}.docx`, docx, {
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  if (up1.error || up2.error) throw new Error("Falha ao salvar: " + (up1.error?.message || up2.error?.message));

  const { error } = await admin.from("documentos").insert({
    tipo: tipo === "procuracao_troca" ? "procuracao" : tipo,
    titulo: doc.titulo,
    cliente_id: neg.comprador_id,
    veiculo_id: veiculoIdDoc,
    negociacao_id: negId,
    pdf_path: `${base}.pdf`,
    docx_path: `${base}.docx`,
    dados: { negociacao: neg, doc: doc.titulo },
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/negociacoes/${negId}`);
  revalidatePath("/admin/documentos");
}
