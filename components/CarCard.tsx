import Link from "next/link";
import { Car } from "@/lib/types";
import { brl, km } from "@/lib/format";
import { CarImage } from "./CarImage";
import { StatusBadge } from "./StatusBadge";

export function CarCard({ car, compact = false }: { car: Car; compact?: boolean }) {
  return (
    <Link
      href={`/veiculos/${car.id}`}
      className="group block overflow-hidden border border-white/15 bg-[var(--color-panel)] transition-transform duration-300 hover:-translate-y-1 hover:border-[var(--color-red)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10">
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]">
          <CarImage car={car} rounded="rounded-none" />
        </div>
        <div className="absolute left-3 top-3">
          <StatusBadge status={car.status} />
        </div>
        {car.destaque && (
          <div className="absolute right-3 top-3 bg-[var(--color-red)] px-3 py-1 text-[10px] font-black uppercase text-white">
            Destaque
          </div>
        )}
      </div>

      <div className={compact ? "p-4" : "p-5"}>
        <h3 className={`font-display font-black uppercase leading-none text-white ${compact ? "text-xl" : "text-2xl"}`}>
          {car.marca} {car.modelo}
        </h3>
        <p className="mt-1 line-clamp-1 text-sm text-[var(--color-mute)]">{car.versao}</p>

        <div className={`flex flex-wrap gap-2 text-xs font-semibold uppercase text-[var(--color-mute)] ${compact ? "mt-4" : "mt-5"}`}>
          <Spec>{car.ano}</Spec>
          <Spec>{km(car.km)}</Spec>
          {!compact && <Spec>{car.cambio}</Spec>}
          {!compact && <Spec>{car.combustivel}</Spec>}
        </div>

        <div className={`flex items-end justify-between gap-4 ${compact ? "mt-5" : "mt-6"}`}>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">
              À vista
            </p>
            <p className={`font-display font-black text-[var(--color-red)] ${compact ? "text-2xl" : "text-3xl"}`}>
              {brl(car.preco)}
            </p>
          </div>
          <span className="border border-white/20 px-4 py-2 text-xs font-black uppercase text-white transition-colors group-hover:border-[var(--color-red)] group-hover:bg-[var(--color-red)]">
            Comprar
          </span>
        </div>
      </div>
    </Link>
  );
}

function Spec({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-white/12 bg-black/20 px-2.5 py-1">
      {children}
    </span>
  );
}
