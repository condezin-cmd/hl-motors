"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createReadClient } from "@/lib/supabase/server";

function num(v: string) {
  return Number(String(v).replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3})/g, "").replace(",", ".")) || 0;
}

export async function createGastoFixo(formData: FormData) {
  const sb = await createReadClient();
  const g = (k: string) => String(formData.get(k) ?? "").trim();
  if (!g("nome")) redirect("/admin/financeiro/fixos?erro=Informe%20o%20nome.");
  const dia = g("dia_vencimento") ? Math.max(1, Math.min(31, Number(g("dia_vencimento")))) : null;
  await sb.from("gastos_fixos").insert({ nome: g("nome"), valor: num(g("valor")), dia_vencimento: dia, observacao: g("observacao") || null });
  revalidatePath("/admin/financeiro/fixos");
  redirect("/admin/financeiro/fixos");
}

export async function toggleGastoFixo(id: string, ativo: boolean) {
  const sb = await createReadClient();
  await sb.from("gastos_fixos").update({ ativo }).eq("id", id);
  revalidatePath("/admin/financeiro/fixos");
}

export async function deleteGastoFixo(id: string) {
  const sb = await createReadClient();
  await sb.from("gastos_fixos").delete().eq("id", id);
  revalidatePath("/admin/financeiro/fixos");
}

// Lança no caixa todos os gastos fixos ativos da competência (mês). Idempotente.
export async function lancarFixosDoMes() {
  const sb = await createReadClient();
  const now = new Date();
  const ano = now.getFullYear();
  const mes = now.getMonth() + 1;
  const competencia = `${ano}-${String(mes).padStart(2, "0")}`;

  const { data: fixos } = await sb.from("gastos_fixos").select("*").eq("ativo", true);
  const { data: jaLancados } = await sb.from("lancamentos").select("gasto_fixo_id").eq("competencia", competencia).not("gasto_fixo_id", "is", null);
  const feitos = new Set((jaLancados ?? []).map((l) => l.gasto_fixo_id));

  const novos = (fixos ?? [])
    .filter((f) => !feitos.has(f.id))
    .map((f) => {
      const dia = f.dia_vencimento ? Math.min(f.dia_vencimento, 28) : now.getDate();
      return {
        tipo: "saida",
        categoria: "gasto_fixo",
        valor: f.valor,
        descricao: f.nome,
        data: `${competencia}-${String(dia).padStart(2, "0")}`,
        gasto_fixo_id: f.id,
        competencia,
        auto: true,
      };
    });

  if (novos.length) await sb.from("lancamentos").insert(novos);
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/financeiro/fixos");
  redirect(`/admin/financeiro/fixos?ok=${novos.length}&comp=${competencia}`);
}
