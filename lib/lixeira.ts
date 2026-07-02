import { createAdminClient } from "@/lib/supabase/admin";

// Tabelas que passam pela lixeira e um rótulo legível de cada registro.
export const LIXEIRA_LABELS: Record<string, string> = {
  veiculos: "Veículo",
  leads: "Lead",
  documentos: "Documento",
  clientes: "Cliente",
  negociacoes: "Negociação",
  avaliacoes: "Avaliação",
  lancamentos: "Lançamento",
  gastos_fixos: "Gasto fixo",
};

function rotuloDe(tabela: string, d: any): string {
  switch (tabela) {
    case "veiculos": return `${d.marca ?? ""} ${d.modelo ?? ""} ${d.versao ?? ""} ${d.ano_modelo ?? ""}`.replace(/\s+/g, " ").trim() || "Veículo";
    case "leads": return d.nome || d.telefone || "Lead";
    case "documentos": return d.titulo || d.tipo || "Documento";
    case "clientes": return d.nome || "Cliente";
    case "negociacoes": return `Negociação ${d.status ?? ""}`.trim();
    case "avaliacoes": return `${d.marca ?? ""} ${d.modelo ?? ""}`.trim() || "Avaliação";
    case "lancamentos": return d.descricao || d.categoria || "Lançamento";
    case "gastos_fixos": return d.nome || "Gasto fixo";
    default: return tabela;
  }
}

// Move um registro para a lixeira: copia a linha e remove da tabela original.
// Retorna false se o registro não existe.
export async function moverParaLixeira(sb: any, tabela: string, id: string): Promise<boolean> {
  const { data } = await sb.from(tabela).select("*").eq("id", id).maybeSingle();
  if (!data) return false;
  await sb.from("lixeira").insert({ tabela, registro_id: id, rotulo: rotuloDe(tabela, data), dados: data });
  await sb.from(tabela).delete().eq("id", id);
  return true;
}

// Restaura um item da lixeira de volta para a tabela original (mesmo id).
export async function restaurarDaLixeira(sb: any, lixeiraId: string): Promise<string | null> {
  const { data: item } = await sb.from("lixeira").select("*").eq("id", lixeiraId).maybeSingle();
  if (!item) return null;
  const { error } = await sb.from(item.tabela).upsert(item.dados);
  if (error) return null;
  await sb.from("lixeira").delete().eq("id", lixeiraId);
  return item.tabela;
}

// Exclui em definitivo (remove da lixeira e, para documentos, apaga os arquivos).
export async function excluirDefinitivo(sb: any, lixeiraId: string): Promise<void> {
  const { data: item } = await sb.from("lixeira").select("*").eq("id", lixeiraId).maybeSingle();
  if (!item) return;
  if (item.tabela === "documentos") {
    const admin = createAdminClient();
    const paths = [item.dados?.pdf_path, item.dados?.docx_path].filter(Boolean) as string[];
    if (paths.length) await admin.storage.from("documentos").remove(paths);
  }
  await sb.from("lixeira").delete().eq("id", lixeiraId);
}
