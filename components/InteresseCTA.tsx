"use client";

import { useState } from "react";
import { site, whatsappLink } from "@/lib/site";
import { registrarLeadPublico } from "@/lib/leads-actions";

// CTAs da página do veículo. Exigem dados mínimos (nome + WhatsApp) antes de
// abrir a conversa — todo clique vira um lead com contato no funil.
export function InteresseCTA({
  veiculoId,
  veiculoTexto,
  msgInteresse,
  msgTestDrive,
}: {
  veiculoId: string;
  veiculoTexto: string;
  msgInteresse: string;
  msgTestDrive: string;
}) {
  const [aberto, setAberto] = useState<null | { titulo: string; msg: string }>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [enviando, setEnviando] = useState(false);

  function fechar() {
    setAberto(null);
    setEnviando(false);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!aberto || !nome.trim() || !telefone.trim()) return;
    setEnviando(true);
    // grava o lead (com contato) em segundo plano
    void registrarLeadPublico({
      nome,
      telefone,
      veiculo_id: veiculoId,
      veiculo_texto: veiculoTexto,
      mensagem: aberto.msg,
      origem: "site",
    });
    // abre o WhatsApp no mesmo gesto do clique
    window.open(whatsappLink(`${aberto.msg}\n\nMeu nome: ${nome}`), "_blank");
    fechar();
    setNome("");
    setTelefone("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto({ titulo: "Tenho interesse", msg: msgInteresse })}
        className="sheen mt-7 flex items-center justify-center bg-[var(--color-red)] px-6 py-4 text-sm font-black uppercase text-white transition-colors hover:bg-[var(--color-red-bright)]"
      >
        Tenho interesse
      </button>
      <button
        type="button"
        onClick={() => setAberto({ titulo: "Agendar test-drive", msg: msgTestDrive })}
        className="mt-3 flex items-center justify-center border border-white/20 px-6 py-3.5 text-sm font-black uppercase text-white transition-colors hover:border-[var(--color-red)] hover:bg-[var(--color-red)]"
      >
        Agendar test-drive
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={fechar}
        >
          <div
            className="w-full max-w-sm border border-white/15 bg-[var(--color-panel)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl font-black uppercase text-white">{aberto.titulo}</h3>
                <p className="mt-1 text-xs text-[var(--color-mute)]">{veiculoTexto}</p>
              </div>
              <button type="button" onClick={fechar} className="text-xl leading-none text-[var(--color-mute)] hover:text-white">×</button>
            </div>

            <form onSubmit={enviar} className="mt-5 grid gap-2.5">
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                required
                autoFocus
                className="w-full border border-white/15 bg-black/30 px-3 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--color-red)]"
              />
              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="WhatsApp com DDD"
                inputMode="tel"
                required
                className="w-full border border-white/15 bg-black/30 px-3 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--color-red)]"
              />
              <button
                type="submit"
                disabled={enviando}
                className="sheen mt-1 flex items-center justify-center gap-2 bg-[var(--color-red)] px-6 py-3.5 text-sm font-black uppercase text-white transition-colors hover:bg-[var(--color-red-bright)] disabled:opacity-50"
              >
                {enviando ? "Abrindo…" : `Continuar no WhatsApp`}
              </button>
              <p className="text-center text-[11px] text-[var(--color-mute)]">
                Resposta rápida da equipe {site.name}.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
