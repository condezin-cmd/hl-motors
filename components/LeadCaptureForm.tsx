"use client";

import { useState } from "react";
import { site, whatsappLink } from "@/lib/site";
import { registrarLeadPublico } from "@/lib/leads-actions";

// Card de captura na página do veículo: salva o lead no painel e abre o WhatsApp.
export function LeadCaptureForm({
  veiculoId,
  veiculoTexto,
  mensagem,
}: {
  veiculoId: string;
  veiculoTexto: string;
  mensagem: string;
}) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim()) return;
    setEnviando(true);
    try {
      await registrarLeadPublico({
        nome,
        telefone,
        veiculo_id: veiculoId,
        veiculo_texto: veiculoTexto,
        mensagem,
        origem: "site",
      });
    } catch {
      /* segue pro WhatsApp mesmo assim */
    }
    window.open(whatsappLink(`${mensagem}\n\nMeu nome: ${nome}`), "_blank");
    setEnviando(false);
  }

  return (
    <form onSubmit={submit} className="mt-3 border border-white/12 bg-black/20 p-4">
      <p className="text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">
        Quer que a gente te chame?
      </p>
      <div className="mt-2 grid gap-2">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome"
          required
          className="w-full border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--color-red)]"
        />
        <input
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="WhatsApp com DDD"
          inputMode="tel"
          required
          className="w-full border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--color-red)]"
        />
        <button
          type="submit"
          disabled={enviando}
          className="flex items-center justify-center gap-2 border border-white/20 px-4 py-3 text-xs font-black uppercase text-white transition-colors hover:border-[var(--color-red)] hover:bg-[var(--color-red)] disabled:opacity-50"
        >
          {enviando ? "Enviando…" : `Falar com a ${site.name}`}
        </button>
      </div>
    </form>
  );
}
