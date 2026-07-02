"use server";

import { revalidatePath } from "next/cache";
import { createReadClient } from "@/lib/supabase/server";
import { restaurarDaLixeira, excluirDefinitivo } from "@/lib/lixeira";

function revalidarTudo(tabela?: string | null) {
  revalidatePath("/admin/lixeira");
  const mapa: Record<string, string[]> = {
    veiculos: ["/admin/estoque", "/"],
    leads: ["/admin/leads"],
    documentos: ["/admin/documentos"],
    clientes: ["/admin/clientes"],
    negociacoes: ["/admin/negociacoes"],
    avaliacoes: ["/admin/avaliacoes"],
    lancamentos: ["/admin/financeiro"],
    gastos_fixos: ["/admin/financeiro/fixos"],
  };
  for (const p of (tabela && mapa[tabela]) || []) revalidatePath(p);
}

export async function restaurarItem(id: string) {
  const sb = await createReadClient();
  const tabela = await restaurarDaLixeira(sb, id);
  revalidarTudo(tabela);
}

export async function excluirItem(id: string) {
  const sb = await createReadClient();
  await excluirDefinitivo(sb, id);
  revalidatePath("/admin/lixeira");
}
