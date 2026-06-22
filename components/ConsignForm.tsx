"use client";

import { useState } from "react";
import { site, whatsappLink } from "@/lib/site";

const empty = {
  nome: "",
  telefone: "",
  veiculo: "",
  ano: "",
  km: "",
  preco: "",
  obs: "",
};

export function ConsignForm() {
  const [f, setF] = useState(empty);
  const set =
    (k: keyof typeof empty) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setF((p) => ({ ...p, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const msg =
      `*Quero consignar/vender meu carro na ${site.name}*\n\n` +
      `Nome: ${f.nome}\n` +
      `Telefone: ${f.telefone}\n` +
      `Veículo: ${f.veiculo}\n` +
      `Ano: ${f.ano}\n` +
      `KM: ${f.km}\n` +
      `Valor desejado: ${f.preco}\n` +
      (f.obs ? `Observações: ${f.obs}\n` : "");
    window.open(whatsappLink(msg), "_blank");
  }

  return (
    <form onSubmit={submit} className="brand-panel p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Seu nome" value={f.nome} onChange={set("nome")} required />
        <Field label="Telefone / WhatsApp" value={f.telefone} onChange={set("telefone")} required />
        <Field label="Marca e modelo" value={f.veiculo} onChange={set("veiculo")} required placeholder="Ex: Honda Civic Touring" className="sm:col-span-2" />
        <Field label="Ano" value={f.ano} onChange={set("ano")} placeholder="Ex: 2020" />
        <Field label="Quilometragem" value={f.km} onChange={set("km")} placeholder="Ex: 60.000" />
        <Field label="Valor desejado" value={f.preco} onChange={set("preco")} placeholder="Ex: R$ 95.000" className="sm:col-span-2" />
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">
            Observações
          </label>
          <textarea
            value={f.obs}
            onChange={set("obs")}
            rows={3}
            placeholder="Estado, opcionais, único dono, etc."
            className="w-full resize-none border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[var(--color-red)]"
          />
        </div>
      </div>

      <button
        type="submit"
        className="sheen mt-6 flex w-full items-center justify-center gap-2.5 bg-[var(--color-red)] px-6 py-4 text-sm font-black uppercase tracking-wide text-white transition-colors hover:bg-[var(--color-red-bright)]"
      >
        <svg viewBox="0 0 32 32" className="h-5 w-5 fill-current" aria-hidden>
          <path d="M16 3C9 3 3.5 8.5 3.5 15.5c0 2.3.6 4.5 1.8 6.4L3 29l7.3-2.2c1.8 1 3.8 1.5 5.7 1.5 7 0 12.5-5.5 12.5-12.5S23 3 16 3z" />
        </svg>
        Enviar pelo WhatsApp
      </button>
      <p className="mt-3 text-center text-xs text-[var(--color-mute)]">
        Sem compromisso · resposta rápida no WhatsApp
      </p>
    </form>
  );
}

function Field({
  label,
  className = "",
  ...props
}: {
  label: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">
        {label}
      </label>
      <input
        {...props}
        className="w-full border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[var(--color-red)]"
      />
    </div>
  );
}
