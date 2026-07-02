"use client";

import { useMemo, useState } from "react";
import { Car } from "@/lib/types";
import { CarCard } from "./CarCard";

type Sort = "relevancia" | "menor" | "maior" | "km";

export function CarCatalog({ cars, brands }: { cars: Car[]; brands: string[] }) {
  const [brand, setBrand] = useState<string>("Todas");
  const [sort, setSort] = useState<Sort>("relevancia");
  const [busca, setBusca] = useState("");

  const list = useMemo(() => {
    const q = busca.trim().toLowerCase();
    let l = brand === "Todas" ? cars : cars.filter((c) => c.marca === brand);
    if (q) l = l.filter((c) => `${c.marca} ${c.modelo} ${c.versao} ${c.ano}`.toLowerCase().includes(q));
    l = [...l];
    if (sort === "menor") l.sort((a, b) => a.preco - b.preco);
    if (sort === "maior") l.sort((a, b) => b.preco - a.preco);
    if (sort === "km") l.sort((a, b) => a.km - b.km);
    if (sort === "relevancia")
      l.sort((a, b) => Number(b.destaque) - Number(a.destaque));
    return l;
  }, [cars, brand, sort, busca]);

  return (
    <div>
      <div className="mb-5">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="🔎 Buscar por marca, modelo ou versão…"
          className="w-full border border-white/15 bg-[var(--color-panel)] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-[var(--color-red)]"
        />
      </div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {["Todas", ...brands].map((b) => (
            <button
              key={b}
              onClick={() => setBrand(b)}
              className={`border px-4 py-2 text-sm font-black uppercase transition-colors ${
                brand === b
                  ? "border-[var(--color-red)] bg-[var(--color-red)] text-white"
                  : "border-white/15 bg-[var(--color-panel)] text-[var(--color-mute)] hover:border-white/40 hover:text-white"
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase text-[var(--color-mute)]">{list.length} veículo(s)</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="border border-white/15 bg-[var(--color-panel)] px-4 py-2 text-sm font-semibold text-white outline-none"
          >
            <option value="relevancia">Mais relevantes</option>
            <option value="menor">Menor preço</option>
            <option value="maior">Maior preço</option>
            <option value="km">Menor km</option>
          </select>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="border border-white/15 py-20 text-center text-[var(--color-mute)]">
          Nenhum veículo encontrado para esse filtro.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}
