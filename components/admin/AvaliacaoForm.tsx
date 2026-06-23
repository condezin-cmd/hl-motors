"use client";

import { useActionState } from "react";
import Link from "next/link";
import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { FileUploader } from "@/components/admin/FileUploader";
import { createAvaliacao, updateAvaliacao } from "@/app/admin/(panel)/avaliacoes/actions";

type Cliente = { id: string; nome: string };
const COMB = ["Flex", "Gasolina", "Diesel", "Híbrido", "Elétrico"];
const STATUS = [
  { v: "avaliado", l: "Avaliado" },
  { v: "aceito", l: "Aceito" },
  { v: "recusado", l: "Recusado" },
  { v: "usado", l: "Usado em venda" },
];

export function AvaliacaoForm({
  id,
  values,
  clientes,
}: {
  id?: string;
  values?: any;
  clientes: Cliente[];
}) {
  const action = id ? updateAvaliacao.bind(null, id) : createAvaliacao;
  const [state, formAction, pending] = useActionState(action, null);
  const v = values ?? {};

  return (
    <form action={formAction} className="space-y-8">
      <Group title="Proprietário">
        <div className="sm:col-span-2">
          <Label>Cliente (dono do veículo)</Label>
          <select
            name="cliente_id"
            defaultValue={v.cliente_id ?? ""}
            className="w-full border border-white/15 bg-[var(--color-graphite)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]"
          >
            <option value="">— selecione —</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
      </Group>

      <Group title="Veículo avaliado">
        <F name="marca" label="Marca" def={v.marca} required />
        <F name="modelo" label="Modelo" def={v.modelo} required />
        <F name="versao" label="Versão" def={v.versao} className="sm:col-span-2" />
        <F name="ano_fab" label="Ano fab." def={v.ano_fab} type="number" />
        <F name="ano_modelo" label="Ano modelo" def={v.ano_modelo} type="number" />
        <F name="km" label="KM" def={v.km} type="number" />
        <F name="cor" label="Cor" def={v.cor} />
        <Sel name="combustivel" label="Combustível" def={v.combustivel} options={COMB} />
        <F name="placa" label="Placa" def={v.placa} />
        <F name="renavam" label="Renavam" def={v.renavam} />
        <F name="chassi" label="Chassi" def={v.chassi} />
      </Group>

      <Group title="Avaliação">
        <F name="valor_avaliado" label="Valor avaliado (R$)" def={v.valor_avaliado} type="number" />
        <F name="valor_fipe" label="Valor FIPE (R$)" def={v.valor_fipe} type="number" />
        <div>
          <Label>Status</Label>
          <select
            name="status"
            defaultValue={v.status ?? "avaliado"}
            className="w-full border border-white/15 bg-[var(--color-graphite)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]"
          >
            {STATUS.map((s) => (<option key={s.v} value={s.v}>{s.l}</option>))}
          </select>
        </div>
      </Group>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label>Estado / condição do veículo</Label>
          <textarea name="estado" defaultValue={v.estado ?? ""} rows={4} placeholder="Pintura, mecânica, pneus, riscos, etc." className="w-full resize-none border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]" />
        </div>
        <div>
          <Label>Observações</Label>
          <textarea name="observacoes" defaultValue={v.observacoes ?? ""} rows={4} className="w-full resize-none border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]" />
        </div>
      </div>

      <div>
        <h3 className="font-display mb-3 text-lg font-black uppercase text-[var(--color-red)]">Fotos do veículo</h3>
        <PhotoUploader name="fotos" initial={v.fotos ?? []} />
      </div>

      <div>
        <h3 className="font-display mb-2 text-lg font-black uppercase text-[var(--color-red)]">Documentos da avaliação</h3>
        <p className="mb-3 text-xs text-[var(--color-mute)]">CRLV, laudo, fotos do documento, etc. (restrito)</p>
        <FileUploader name="arquivos" initial={(v.arquivos as any) ?? []} prefix="avaliacoes" />
      </div>

      {state?.error && (
        <p className="border border-[var(--color-red)]/40 bg-[var(--color-red)]/10 px-3 py-2 text-sm text-[var(--color-red-bright)]">{state.error}</p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="bg-[var(--color-red)] px-7 py-3.5 text-sm font-black uppercase text-white hover:bg-[var(--color-red-bright)] disabled:opacity-60">
          {pending ? "Salvando..." : id ? "Atualizar avaliação" : "Salvar avaliação"}
        </button>
        <Link href="/admin/avaliacoes" className="border border-white/15 px-7 py-3.5 text-sm font-black uppercase text-white hover:border-white/40">Cancelar</Link>
      </div>
    </form>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display mb-4 text-lg font-black uppercase text-[var(--color-red)]">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">{children}</label>;
}
function F({ name, label, def, type = "text", required, className = "" }: any) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <input name={name} type={type} required={required} defaultValue={def ?? ""} className="w-full border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]" />
    </div>
  );
}
function Sel({ name, label, def, options }: any) {
  return (
    <div>
      <Label>{label}</Label>
      <select name={name} defaultValue={def ?? ""} className="w-full border border-white/15 bg-[var(--color-graphite)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]">
        <option value="">—</option>
        {options.map((o: string) => (<option key={o} value={o}>{o}</option>))}
      </select>
    </div>
  );
}
