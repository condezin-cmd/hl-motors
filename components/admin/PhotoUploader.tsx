"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function PhotoUploader({
  name,
  initial = [],
}: {
  name: string;
  initial?: string[];
}) {
  const [fotos, setFotos] = useState<string[]>(initial ?? []);
  const [uploading, setUploading] = useState(false);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    const sb = createClient();
    for (const file of files) {
      const path = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
      const { error } = await sb.storage.from("veiculos").upload(path, file);
      if (!error) {
        const { data } = sb.storage.from("veiculos").getPublicUrl(path);
        setFotos((f) => [...f, data.publicUrl]);
      }
    }
    setUploading(false);
    e.target.value = "";
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(fotos)} />
      <div className="flex flex-wrap gap-3">
        {fotos.map((url, i) => (
          <div key={url} className="relative h-24 w-32 overflow-hidden border border-white/15">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setFotos((f) => f.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 bg-black/70 px-1.5 text-xs font-black text-white"
            >
              ✕
            </button>
          </div>
        ))}
        <label className="flex h-24 w-32 cursor-pointer items-center justify-center border border-dashed border-white/25 text-xs font-bold uppercase text-[var(--color-mute)] hover:border-[var(--color-red)]">
          {uploading ? "Enviando..." : "+ Foto"}
          <input type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
        </label>
      </div>
    </div>
  );
}
