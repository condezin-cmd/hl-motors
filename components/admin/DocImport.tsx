"use client";

import { useRef, useState } from "react";

export function DocImport({
  tipo,
  titulo,
  hint,
  onExtract,
}: {
  tipo: "veiculo" | "cliente";
  titulo: string;
  hint: string;
  onExtract: (dados: Record<string, string>) => string[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filled, setFilled] = useState<string[] | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLoading(true);
    setError(null);
    setFilled(null);
    try {
      const fd = new FormData();
      fd.append("tipo", tipo);
      fd.append("file", file);
      const res = await fetch("/api/extrair-documento", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao ler o documento.");
      const campos = onExtract(json.dados || {});
      if (campos.length === 0) setError("Nenhum campo reconhecido neste documento.");
      else setFilled(campos);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-dashed border-[var(--color-red)]/40 bg-[var(--color-red)]/[0.04] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-white">
            <span className="text-[var(--color-red)]">⚡ </span>{titulo}
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-mute)]">{hint}</p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="shrink-0 border border-[var(--color-red)]/60 bg-[var(--color-red)]/10 px-4 py-2.5 text-xs font-black uppercase text-white hover:bg-[var(--color-red)]/20 disabled:opacity-60"
        >
          {loading ? "Lendo documento…" : "Enviar PDF / foto"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*"
          onChange={onFile}
          className="hidden"
        />
      </div>

      {error && (
        <p className="mt-3 border border-[var(--color-red)]/40 bg-[var(--color-red)]/10 px-3 py-2 text-xs text-[var(--color-red-bright)]">
          {error}
        </p>
      )}
      {filled && (
        <p className="mt-3 text-xs text-green-400">
          ✔ Preenchido automaticamente: <span className="text-white">{filled.join(", ")}</span>. Confira antes de salvar.
        </p>
      )}
    </div>
  );
}
