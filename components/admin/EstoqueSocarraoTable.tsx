"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { brl, km as fmtKm } from "@/lib/format";
import { deleteVeiculo, setVeiculoStatus, syncSocarraoSelecionados } from "@/app/admin/(panel)/estoque/actions";
import { PORTAIS } from "@/lib/integrations/portais";

type VeiculoRow = {
  id: string;
  slug?: string | null;
  marca?: string | null;
  modelo?: string | null;
  versao?: string | null;
  ano_modelo?: number | null;
  km?: number | null;
  preco?: number | null;
  placa?: string | null;
  status?: string | null;
  destaque?: boolean | null;
  fotos?: string[] | null;
  socarrao_id?: number | string | null;
  created_at?: string | null;
};

const statusLabel: Record<string, string> = {
  disponivel: "Disponível", reservado: "Reservado", vendido: "Vendido",
  consignado: "Consignado", inativo: "Inativo",
};
const STATUS_FILTRO = ["todos", "disponivel", "reservado", "consignado", "vendido", "inativo"];

function diasEmEstoque(iso?: string | null) {
  if (!iso) return null;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
}

export function EstoqueSocarraoTable({ veiculos }: { veiculos: VeiculoRow[] }) {
  const portais = PORTAIS.filter((p) => p.ativo);
  const [portalKey, setPortalKey] = useState(portais[0]?.key ?? "socarrao");
  const portal = portais.find((p) => p.key === portalKey) ?? portais[0];

  const [busca, setBusca] = useState("");
  const [statusF, setStatusF] = useState("todos");

  const syncedIds = useMemo(
    () => new Set(veiculos.filter((v) => portal?.synced(v)).map((v) => v.id)),
    [veiculos, portal],
  );
  const [selected, setSelected] = useState<Set<string>>(() => new Set(syncedIds));

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return veiculos.filter((v) => {
      if (statusF !== "todos" && v.status !== statusF) return false;
      if (!q) return true;
      return `${v.marca ?? ""} ${v.modelo ?? ""} ${v.versao ?? ""} ${v.placa ?? ""} ${v.ano_modelo ?? ""}`.toLowerCase().includes(q);
    });
  }, [veiculos, busca, statusF]);

  const formId = "portal-sync-form";

  function toggle(v: VeiculoRow) {
    if (!selected.has(v.id)) {
      if (!window.confirm(`Sincronizar "${v.marca} ${v.modelo}" com o ${portal?.label}?`)) return;
    }
    setSelected((cur) => {
      const next = new Set(cur);
      next.has(v.id) ? next.delete(v.id) : next.add(v.id);
      return next;
    });
  }

  function trocarPortal(key: string) {
    setPortalKey(key);
    const p = portais.find((x) => x.key === key);
    setSelected(new Set(veiculos.filter((v) => p?.synced(v)).map((v) => v.id)));
  }

  return (
    <>
      {/* busca + filtro */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por marca, modelo, versão, placa ou ano…"
          className="w-full max-w-md border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[var(--color-red)]"
        />
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} className="border border-white/15 bg-[var(--color-graphite)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]">
          {STATUS_FILTRO.map((s) => (<option key={s} value={s}>{s === "todos" ? "Todos os status" : statusLabel[s]}</option>))}
        </select>
        <span className="text-xs font-black uppercase text-[var(--color-mute)]">
          {visiveis.length} de {veiculos.length}
        </span>
      </div>

      <form id={formId} action={syncSocarraoSelecionados}>
        <input type="hidden" name="socarrao_action" value="pull" />
        {[...selected].map((id) => (<input key={id} type="hidden" name="veiculo_id" value={id} />))}
      </form>

      {/* barra de portais */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-[var(--color-panel)] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wide text-[var(--color-mute)]">Portal:</span>
          {PORTAIS.map((p) => (
            <button key={p.key} type="button" disabled={!p.ativo} onClick={() => p.ativo && trocarPortal(p.key)}
              className={`px-3 py-1.5 text-xs font-black uppercase transition-colors ${p.key === portalKey ? "bg-[var(--color-red)] text-white" : p.ativo ? "border border-white/15 text-white hover:border-[var(--color-red)]" : "border border-white/10 text-white/30"}`}>
              {p.label}{!p.ativo && " (em breve)"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--color-mute)]">{syncedIds.size} sincronizado(s)</span>
          <button type="submit" form={formId} disabled={selected.size === 0}
            className="bg-[var(--color-red)] px-4 py-2.5 text-xs font-black uppercase text-white hover:bg-[var(--color-red-bright)] disabled:cursor-not-allowed disabled:opacity-40"
            onClick={(e) => { if (!window.confirm(`Sincronizar ${selected.size} veículo(s) com o ${portal?.label}?`)) e.preventDefault(); }}>
            Sincronizar selecionados ({selected.size})
          </button>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-panel)] text-left text-[11px] uppercase tracking-wider text-[var(--color-mute)]">
            <tr>
              <th className="px-4 py-3">{portal?.label}</th>
              <th className="px-4 py-3">Foto</th>
              <th className="px-4 py-3">Veículo</th>
              <th className="px-4 py-3">Ano</th>
              <th className="px-4 py-3">KM</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {visiveis.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-[var(--color-mute)]">Nenhum veículo encontrado.</td></tr>
            ) : visiveis.map((v) => {
              const sincronizado = syncedIds.has(v.id);
              const marcado = selected.has(v.id);
              const dias = v.status === "disponivel" ? diasEmEstoque(v.created_at) : null;
              return (
                <tr key={v.id} className={`border-t border-white/10 hover:bg-white/[0.03] ${v.status === "inativo" ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input type="checkbox" checked={marcado} onChange={() => toggle(v)} className="h-4 w-4" />
                      {sincronizado ? <span className="text-[10px] font-black uppercase text-emerald-400">✓ no ar</span> : marcado ? <span className="text-[10px] font-black uppercase text-amber-300">novo</span> : null}
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-12 w-16 overflow-hidden border border-white/10 bg-black/40">
                      {v.fotos?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={v.fotos[0]} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold uppercase text-white">{v.marca} {v.modelo}</p>
                    <p className="text-xs text-[var(--color-mute)]">{v.versao}{v.placa ? ` · ${v.placa}` : ""}</p>
                    <div className="mt-0.5 flex flex-wrap gap-2">
                      {v.destaque && <span className="text-[10px] font-black uppercase text-[var(--color-red)]">★ destaque</span>}
                      {dias != null && (
                        <span className={`text-[10px] font-black uppercase ${dias >= 60 ? "text-amber-300" : "text-[var(--color-mute)]"}`}>
                          {dias === 0 ? "entrou hoje" : `${dias}d no estoque`}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-mute)]">{v.ano_modelo ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--color-mute)]">{v.km != null ? fmtKm(v.km) : "—"}</td>
                  <td className="px-4 py-3 font-black text-[var(--color-red)]">{brl(v.preco ?? 0)}</td>
                  <td className="px-4 py-3 text-[var(--color-mute)]">{statusLabel[v.status ?? ""] ?? v.status}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <a href={`/veiculos/${v.slug ?? ""}`} target="_blank" rel="noreferrer" className="border border-white/15 px-3 py-1.5 text-xs font-black uppercase text-white hover:border-[var(--color-red)]">Visualizar</a>
                      <Link href={`/admin/estoque/${v.id}`} className="border border-white/15 px-3 py-1.5 text-xs font-black uppercase text-white hover:border-[var(--color-red)]">Editar</Link>
                      <form action={setVeiculoStatus.bind(null, v.id, v.status === "inativo" ? "disponivel" : "inativo")}>
                        <button className="border border-white/15 px-3 py-1.5 text-xs font-black uppercase text-[var(--color-mute)] hover:border-amber-400 hover:text-amber-300">
                          {v.status === "inativo" ? "Reativar" : "Inativar"}
                        </button>
                      </form>
                      <form action={deleteVeiculo.bind(null, v.id)}>
                        <button className="border border-white/15 px-3 py-1.5 text-xs font-black uppercase text-[var(--color-mute)] hover:border-[var(--color-red)] hover:text-[var(--color-red)]">Excluir</button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
