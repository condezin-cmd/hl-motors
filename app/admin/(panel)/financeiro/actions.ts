"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createReadClient } from "@/lib/supabase/server";
import { catByKey } from "@/lib/financeiro";

function parse(formData: FormData) {
  const g = (k: string) => String(formData.get(k) ?? "").trim();
  const valor = Number(g("valor").replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3})/g, "").replace(",", ".")) || 0;
  const categoria = g("categoria");
  const cat = catByKey(categoria);
  return {
    categoria,
    tipo: cat?.tipo ?? "saida",
    valor,
    data: g("data") || new Date().toISOString().slice(0, 10),
    descricao: g("descricao") || null,
    veiculo_id: g("veiculo_id") || null,
    socio: g("socio") || null,
    forma_pagamento: g("forma_pagamento") || null,
  };
}

export async function createLancamento(_prev: unknown, formData: FormData) {
  const sb = await createReadClient();
  const row = parse(formData);
  if (!row.categoria) return { error: "Escolha a categoria." };
  if (!row.valor) return { error: "Informe o valor." };
  const { error } = await sb.from("lancamentos").insert(row);
  if (error) return { error: error.message };
  revalidatePath("/admin/financeiro");
  redirect("/admin/financeiro");
}

export async function deleteLancamento(id: string) {
  const sb = await createReadClient();
  await sb.from("lancamentos").delete().eq("id", id);
  revalidatePath("/admin/financeiro");
}
