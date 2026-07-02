"use server";

import { revalidatePath } from "next/cache";
import { createReadClient } from "@/lib/supabase/server";

export async function toggleCanal(key: string, ativo: boolean) {
  const sb = await createReadClient();
  await sb.from("canais").update({ ativo, updated_at: new Date().toISOString() }).eq("key", key);
  revalidatePath("/admin/canais");
}

export async function salvarConfigCanal(key: string, formData: FormData) {
  const sb = await createReadClient();
  const config: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (k.startsWith("cfg_") && String(v).trim()) config[k.slice(4)] = String(v).trim();
  }
  await sb.from("canais").update({ config, updated_at: new Date().toISOString() }).eq("key", key);
  revalidatePath("/admin/canais");
}
