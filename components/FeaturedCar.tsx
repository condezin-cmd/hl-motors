import Link from "next/link";
import { Car } from "@/lib/types";
import { brl, km } from "@/lib/format";
import { site, whatsappLink } from "@/lib/site";
import { CarImage } from "./CarImage";
import { StatusBadge } from "./StatusBadge";

export function FeaturedCar({ car }: { car: Car }) {
  const msg = `Olá, ${site.name}! Tenho interesse no ${car.marca} ${car.modelo} ${car.versao} (${car.ano}) por ${brl(car.preco)}. Ainda está disponível?`;

  return (
    <div className="brand-panel overflow-hidden">
      <div className="grid lg:grid-cols-[1.25fr_1fr]">
        {/* Imagem grande */}
        <div className="relative aspect-[16/11] overflow-hidden border-b border-white/10 lg:border-b-0 lg:border-r">
          <CarImage car={car} rounded="rounded-none" />
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="bg-[var(--color-red)] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
              Destaque da semana
            </span>
            <StatusBadge status={car.status} />
          </div>
        </div>

        {/* Informações */}
        <div className="flex flex-col justify-center p-7 sm:p-9">
          <span className="font-tech text-[11px] font-black uppercase tracking-[0.22em] text-[var(--color-red)]">
            {car.marca} · {car.anoFab}/{car.ano}
          </span>
          <h2 className="font-display mt-3 text-5xl font-black uppercase leading-[0.9] text-white sm:text-6xl">
            {car.modelo}
          </h2>
          <p className="mt-2 text-lg text-[var(--color-mute)]">{car.versao}</p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase text-[var(--color-mute)]">
            <Spec>{km(car.km)}</Spec>
            <Spec>{car.cambio}</Spec>
            <Spec>{car.combustivel}</Spec>
            <Spec>{car.cor}</Spec>
          </div>

          <div className="mt-7">
            <p className="text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">
              À vista
            </p>
            <p className="font-display text-5xl font-black text-[var(--color-red)]">
              {brl(car.preco)}
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={`/veiculos/${car.id}`}
              className="border-2 border-white px-6 py-3.5 text-sm font-black uppercase text-white transition-colors hover:border-[var(--color-red)] hover:bg-[var(--color-red)]"
            >
              Ver detalhes
            </Link>
            <a
              href={whatsappLink(msg)}
              target="_blank"
              rel="noreferrer"
              className="sheen bg-[var(--color-red)] px-6 py-3.5 text-sm font-black uppercase text-white transition-colors hover:bg-[var(--color-red-bright)]"
            >
              Tenho interesse
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-white/12 bg-black/20 px-2.5 py-1">{children}</span>
  );
}
