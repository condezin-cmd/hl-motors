"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createReadClient } from "@/lib/supabase/server";
import { SocarraoClient, socarraoVehicleToVeiculo } from "@/lib/integrations/socarrao";

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

export async function syncSocarraoEstoque() {
  const supabase = await createReadClient();
  let nextUrl = "/admin/estoque?socarrao=erro&message=Falha%20ao%20sincronizar%20SóCarrão.";

  try {
    const client = SocarraoClient.fromEnv();
    const { vehicles } = await client.getVehicles({ orderBy: "CREATED_DESC" });

    let created = 0;
    let updated = 0;

    for (const vehicle of vehicles ?? []) {
      const row = socarraoVehicleToVeiculo(vehicle);
      const plate = row.placa?.trim().toUpperCase() || null;

      const { data: existing, error: findError } = await supabase
        .from("veiculos")
        .select("id")
        .or(`socarrao_id.eq.${vehicle.id}${plate ? `,placa.eq.${plate}` : ""}`)
        .maybeSingle();

      if (findError) throw findError;

      if (existing?.id) {
        const { error } = await supabase.from("veiculos").update({ ...row, placa: plate }).eq("id", existing.id);
        if (error) throw error;
        updated++;
      } else {
        const slug = `${kebab(`${row.marca}-${row.modelo}-${row.ano_modelo ?? ""}`)}-${Math.random()
          .toString(36)
          .slice(2, 7)}`;
        const { error } = await supabase.from("veiculos").insert({ ...row, placa: plate, slug });
        if (error) throw error;
        created++;
      }
    }

    revalidatePath("/admin/estoque");
    revalidatePath("/");
    nextUrl = `/admin/estoque?socarrao=ok&created=${created}&updated=${updated}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao sincronizar SóCarrão.";
    nextUrl = `/admin/estoque?socarrao=erro&message=${encodeURIComponent(message.slice(0, 180))}`;
  }

  redirect(nextUrl);
}

export async function syncSocarraoSelecionados(formData: FormData) {
  const supabase = await createReadClient();
  const selectedIds = formData
    .getAll("veiculo_id")
    .map((id) => String(id).trim())
    .filter(Boolean);
  const action = String(formData.get("socarrao_action") ?? "pull");
  let nextUrl = "/admin/estoque?socarrao=erro&message=Nenhum%20veículo%20selecionado.";

  if (!selectedIds.length) redirect(nextUrl);

  try {
    const { data: selected, error: selectedError } = await supabase
      .from("veiculos")
      .select("*")
      .in("id", selectedIds);

    if (selectedError) throw selectedError;

    if (action === "queue") {
      const rows = (selected ?? []).map((vehicle) => ({
        provider: "socarrao",
        veiculo_id: vehicle.id,
        external_id: vehicle.socarrao_id ? String(vehicle.socarrao_id) : null,
        status: vehicle.socarrao_id ? "vinculado" : "pendente_envio",
        last_payload: {
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          versao: vehicle.versao,
          ano_modelo: vehicle.ano_modelo,
          placa: vehicle.placa,
          preco: vehicle.preco,
          fotos: vehicle.fotos ?? [],
        },
        last_error: null,
      }));

      const { error } = await supabase
        .from("integracoes_anuncios")
        .upsert(rows, { onConflict: "provider,veiculo_id" });

      if (error) throw error;

      nextUrl = `/admin/estoque?socarrao=ok&created=0&updated=${rows.length}&mode=queue`;
    } else {
      const client = SocarraoClient.fromEnv();
      const { vehicles } = await client.getVehicles({ orderBy: "CREATED_DESC" });
      const bySocarraoId = new Map((vehicles ?? []).map((vehicle) => [String(vehicle.id), vehicle]));
      const byPlate = new Map(
        (vehicles ?? [])
          .map((vehicle) => [vehicle.plate?.trim().toUpperCase(), vehicle] as const)
          .filter(([plate]) => Boolean(plate)),
      );

      let updated = 0;
      let skipped = 0;

      for (const vehicle of selected ?? []) {
        const remote =
          (vehicle.socarrao_id ? bySocarraoId.get(String(vehicle.socarrao_id)) : null) ??
          byPlate.get(String(vehicle.placa ?? "").trim().toUpperCase());

        if (!remote) {
          skipped++;
          continue;
        }

        const row = socarraoVehicleToVeiculo(remote);
        const plate = row.placa?.trim().toUpperCase() || null;
        const { error } = await supabase.from("veiculos").update({ ...row, placa: plate }).eq("id", vehicle.id);
        if (error) throw error;
        updated++;
      }

      nextUrl = `/admin/estoque?socarrao=ok&created=${skipped}&updated=${updated}&mode=selected`;
    }

    revalidatePath("/admin/estoque");
    revalidatePath("/");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao sincronizar selecionados.";
    nextUrl = `/admin/estoque?socarrao=erro&message=${encodeURIComponent(message.slice(0, 180))}`;
  }

  redirect(nextUrl);
}
