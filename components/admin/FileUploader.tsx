"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Arquivo = { nome: string; path: string };

export function FileUploader({
  name,
  initial = [],
  prefix,
}: {
  name: string;
  initial?: Arquivo[];
  prefix: string;
}) {
  const [files, setFiles] = useState<Arquivo[]>(initial ?? []);
  const [busy, setBusy] = useState(false);
  const sb = createClient();

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    if (!list.length) return;
    setBusy(true);
    for (const file of list) {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
      const { error } = await sb.storage.from("arquivos").upload(path, file);
      if (!error) setFiles((f) => [...f, { nome: file.name, path }]);
    }
    setBusy(false);
    e.target.value = "";
  }

  async function abrir(path: string) {
    const { data } = await sb.storage.from("arquivos").createSignedUrl(path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(files)} />
      <div className="space-y-2">
        {files.map((a, i) => (
          <div
            key={a.path}
            className="flex items-center justify-between border border-white/12 bg-black/20 px-3 py-2"
          >
            <button
              type="button"
              onClick={() => abrir(a.path)}
              className="truncate text-sm text-white hover:text-[var(--color-red)]"
              title={a.nome}
            >
              📎 {a.nome}
            </button>
            <button
              type="button"
              onClick={() => setFiles((f) => f.filter((_, j) => j !== i))}
              className="ml-3 shrink-0 text-xs font-black uppercase text-[var(--color-mute)] hover:text-[var(--color-red)]"
            >
              remover
            </button>
          </div>
        ))}
      </div>
      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 border border-dashed border-white/25 px-4 py-2.5 text-xs font-black uppercase text-[var(--color-mute)] hover:border-[var(--color-red)]">
        {busy ? "Enviando..." : "+ Anexar documento"}
        <input type="file" multiple onChange={onUpload} className="hidden" />
      </label>
    </div>
  );
}
