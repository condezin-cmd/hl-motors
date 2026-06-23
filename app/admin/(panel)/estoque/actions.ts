"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createReadClient } from "@/lib/supabase/server";

function kebab(s: string) {
  return s
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

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
  const fotos: string[] = jarr("fotos");
  const arquivos = jarr("arquivos");
  const opcionais = g("opcionais")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    marca: g("marca"),
    modelo: g("modelo"),
    versao: g("versao") || null,
    ano_modelo: num("ano_modelo"),
    ano_fab: num("ano_fab"),
    km: num("km") ?? 0,
    preco: num("preco") ?? 0,
    cambio: g("cambio") || null,
    combustivel: g("combustivel") || null,
    cor: g("cor") || null,
    portas: num("portas") ?? 4,
    placa: g("placa") || null,
    renavam: g("renavam") || null,
    chassi: g("chassi") || null,
    status: g("status") || "disponivel",
    destaque: g("destaque") === "on" || g("destaque") === "true",
    is_consignado: g("is_consignado") === "on" || g("is_consignado") === "true",
    proprietario_id: g("proprietario_id") || null,
    origem: g("origem") || "compra",
    descricao: g("descricao") || null,
    opcionais,
    fotos,
    arquivos,
  };
}

export async function createVeiculo(_prev: unknown, formData: FormData) {
  const supabase = await createReadClient();
  const row = parse(formData);
  const slug =
    kebab(`${row.marca}-${row.modelo}-${row.ano_modelo ?? ""}`) +
    "-" +
    Math.random().toString(36).slice(2, 7);
  const { data, error } = await supabase.from("veiculos").insert({ ...row, slug }).select("id").single();
  if (error) return { error: error.message };
  revalidatePath("/admin/estoque");
  revalidatePath("/");
  const next = String(formData.get("next") ?? "").trim();
  const campo = String(formData.get("campo") ?? "").trim();
  if (next && next.startsWith("/admin/")) redirect(`${next}?novo=${data.id}&campo=${campo}`);
  redirect("/admin/estoque");
}

export async function updateVeiculo(id: string, _prev: unknown, formData: FormData) {
  const supabase = await createReadClient();
  const { error } = await supabase.from("veiculos").update(parse(formData)).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/estoque");
  revalidatePath("/");
  redirect("/admin/estoque");
}

export async function deleteVeiculo(id: string) {
  const supabase = await createReadClient();
  await supabase.from("veiculos").delete().eq("id", id);
  revalidatePath("/admin/estoque");
  revalidatePath("/");
}

// Inativar (some do site, reversível) ou reativar um veículo.
export async function setVeiculoStatus(id: string, status: string) {
  const supabase = await createReadClient();
  await supabase.from("veiculos").update({ status }).eq("id", id);
  revalidatePath("/admin/estoque");
  revalidatePath("/");
}
