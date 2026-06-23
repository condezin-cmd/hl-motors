"use client";

import { useState } from "react";

type Field = { key: string; placeholder: string };
type Result = { id: string; label: string } | { error: string };

export function QuickCreate({
  label,
  fields,
  onSave,
  onCreated,
}: {
  label: string;
  fields: Field[];
  onSave: (vals: Record<string, string>) => Promise<Result>;
  onCreated: (id: string, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setErr(null);
    const r = await onSave(vals);
    setBusy(false);
    if ("error" in r) { setErr(r.error); return; }
    onCreated(r.id, r.label);
    setVals({});
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1.5 text-xs font-black uppercase text-[var(--color-mute)] hover:text-[var(--color-red)]"
      >
        + criar novo
      </button>
    );
  }

  return (
    <div className="mt-2 border border-[var(--color-red)]/40 bg-black/30 p-3">
      <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-[var(--color-red)]">{label}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {fields.map((f) => (
          <input
            key={f.key}
            placeholder={f.placeholder}
            value={vals[f.key] ?? ""}
            onChange={(e) => setVals((v) => ({ ...v, [f.key]: e.target.value }))}
            className="border border-white/15 bg-black/40 px-2.5 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-[var(--color-red)]"
          />
        ))}
      </div>
      {err && <p className="mt-2 text-xs text-[var(--color-red-bright)]">{err}</p>}
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={save} disabled={busy} className="bg-[var(--color-red)] px-4 py-2 text-xs font-black uppercase text-white hover:bg-[var(--color-red-bright)] disabled:opacity-60">
          {busy ? "Salvando..." : "Salvar e usar"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="border border-white/15 px-4 py-2 text-xs font-black uppercase text-[var(--color-mute)] hover:border-white/40">
          Cancelar
        </button>
      </div>
    </div>
  );
}
