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

export async function gerarDocumento(_prev: unknown, formData: FormData) {
  const g = (k: string) => String(formData.get(k) ?? "").trim();
  const tipo = g("tipo");
  const clienteId = g("cliente_id");
  const cliente2Id = g("cliente2_id");
  const veiculoId = g("veiculo_id");

  if (!clienteId) return { error: "Selecione o cliente." };
  if ((tipo === "contrato" || tipo === "termo_consignacao") && !veiculoId)
    return { error: "Selecione o veículo." };
  if (tipo === "procuracao" && !cliente2Id)
    return { error: "Selecione o outorgado (quem recebe os poderes)." };

  let pagamentos: T.Pagamento[] = [];
  try {
    const raw = g("pagamentos");
    pagamentos = raw ? JSON.parse(raw) : [];
  } catch {
    pagamentos = [];
  }
  const extra: T.Extra = {
    valor: g("valor"),
    formaPagamento: g("formaPagamento"),
    pagamentos,
    comissao: g("comissao"),
    telefone: g("telefone"),
    observacoes: g("observacoes"),
  };

  const read = await createReadClient();
  const fetchOne = (table: string, id: string) =>
    id ? read.from(table).select("*").eq("id", id).single() : Promise.resolve({ data: null });
  const [cli, cli2, vei] = await Promise.all([
    fetchOne("clientes", clienteId),
    fetchOne("clientes", cliente2Id),
    fetchOne("veiculos", veiculoId),
  ]);
  const cliente = cli.data as T.Cliente;
  const cliente2 = (cli2.data ?? cliente) as T.Cliente;
  const veiculo = (vei.data ?? {}) as T.Veiculo;

  let doc: T.Doc;
  if (tipo === "contrato") doc = T.contrato(loja, cliente, veiculo, extra);
  else if (tipo === "procuracao") doc = T.procuracao(loja, cliente, cliente2, veiculo);
  else if (tipo === "termo_consignacao") doc = T.consignacao(loja, cliente, veiculo, extra);
  else if (tipo === "declaracao_residencia") doc = T.residencia(loja, cliente);
  else return { error: "Tipo de documento inválido." };

  let pdf: Buffer, docx: Buffer;
  try {
    [pdf, docx] = await Promise.all([renderPdf(doc), renderDocx(doc)]);
  } catch (e) {
    return { error: "Falha ao gerar o arquivo: " + (e as Error).message };
  }

  const admin = createAdminClient();
  const base = `${tipo}/${crypto.randomUUID()}`;
  const up1 = await admin.storage.from("documentos").upload(`${base}.pdf`, pdf, { contentType: "application/pdf", upsert: false });
  const up2 = await admin.storage.from("documentos").upload(`${base}.docx`, docx, {
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    upsert: false,
  });
  if (up1.error || up2.error)
    return { error: "Falha ao salvar o arquivo: " + (up1.error?.message || up2.error?.message) };

  const { error } = await admin.from("documentos").insert({
    tipo,
    titulo: doc.titulo,
    cliente_id: clienteId || null,
    veiculo_id: veiculoId || null,
    pdf_path: `${base}.pdf`,
    docx_path: `${base}.docx`,
    dados: { cliente, cliente2, veiculo, extra },
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/documentos");
  redirect("/admin/documentos");
}

export async function deleteDocumento(id: string, pdfPath?: string, docxPath?: string) {
  const admin = createAdminClient();
  const paths = [pdfPath, docxPath].filter(Boolean) as string[];
  if (paths.length) await admin.storage.from("documentos").remove(paths);
  await admin.from("documentos").delete().eq("id", id);
  revalidatePath("/admin/documentos");
}
