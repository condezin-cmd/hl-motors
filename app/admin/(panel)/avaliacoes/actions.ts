"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createReadClient } from "@/lib/supabase/server";

function parse(formData: FormData) {
  const g = (k: string) => String(formData.get(k) ?? "").trim();
  const num = (k: string) => {
    const v = g(k).replace(/[^\d]/g, "");
    return v === "" ? null : Number(v);
  };
  const jarr = (k: string) => {
    try {
      const raw = g(k);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };
  return {
    cliente_id: g("cliente_id") || null,
    marca: g("marca") || null,
    modelo: g("modelo") || null,
    versao: g("versao") || null,
    ano_fab: num("ano_fab"),
    ano_modelo: num("ano_modelo"),
    km: num("km"),
    placa: g("placa") || null,
    renavam: g("renavam") || null,
    chassi: g("chassi") || null,
    cor: g("cor") || null,
    combustivel: g("combustivel") || null,
    estado: g("estado") || null,
    valor_avaliado: num("valor_avaliado"),
    valor_fipe: num("valor_fipe"),
    observacoes: g("observacoes") || null,
    status: g("status") || "avaliado",
    fotos: jarr("fotos"),
    arquivos: jarr("arquivos"),
  };
}

export async function createAvaliacao(_prev: unknown, formData: FormData) {
  const supabase = await createReadClient();
  const { error } = await supabase.from("avaliacoes").insert(parse(formData));
  if (error) return { error: error.message };
  revalidatePath("/admin/avaliacoes");
  redirect("/admin/avaliacoes");
}

export async function updateAvaliacao(id: string, _prev: unknown, formData: FormData) {
  const supabase = await createReadClient();
  const { error } = await supabase.from("avaliacoes").update(parse(formData)).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/avaliacoes");
  redirect("/admin/avaliacoes");
}

export async function deleteAvaliacao(id: string) {
  const supabase = await createReadClient();
  await supabase.from("avaliacoes").delete().eq("id", id);
  revalidatePath("/admin/avaliacoes");
}
