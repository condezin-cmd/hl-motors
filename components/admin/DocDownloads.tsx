"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function DocDownloads({
  pdf,
  docx,
}: {
  pdf?: string | null;
  docx?: string | null;
}) {
  const [busy, setBusy] = useState(false);
  const sb = createClient();

  async function open(path?: string | null) {
    if (!path) return;
    setBusy(true);
    const { data } = await sb.storage.from("documentos").createSignedUrl(path, 600);
    setBusy(false);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={busy || !pdf}
        onClick={() => open(pdf)}
        className="border border-white/15 px-3 py-1.5 text-xs font-black uppercase text-white hover:border-[var(--color-red)] disabled:opacity-40"
      >
        PDF
      </button>
      <button
        type="button"
        disabled={busy || !docx}
        onClick={() => open(docx)}
        className="border border-white/15 px-3 py-1.5 text-xs font-black uppercase text-white hover:border-[var(--color-red)] disabled:opacity-40"
      >
        Word
      </button>
    </div>
  );
}
