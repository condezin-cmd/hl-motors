"use client";

import { useState } from "react";

export function Gallery({ fotos, alt }: { fotos: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  if (!fotos.length) return null;

  return (
    <div>
      {/* Foto principal — carro inteiro, sem cortar */}
      <div className="relative aspect-[4/3] overflow-hidden border border-white/15 bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fotos[active]}
          alt={alt}
          className="h-full w-full object-contain"
        />
        <span className="absolute bottom-3 right-3 bg-black/70 px-2.5 py-1 text-[11px] font-bold text-white">
          {active + 1}/{fotos.length}
        </span>
      </div>

      {/* Miniaturas */}
      {fotos.length > 1 && (
        <div className="mt-2 grid grid-cols-6 gap-2">
          {fotos.map((f, i) => (
            <button
              key={f}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Foto ${i + 1}`}
              className={`relative aspect-[4/3] overflow-hidden border transition-colors ${
                i === active
                  ? "border-[var(--color-red)]"
                  : "border-white/15 hover:border-white/45"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
