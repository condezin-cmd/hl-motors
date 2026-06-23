"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FileUploader } from "@/components/admin/FileUploader";
import { DocImport } from "@/components/admin/DocImport";
import { fillForm } from "@/lib/admin/fill-form";
import { createVeiculo, updateVeiculo } from "@/app/admin/(panel)/estoque/actions";

const VEICULO_LABELS: Record<string, string> = {
  marca: "Marca", modelo: "Modelo", versao: "Versão", ano_fab: "Ano fab.",
  ano_modelo: "Ano modelo", cor: "Cor", combustivel: "Combustível",
  placa: "Placa", renavam: "Renavam", chassi: "Chassi",
};

type Values = Record<string, any>;
type Cliente = { id: string; nome: string };

const CAMBIO = ["Manual", "Automático", "Automatizado", "CVT"];
const COMB = ["Flex", "Gasolina", "Diesel", "Híbrido", "Elétrico"];
const STATUS = ["disponivel", "reservado", "vendido", "consignado", "inativo"];

export function VeiculoForm({
  id,
  values,
  clientes,
}: {
  id?: string;
  values?: Values;
  clientes: Cliente[];
}) {
  const action = id ? updateVeiculo.bind(null, id) : createVeiculo;
  const [state, formAction, pending] = useActionState(action, null);
  const v = values ?? {};
  const formRef = useRef<HTMLFormElement>(null);
  const [fotos, setFotos] = useState<string[]>(v.fotos ?? []);
  const [uploading, setUploading] = useState(false);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    const sb = createClient();
    for (const file of files) {
      const path = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
      const { error } = await sb.storage.from("veiculos").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (!error) {
        const { data } = sb.storage.from("veiculos").getPublicUrl(path);
        setFotos((f) => [...f, data.publicUrl]);
      }
    }
    setUploading(false);
    e.target.value = "";
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-8">
      <input type="hidden" name="fotos" value={JSON.stringify(fotos)} />

      <DocImport
        tipo="veiculo"
        titulo="Importar do documento (CRLV)"
        hint="Envie o PDF ou a foto do CRLV — a IA preenche marca, modelo, ano, placa, renavam, chassi…"
        onExtract={(dados) => fillForm(formRef.current, dados, VEICULO_LABELS)}
      />

      {/* Fotos */}
      <Group title="Fotos">
        <div className="sm:col-span-2 lg:col-span-4">
          <div className="flex flex-wrap gap-3">
            {fotos.map((url, i) => (
              <div key={url} className="relative h-24 w-32 overflow-hidden border border-white/15">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFotos((f) => f.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 bg-black/70 px-1.5 text-xs font-black text-white"
                >
                  ✕
                </button>
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 bg-[var(--color-red)] px-1.5 text-[9px] font-black uppercase text-white">
                    capa
                  </span>
                )}
              </div>
            ))}
            <label className="flex h-24 w-32 cursor-pointer items-center justify-center border border-dashed border-white/25 text-xs font-bold uppercase text-[var(--color-mute)] hover:border-[var(--color-red)]">
              {uploading ? "Enviando..." : "+ Foto"}
              <input type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
            </label>
          </div>
          <p className="mt-2 text-xs text-[var(--color-mute)]">
            A primeira foto é a capa. Você pode enviar várias.
          </p>
        </div>
      </Group>

      <Group title="Veículo">
        <F name="marca" label="Marca" def={v.marca} required />
        <F name="modelo" label="Modelo" def={v.modelo} required />
        <F name="versao" label="Versão" def={v.versao} className="sm:col-span-2" />
        <F name="ano_fab" label="Ano fab." def={v.ano_fab} type="number" />
        <F name="ano_modelo" label="Ano modelo" def={v.ano_modelo} type="number" />
        <F name="km" label="KM" def={v.km} type="number" />
        <F name="preco" label="Preço (R$)" def={v.preco} type="number" />
        <Sel name="cambio" label="Câmbio" def={v.cambio} options={CAMBIO} />
        <Sel name="combustivel" label="Combustível" def={v.combustivel} options={COMB} />
        <F name="cor" label="Cor" def={v.cor} />
        <F name="portas" label="Portas" def={v.portas ?? 4} type="number" />
      </Group>

      <Group title="Documentação">
        <F name="placa" label="Placa" def={v.placa} />
        <F name="renavam" label="Renavam" def={v.renavam} />
        <F name="chassi" label="Chassi" def={v.chassi} className="sm:col-span-2" />
      </Group>

      <Group title="Publicação">
        <Sel name="status" label="Status" def={v.status ?? "disponivel"} options={STATUS} />
        <div>
          <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">
            Origem (entrada)
          </label>
          <select
            name="origem"
            defaultValue={v.origem ?? "compra"}
            className="w-full border border-white/15 bg-[var(--color-graphite)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]"
          >
            <option value="compra">Compra direta</option>
            <option value="consignacao">Consignação</option>
            <option value="troca">Troca (parte do pagamento)</option>
          </select>
        </div>
        <div className="flex items-end gap-2 pb-2">
          <label className="flex items-center gap-2 text-sm text-white">
            <input type="checkbox" name="destaque" defaultChecked={!!v.destaque} className="h-4 w-4" />
            Destaque
          </label>
        </div>
        <div className="flex items-end gap-2 pb-2">
          <label className="flex items-center gap-2 text-sm text-white">
            <input type="checkbox" name="is_consignado" defaultChecked={!!v.is_consignado} className="h-4 w-4" />
            Consignado
          </label>
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">
            Proprietário (consignação)
          </label>
          <select
            name="proprietario_id"
            defaultValue={v.proprietario_id ?? ""}
            className="w-full border border-white/15 bg-[var(--color-graphite)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]"
          >
            <option value="">— nenhum —</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
      </Group>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">
            Opcionais (um por linha)
          </label>
          <textarea
            name="opcionais"
            defaultValue={(v.opcionais ?? []).join("\n")}
            rows={5}
            className="w-full resize-none border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">
            Descrição
          </label>
          <textarea
            name="descricao"
            defaultValue={v.descricao ?? ""}
            rows={5}
            className="w-full resize-none border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]"
          />
        </div>
      </div>

      <div>
        <h3 className="font-display mb-4 text-lg font-black uppercase text-[var(--color-red)]">
          Documentos do veículo
        </h3>
        <p className="mb-3 text-xs text-[var(--color-mute)]">
          CRLV, laudo cautelar, nota fiscal, etc. (acesso restrito)
        </p>
        <FileUploader name="arquivos" initial={v.arquivos ?? []} prefix="veiculos" />
      </div>

      {state?.error && (
        <p className="border border-[var(--color-red)]/40 bg-[var(--color-red)]/10 px-3 py-2 text-sm text-[var(--color-red-bright)]">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending || uploading}
          className="bg-[var(--color-red)] px-7 py-3.5 text-sm font-black uppercase text-white hover:bg-[var(--color-red-bright)] disabled:opacity-60"
        >
          {pending ? "Salvando..." : id ? "Atualizar veículo" : "Salvar veículo"}
        </button>
        <Link href="/admin/estoque" className="border border-white/15 px-7 py-3.5 text-sm font-black uppercase text-white hover:border-white/40">
          Cancelar
        </Link>
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

function F({ name, label, def, type = "text", required, className = "" }: { name: string; label: string; def?: any; type?: string; required?: boolean; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">{label}</label>
      <input name={name} type={type} required={required} defaultValue={def ?? ""} className="w-full border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]" />
    </div>
  );
}

function Sel({ name, label, def, options }: { name: string; label: string; def?: string; options: string[] }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">{label}</label>
      <select name={name} defaultValue={def ?? ""} className="w-full border border-white/15 bg-[var(--color-graphite)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]">
        {options.map((o) => (<option key={o} value={o}>{o}</option>))}
      </select>
    </div>
  );
}
