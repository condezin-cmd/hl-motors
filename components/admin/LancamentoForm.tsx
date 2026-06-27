"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { CATEGORIAS, catByKey } from "@/lib/financeiro";
import { createLancamento } from "@/app/admin/(panel)/financeiro/actions";

type Opt = { id: string; label: string };

export function LancamentoForm({ veiculos, categoriaInicial }: { veiculos: Opt[]; categoriaInicial?: string }) {
  const [state, formAction, pending] = useActionState(createLancamento, null);
  const [categoria, setCategoria] = useState(categoriaInicial ?? "venda");
  const cat = catByKey(categoria);
  const hoje = new Date().toISOString().slice(0, 10);

  const entradas = CATEGORIAS.filter((c) => c.tipo === "entrada");
  const saidas = CATEGORIAS.filter((c) => c.tipo === "saida");

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div>
        <Label>Categoria</Label>
        <select name="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} className={selCls}>
          <optgroup label="Entradas (dinheiro que entra)">
            {entradas.map((c) => (<option key={c.key} value={c.key}>{c.label}</option>))}
          </optgroup>
          <optgroup label="Saídas (dinheiro que sai)">
            {saidas.map((c) => (<option key={c.key} value={c.key}>{c.label}</option>))}
          </optgroup>
        </select>
        <p className={`mt-1.5 text-xs font-black uppercase ${cat?.tipo === "entrada" ? "text-emerald-400" : "text-[var(--color-red-bright)]"}`}>
          {cat?.tipo === "entrada" ? "↑ Entrada" : "↓ Saída"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Valor (R$)</Label>
          <input name="valor" type="number" step="0.01" required className={inpCls} />
        </div>
        <div>
          <Label>Data</Label>
          <input name="data" type="date" defaultValue={hoje} className={inpCls} />
        </div>
      </div>

      {cat?.veiculo && (
        <div>
          <Label>Veículo {categoria === "reparo" || categoria === "custo_veiculo" ? "(custo entra no carro)" : "(opcional)"}</Label>
          <select name="veiculo_id" defaultValue="" className={selCls}>
            <option value="">— sem vínculo —</option>
            {veiculos.map((v) => (<option key={v.id} value={v.id}>{v.label}</option>))}
          </select>
        </div>
      )}

      {cat?.socio && (
        <div>
          <Label>Sócio</Label>
          <input name="socio" placeholder="Nome do sócio" className={inpCls} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Forma de pagamento (opcional)</Label>
          <input name="forma_pagamento" placeholder="PIX, dinheiro, transferência…" className={inpCls} />
        </div>
        <div>
          <Label>Descrição (opcional)</Label>
          <input name="descricao" placeholder="Ex.: reparo no motor, aluguel…" className={inpCls} />
        </div>
      </div>

      {state?.error && (
        <p className="border border-[var(--color-red)]/40 bg-[var(--color-red)]/10 px-3 py-2 text-sm text-[var(--color-red-bright)]">{state.error}</p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="bg-[var(--color-red)] px-7 py-3.5 text-sm font-black uppercase text-white hover:bg-[var(--color-red-bright)] disabled:opacity-60">
          {pending ? "Salvando..." : "Lançar"}
        </button>
        <Link href="/admin/financeiro" className="border border-white/15 px-7 py-3.5 text-sm font-black uppercase text-white hover:border-white/40">Cancelar</Link>
      </div>
    </form>
  );
}

const selCls = "w-full border border-white/15 bg-[var(--color-graphite)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]";
const inpCls = "w-full border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]";
function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">{children}</label>;
}
