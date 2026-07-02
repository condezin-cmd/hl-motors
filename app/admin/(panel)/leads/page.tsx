import Link from "next/link";
import { createReadClient } from "@/lib/supabase/server";
import { site, whatsappLink } from "@/lib/site";
import { LEAD_STATUSES, origemLabel, type Lead } from "@/lib/leads";
import { setLeadStatus, deleteLead, converterLead, criarLeadManual } from "./actions";

export const dynamic = "force-dynamic";

function tempo(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const sb = await createReadClient();
  const { data: leadsData, error } = await sb.from("leads").select("*").order("created_at", { ascending: false });
  const leads = (leadsData ?? []) as Lead[];

  const veiIds = [...new Set(leads.map((l) => l.veiculo_id).filter(Boolean))] as string[];
  let vMap = new Map<string, string>();
  if (veiIds.length) {
    const { data } = await sb.from("veiculos").select("id, marca, modelo").in("id", veiIds);
    vMap = new Map((data ?? []).map((v) => [v.id, `${v.marca} ${v.modelo}`]));
  }

  const idx = (s: string) => LEAD_STATUSES.findIndex((x) => x.key === s);
  const novos = leads.filter((l) => l.status === "novo").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black uppercase text-white">Leads</h1>
          <p className="mt-1 text-[var(--color-mute)]">Funil de atendimento — cada interessado do site e dos portais em um lugar só.</p>
        </div>
        <div className="flex items-center gap-3">
          {novos > 0 && <span className="bg-amber-400 px-3 py-1.5 text-xs font-black uppercase text-black">{novos} novo(s)</span>}
          <Link href="/admin/canais" className="border border-white/15 px-4 py-3 text-sm font-black uppercase text-white hover:border-[var(--color-red)]">Canais</Link>
        </div>
      </div>

      {erro && <p className="mt-5 border border-[var(--color-red)]/40 bg-[var(--color-red)]/10 p-4 text-sm text-[var(--color-red-bright)]">{decodeURIComponent(erro)}</p>}
      {error && <p className="mt-5 border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-200">⚠️ {error.message}</p>}

      {/* adicionar lead manual */}
      <details className="mt-6 border border-white/12 bg-black/20">
        <summary className="cursor-pointer px-4 py-3 text-xs font-black uppercase tracking-wider text-[var(--color-mute)]">+ Adicionar lead manual</summary>
        <form action={criarLeadManual} className="grid gap-3 p-4 sm:grid-cols-4">
          <input name="nome" placeholder="Nome" required className="border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--color-red)]" />
          <input name="telefone" placeholder="WhatsApp" className="border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--color-red)]" />
          <input name="veiculo_texto" placeholder="Carro de interesse" className="border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--color-red)] sm:col-span-2" />
          <button className="bg-[var(--color-red)] px-4 py-2.5 text-xs font-black uppercase text-white hover:bg-[var(--color-red-bright)] sm:col-span-4 sm:w-fit">Adicionar</button>
        </form>
      </details>

      {leads.length === 0 ? (
        <p className="mt-8 text-[var(--color-mute)]">Nenhum lead ainda. Assim que alguém preencher no site, ele aparece aqui.</p>
      ) : (
        <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
          {LEAD_STATUSES.map((col) => {
            const doStatus = leads.filter((l) => l.status === col.key);
            return (
              <div key={col.key} className="w-72 shrink-0">
                <div className={`flex items-center justify-between border-b-2 ${col.cls} pb-2`}>
                  <span className="flex items-center gap-2 text-sm font-black uppercase text-white">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${col.dot}`} />{col.label}
                  </span>
                  <span className="text-xs font-black text-[var(--color-mute)]">{doStatus.length}</span>
                </div>
                <div className="mt-3 space-y-3">
                  {doStatus.map((l) => {
                    const interesse = (l.veiculo_id && vMap.get(l.veiculo_id)) || l.veiculo_texto || "—";
                    const i = idx(l.status);
                    return (
                      <div key={l.id} className="border border-white/12 bg-[var(--color-panel)] p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-[var(--color-red)]">{origemLabel(l.origem)}</span>
                          <span className="text-[10px] text-[var(--color-mute)]">{tempo(l.created_at)}</span>
                        </div>
                        <p className="mt-1 font-bold text-white">{l.nome ?? "Sem nome"}</p>
                        {l.telefone && (
                          <a href={whatsappLink(`Olá ${l.nome ?? ""}! Aqui é da ${site.name}.`)} target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-400 hover:underline">
                            {l.telefone} · WhatsApp
                          </a>
                        )}
                        <p className="mt-1.5 text-xs text-[var(--color-mute)]">🚗 {interesse}</p>
                        {l.mensagem && <p className="mt-1 line-clamp-2 text-xs text-white/60">{l.mensagem}</p>}

                        <div className="mt-3 flex items-center gap-1">
                          <form action={setLeadStatus.bind(null, l.id, LEAD_STATUSES[Math.max(0, i - 1)].key)}>
                            <button disabled={i <= 0} className="border border-white/15 px-2 py-1 text-xs font-black text-white hover:border-[var(--color-red)] disabled:opacity-30" title="Voltar etapa">◀</button>
                          </form>
                          <form action={setLeadStatus.bind(null, l.id, LEAD_STATUSES[Math.min(LEAD_STATUSES.length - 1, i + 1)].key)}>
                            <button disabled={i >= LEAD_STATUSES.length - 1} className="border border-white/15 px-2 py-1 text-xs font-black text-white hover:border-[var(--color-red)] disabled:opacity-30" title="Avançar etapa">▶</button>
                          </form>
                          <div className="flex-1" />
                          <form action={deleteLead.bind(null, l.id)}>
                            <button className="border border-white/15 px-2 py-1 text-xs font-black text-[var(--color-mute)] hover:border-[var(--color-red)] hover:text-[var(--color-red)]" title="Excluir">✕</button>
                          </form>
                        </div>

                        {l.negociacao_id ? (
                          <Link href={`/admin/negociacoes/${l.negociacao_id}`} className="mt-2 block bg-blue-500/20 px-2 py-1.5 text-center text-[10px] font-black uppercase text-blue-300 hover:bg-blue-500/30">
                            Ver negociação →
                          </Link>
                        ) : (
                          <form action={converterLead.bind(null, l.id)} className="mt-2">
                            <button className="w-full bg-[var(--color-red)]/15 px-2 py-1.5 text-[10px] font-black uppercase text-[var(--color-red-bright)] hover:bg-[var(--color-red)]/25">
                              Virar negociação
                            </button>
                          </form>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
