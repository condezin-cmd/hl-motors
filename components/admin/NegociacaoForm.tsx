"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PagamentoBuilder, type AvalOpt } from "@/components/admin/PagamentoBuilder";
import { createNegociacao, updateNegociacao } from "@/app/admin/(panel)/negociacoes/actions";

type Opt = { id: string; label: string };
const STATUS = [
  { v: "aberta", l: "Aberta" },
  { v: "fechada", l: "Fechada (venda concluída)" },
  { v: "cancelada", l: "Cancelada" },
];
const DRAFT_KEY = "neg-draft";

export function NegociacaoForm({
  id,
  values,
  clientes,
  veiculos,
  avaliacoes,
}: {
  id?: string;
  values?: any;
  clientes: Opt[];
  veiculos: Opt[];
  avaliacoes: AvalOpt[];
}) {
  const action = id ? updateNegociacao.bind(null, id) : createNegociacao;
  const [state, formAction, pending] = useActionState(action, null);
  const v = values ?? {};
  const basePath = usePathname() || "/admin/negociacoes/novo";
  const formRef = useRef<HTMLFormElement>(null);

  const [comprador, setComprador] = useState<string>(v.comprador_id ?? "");
  const [veiculo, setVeiculo] = useState<string>(v.veiculo_id ?? "");
  const [proprietario, setProprietario] = useState<string>(v.proprietario_id ?? "");
  const [avaliacao, setAvaliacao] = useState<string>(v.avaliacao_id ?? "");
  const [trocaProp, setTrocaProp] = useState<string>(v.troca_proprietario_id ?? "");
  const [valor, setValor] = useState<string>(v.valor ? String(v.valor) : "");
  const [status, setStatus] = useState<string>(v.status ?? "aberta");
  const [observacoes, setObservacoes] = useState<string>(v.observacoes ?? "");
  const [propDif, setPropDif] = useState(!!v.proprietario_id);
  const [temTroca, setTemTroca] = useState(!!v.tem_troca);
  const [trocaDif, setTrocaDif] = useState(!!v.troca_proprietario_id);
  const [pagInitial, setPagInitial] = useState<any[]>(Array.isArray(v.pagamentos) ? v.pagamentos : []);
  const [pagKey, setPagKey] = useState(0);

  const valorNum = Number(String(valor).replace(/[^\d]/g, "")) || 0;

  // Restaura o rascunho ao voltar do cadastro de cliente/carro e seleciona o novo registro.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const novo = sp.get("novo");
    const campo = sp.get("campo");
    if (!novo) return;
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setComprador(d.comprador ?? ""); setVeiculo(d.veiculo ?? "");
        setProprietario(d.proprietario ?? ""); setAvaliacao(d.avaliacao ?? "");
        setTrocaProp(d.trocaProp ?? ""); setValor(d.valor ?? ""); setStatus(d.status ?? "aberta");
        setObservacoes(d.observacoes ?? ""); setPropDif(!!d.propDif); setTemTroca(!!d.temTroca);
        setTrocaDif(!!d.trocaDif);
        if (Array.isArray(d.pagamentos) && d.pagamentos.length) { setPagInitial(d.pagamentos); setPagKey((k) => k + 1); }
      }
    } catch {}
    if (campo === "comprador") setComprador(novo);
    else if (campo === "veiculo") setVeiculo(novo);
    else if (campo === "proprietario") { setPropDif(true); setProprietario(novo); }
    else if (campo === "trocaProp") { setTemTroca(true); setTrocaDif(true); setTrocaProp(novo); }
    sessionStorage.removeItem(DRAFT_KEY);
    window.history.replaceState({}, "", basePath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function irCriar(tipo: "cliente" | "veiculo", campo: string) {
    const pagEl = formRef.current?.elements.namedItem("pagamentos") as HTMLInputElement | null;
    let pagamentos: any[] = [];
    try { pagamentos = pagEl?.value ? JSON.parse(pagEl.value) : []; } catch {}
    const draft = { comprador, veiculo, proprietario, avaliacao, trocaProp, valor, status, observacoes, propDif, temTroca, trocaDif, pagamentos };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    const url = tipo === "cliente" ? "/admin/clientes/novo" : "/admin/estoque/novo";
    window.location.href = `${url}?next=${encodeURIComponent(basePath)}&campo=${campo}`;
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-8">
      <Group title="Venda">
        <div>
          <CSel name="comprador_id" label="Comprador" options={clientes} value={comprador} onChange={setComprador} />
          <Criar onClick={() => irCriar("cliente", "comprador")}>+ Cadastrar novo cliente</Criar>
        </div>
        <div>
          <CSel name="veiculo_id" label="Veículo vendido" options={veiculos} value={veiculo} onChange={setVeiculo} />
          <Criar onClick={() => irCriar("veiculo", "veiculo")}>+ Cadastrar novo veículo</Criar>
        </div>
        <div>
          <Label>Valor da venda (R$)</Label>
          <input name="valor" type="number" value={valor} onChange={(e) => setValor(e.target.value)} className={inpCls} />
        </div>
        <div>
          <Label>Status</Label>
          <select name="status" value={status} onChange={(e) => setStatus(e.target.value)} className={selCls}>
            {STATUS.map((s) => (<option key={s.v} value={s.v}>{s.l}</option>))}
          </select>
        </div>
      </Group>

      <div className="border border-white/12 bg-black/20 p-5">
        <Check name="proprietario_diferente" checked={propDif} onChange={setPropDif}
          label="O proprietário do veículo vendido é outra pessoa (consignado / de terceiro)" />
        {propDif && (
          <div className="mt-4 max-w-md">
            <CSel name="proprietario_id" label="Proprietário do veículo (dono real)" options={clientes} value={proprietario} onChange={setProprietario} />
            <Criar onClick={() => irCriar("cliente", "proprietario")}>+ Cadastrar novo cliente</Criar>
            <p className="mt-1.5 text-xs text-[var(--color-mute)]">Usado como <strong>outorgante</strong> na procuração do veículo vendido.</p>
          </div>
        )}
      </div>

      <div className="border border-white/12 bg-black/20 p-5">
        <Check name="tem_troca" checked={temTroca} onChange={setTemTroca} label="Há um carro na troca (parte do pagamento)" />
        {temTroca && (
          <div className="mt-4 space-y-4">
            <div className="max-w-md">
              <CSel name="avaliacao_id" label="Carro da troca (avaliação)" options={avaliacoes.map((a) => ({ id: a.id, label: a.label }))} value={avaliacao} onChange={setAvaliacao} />
              <p className="mt-1.5 text-xs text-[var(--color-mute)]">O carro precisa estar cadastrado em <strong>Avaliações</strong>.</p>
            </div>
            <Check name="troca_proprietario_diferente" checked={trocaDif} onChange={setTrocaDif} label="O dono do carro da troca é outra pessoa (não o comprador)" />
            {trocaDif && (
              <div className="max-w-md">
                <CSel name="troca_proprietario_id" label="Dono do carro da troca" options={clientes} value={trocaProp} onChange={setTrocaProp} />
                <Criar onClick={() => irCriar("cliente", "trocaProp")}>+ Cadastrar novo cliente</Criar>
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <Label>Formas de pagamento</Label>
        <p className="-mt-1 mb-3 text-xs text-[var(--color-mute)]">
          Some várias formas. Conforme você informa, mostramos quanto falta pra fechar.
        </p>
        <PagamentoBuilder key={pagKey} name="pagamentos" avaliacoes={avaliacoes} alvo={valorNum} initial={pagInitial} />
      </div>

      <div>
        <Label>Observações</Label>
        <textarea name="observacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} className="w-full resize-none border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]" />
      </div>

      {state?.error && (
        <p className="border border-[var(--color-red)]/40 bg-[var(--color-red)]/10 px-3 py-2 text-sm text-[var(--color-red-bright)]">{state.error}</p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="bg-[var(--color-red)] px-7 py-3.5 text-sm font-black uppercase text-white hover:bg-[var(--color-red-bright)] disabled:opacity-60">
          {pending ? "Salvando..." : id ? "Atualizar negociação" : "Criar negociação"}
        </button>
        <Link href="/admin/negociacoes" className="border border-white/15 px-7 py-3.5 text-sm font-black uppercase text-white hover:border-white/40">Cancelar</Link>
      </div>
    </form>
  );
}

const selCls = "w-full border border-white/15 bg-[var(--color-graphite)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]";
const inpCls = "w-full border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display mb-4 text-lg font-black uppercase text-[var(--color-red)]">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">{children}</label>;
}
function CSel({ name, label, options, value, onChange }: { name: string; label: string; options: Opt[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <select name={name} value={value} onChange={(e) => onChange(e.target.value)} className={selCls}>
        <option value="">— selecione —</option>
        {options.map((o) => (<option key={o.id} value={o.id}>{o.label}</option>))}
      </select>
    </div>
  );
}
function Criar({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="mt-1.5 text-xs font-black uppercase text-[var(--color-mute)] hover:text-[var(--color-red)]">
      {children}
    </button>
  );
}
function Check({ name, checked, onChange, label }: { name: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-bold text-white">
      <input type="checkbox" name={name} checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
      {label}
    </label>
  );
}
