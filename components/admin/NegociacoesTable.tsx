"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { brl } from "@/lib/format";

export type NegRow = {
  id: string;
  comprador: string;
  veiculo: string;
  temTroca: boolean;
  valor: number;
  status: string;
};

const statusCls: Record<string, string> = {
  aberta: "bg-amber-400 text-black",
  fechada: "bg-emerald-500 text-white",
  cancelada: "bg-zinc-600 text-white",
};
const statusLabel: Record<string, string> = { aberta: "Aberta", fechada: "Fechada", cancelada: "Cancelada" };
const STATUS_FILTRO = ["todos", "aberta", "fechada", "cancelada"];

export function NegociacoesTable({ rows }: { rows: NegRow[] }) {
  const [busca, setBusca] = useState("");
  const [statusF, setStatusF] = useState("todos");

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return rows.filter((n) => {
      if (statusF !== "todos" && n.status !== statusF) return false;
      if (!q) return true;
      return `${n.comprador} ${n.veiculo}`.toLowerCase().includes(q);
    });
  }, [rows, busca, statusF]);

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por comprador ou veículo…"
          className="w-full max-w-md border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[var(--color-red)]"
        />
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} className="border border-white/15 bg-[var(--color-graphite)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]">
          {STATUS_FILTRO.map((s) => (<option key={s} value={s}>{s === "todos" ? "Todos os status" : statusLabel[s]}</option>))}
        </select>
        <span className="text-xs font-black uppercase text-[var(--color-mute)]">{visiveis.length} de {rows.length}</span>
      </div>

      <div className="mt-4 overflow-x-auto border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-panel)] text-left text-[11px] uppercase tracking-wider text-[var(--color-mute)]">
            <tr>
              <th className="px-4 py-3">Comprador</th>
              <th className="px-4 py-3">Veículo</th>
              <th className="px-4 py-3">Troca</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {visiveis.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-[var(--color-mute)]">Nenhuma negociação encontrada.</td></tr>
            ) : visiveis.map((n) => (
              <tr key={n.id} className="border-t border-white/10 hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-bold text-white">{n.comprador}</td>
                <td className="px-4 py-3 text-[var(--color-mute)]">{n.veiculo}</td>
                <td className="px-4 py-3 text-[var(--color-mute)]">{n.temTroca ? "Sim" : "—"}</td>
                <td className="px-4 py-3 font-black text-[var(--color-red)]">{brl(n.valor)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-1 text-[10px] font-black uppercase ${statusCls[n.status] ?? "bg-zinc-600 text-white"}`}>
                    {statusLabel[n.status] ?? n.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/negociacoes/${n.id}`} className="border border-white/15 px-3 py-1.5 text-xs font-black uppercase text-white hover:border-[var(--color-red)]">
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
