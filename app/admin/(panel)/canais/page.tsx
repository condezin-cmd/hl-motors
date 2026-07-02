import Link from "next/link";
import { createReadClient } from "@/lib/supabase/server";
import { site } from "@/lib/site";
import { toggleCanal } from "./actions";

export const dynamic = "force-dynamic";

const DESCR: Record<string, { como: string; pronto: boolean }> = {
  site: { como: "Formulários do site (página do carro e “vender/consignar”) já gravam leads automaticamente.", pronto: true },
  email: { como: "Encaminhe os e-mails de aviso dos portais para o webhook abaixo (via Zapier/Make ou encaminhamento do provedor). O sistema lê o e-mail e cria o lead.", pronto: true },
  socarrao: { como: "Puxa leads e anúncios via API. Acende quando chegar a chave oficial do SóCarrão.", pronto: false },
  webmotors: { como: "Enquanto não houver API oficial, capture pelos e-mails de lead (pesca-e-mail).", pronto: true },
  olx: { como: "Capture pelos e-mails de lead do OLX/Zap (pesca-e-mail).", pronto: true },
  icarros: { como: "Capture pelos e-mails de lead do iCarros (pesca-e-mail).", pronto: true },
  facebook: { como: "Facebook Lead Ads via webhook da Meta (requer app na Meta + aprovação). Endpoint pronto para plugar.", pronto: false },
};

export default async function CanaisPage() {
  const sb = await createReadClient();
  const { data: canais } = await sb.from("canais").select("*").order("tipo");
  const secret = process.env.LEADS_WEBHOOK_SECRET;
  const webhookUrl = secret ? `${site.url}/api/leads/inbound?secret=${secret}` : `${site.url}/api/leads/inbound?secret=CONFIGURAR`;

  return (
    <div className="max-w-4xl">
      <Link href="/admin/leads" className="text-sm font-semibold uppercase text-[var(--color-mute)] hover:text-white">← Leads</Link>
      <h1 className="font-display mt-3 text-4xl font-black uppercase text-white">Canais</h1>
      <p className="mt-1 text-[var(--color-mute)]">De onde chegam os leads. Ative cada fonte e conecte pela API ou pelo pesca-e-mail.</p>

      {/* webhook universal */}
      <div className="mt-6 border border-[var(--color-red)]/40 bg-[var(--color-red)]/[0.06] p-5">
        <p className="text-[11px] font-black uppercase tracking-wide text-[var(--color-red-bright)]">Endereço de entrada (webhook)</p>
        <p className="mt-1 text-sm text-[var(--color-mute)]">Aponte os e-mails de lead dos portais (via encaminhamento ou Zapier/Make) para este endereço. Qualquer portal que mande e-mail vira lead aqui.</p>
        <code className="mt-3 block overflow-x-auto whitespace-nowrap border border-white/15 bg-black/40 px-3 py-2.5 text-xs text-emerald-300">{webhookUrl}</code>
        {!secret && <p className="mt-2 text-xs text-amber-300">⚠️ Defina a variável LEADS_WEBHOOK_SECRET no servidor para ativar o webhook.</p>}
        <p className="mt-2 text-[11px] text-white/40">Não compartilhe este endereço — ele é a sua chave de entrada.</p>
      </div>

      <div className="mt-6 space-y-3">
        {(canais ?? []).map((c) => {
          const d = DESCR[c.key] ?? { como: "", pronto: false };
          return (
            <div key={c.key} className="flex flex-wrap items-center justify-between gap-3 border border-white/12 bg-[var(--color-panel)] p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{c.label}</span>
                  <span className="text-[10px] font-black uppercase text-[var(--color-mute)]">· {c.tipo}</span>
                  {c.ativo ? (
                    <span className="text-[10px] font-black uppercase text-emerald-400">● ativo</span>
                  ) : d.pronto ? (
                    <span className="text-[10px] font-black uppercase text-amber-300">○ desligado</span>
                  ) : (
                    <span className="text-[10px] font-black uppercase text-white/30">aguardando liberação</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[var(--color-mute)]">{d.como}</p>
              </div>
              <form action={toggleCanal.bind(null, c.key, !c.ativo)}>
                <button
                  disabled={!d.pronto && !c.ativo}
                  className={`px-4 py-2 text-xs font-black uppercase transition-colors ${
                    c.ativo
                      ? "border border-white/15 text-[var(--color-mute)] hover:border-amber-400 hover:text-amber-300"
                      : "bg-[var(--color-red)] text-white hover:bg-[var(--color-red-bright)] disabled:cursor-not-allowed disabled:opacity-30"
                  }`}
                >
                  {c.ativo ? "Desligar" : "Ativar"}
                </button>
              </form>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border border-white/12 bg-black/20 p-5">
        <h2 className="text-[11px] font-black uppercase tracking-wider text-[var(--color-red)]">Como ligar um portal por e-mail</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-[var(--color-mute)]">
          <li>No portal (Webmotors, OLX, iCarros…), configure o e-mail que recebe os avisos de lead.</li>
          <li>Crie uma automação (Zapier/Make) ou encaminhamento que, ao chegar esse e-mail, faça um POST para o endereço acima com <code className="text-emerald-300">{`{ tipo:"email", from, subject, text }`}</code>.</li>
          <li>Pronto: cada aviso de lead cai direto no funil, já identificando o portal de origem.</li>
        </ol>
      </div>
    </div>
  );
}
