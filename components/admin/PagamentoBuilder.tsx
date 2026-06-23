"use client";

import { useState } from "react";
import { brl } from "@/lib/format";

export type AvalOpt = {
  id: string;
  label: string;
  valor: number | null;
  placa?: string | null;
};

type Pag = {
  tipo: string;
  valor?: string;
  banco?: string;
  parcelas?: string;
  valorParcela?: string;
  descricao?: string;
  placa?: string;
  avaliacaoId?: string;
};

const TIPOS = [
  "À vista",
  "PIX",
  "Transferência bancária",
  "Dinheiro",
  "Cartão",
  "Financiamento",
  "Entrada/Sinal",
  "Troca (veículo avaliado)",
];

export function PagamentoBuilder({
  name,
  avaliacoes,
}: {
  name: string;
  avaliacoes: AvalOpt[];
}) {
  const [lines, setLines] = useState<Pag[]>([]);

  const set = (i: number, patch: Partial<Pag>) =>
    setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const add = () => setLines((ls) => [...ls, { tipo: "À vista", valor: "" }]);
  const rm = (i: number) => setLines((ls) => ls.filter((_, j) => j !== i));

  const total = lines.reduce((s, l) => {
    const n = Number(String(l.valor ?? "").replace(/[^\d]/g, ""));
    return s + (isNaN(n) ? 0 : n);
  }, 0);

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(lines)} />

      <div className="space-y-3">
        {lines.map((l, i) => {
          const isTroca = /troca/i.test(l.tipo);
          const isFin = /financ/i.test(l.tipo);
          const isCard = /cart/i.test(l.tipo);
          return (
            <div key={i} className="border border-white/12 bg-black/20 p-3">
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[180px] flex-1">
                  <Mini>Forma</Mini>
                  <select
                    data-testid="pag-tipo"
                    value={l.tipo}
                    onChange={(e) => set(i, { tipo: e.target.value, valor: "", avaliacaoId: "", descricao: "", placa: "" })}
                    className="w-full border border-white/15 bg-[var(--color-graphite)] px-2.5 py-2 text-sm text-white outline-none"
                  >
                    {TIPOS.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>

                {isTroca ? (
                  <div className="min-w-[220px] flex-[2]">
                    <Mini>Avaliação (veículo na troca)</Mini>
                    <select
                      value={l.avaliacaoId ?? ""}
                      onChange={(e) => {
                        const a = avaliacoes.find((x) => x.id === e.target.value);
                        set(i, {
                          avaliacaoId: e.target.value,
                          valor: a?.valor != null ? String(a.valor) : "",
                          descricao: a?.label ?? "",
                          placa: a?.placa ?? "",
                        });
                      }}
                      className="w-full border border-white/15 bg-[var(--color-graphite)] px-2.5 py-2 text-sm text-white outline-none"
                    >
                      <option value="">— selecione a avaliação —</option>
                      {avaliacoes.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label} {a.valor != null ? `· ${brl(a.valor)}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="w-36">
                    <Mini>Valor (R$)</Mini>
                    <input
                      value={l.valor ?? ""}
                      onChange={(e) => set(i, { valor: e.target.value })}
                      className="w-full border border-white/15 bg-black/30 px-2.5 py-2 text-sm text-white outline-none"
                    />
                  </div>
                )}

                <button type="button" onClick={() => rm(i)} className="px-2 py-2 text-xs font-black uppercase text-[var(--color-mute)] hover:text-[var(--color-red)]">
                  remover
                </button>
              </div>

              {isFin && (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Field label="Banco" val={l.banco} onChange={(x) => set(i, { banco: x })} />
                  <Field label="Nº parcelas" val={l.parcelas} onChange={(x) => set(i, { parcelas: x })} />
                  <Field label="Valor da parcela (R$)" val={l.valorParcela} onChange={(x) => set(i, { valorParcela: x })} />
                </div>
              )}
              {isCard && (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Field label="Nº parcelas" val={l.parcelas} onChange={(x) => set(i, { parcelas: x })} />
                </div>
              )}
              {isTroca && l.avaliacaoId && (
                <p className="mt-2 text-xs text-[var(--color-mute)]">
                  ✔ Veículo avaliado em <span className="text-white">{brl(Number(l.valor))}</span> entra como parte do pagamento.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button type="button" onClick={add} className="border border-dashed border-white/25 px-4 py-2.5 text-xs font-black uppercase text-[var(--color-mute)] hover:border-[var(--color-red)]">
          + Adicionar forma de pagamento
        </button>
        {lines.length > 0 && (
          <p className="text-sm text-[var(--color-mute)]">
            Total informado: <span className="font-black text-white">{brl(total)}</span>
          </p>
        )}
      </div>
    </div>
  );
}

function Mini({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-[var(--color-mute)]">{children}</label>;
}
function Field({ label, val, onChange }: { label: string; val?: string; onChange: (x: string) => void }) {
  return (
    <div>
      <Mini>{label}</Mini>
      <input value={val ?? ""} onChange={(e) => onChange(e.target.value)} className="w-full border border-white/15 bg-black/30 px-2.5 py-2 text-sm text-white outline-none" />
    </div>
  );
}
