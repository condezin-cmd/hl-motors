import Link from "next/link";
import { Car } from "@/lib/types";
import { brl, km } from "@/lib/format";
import { site, whatsappLink } from "@/lib/site";
import { CarImage } from "./CarImage";
import { StatusBadge } from "./StatusBadge";

export function FeaturedCar({ car }: { car: Car }) {
  const msg = `Olá, ${site.name}! Tenho interesse no ${car.marca} ${car.modelo} ${car.versao} (${car.ano}) por ${brl(car.preco)}. Ainda está disponível?`;

  return (
    <div className="brand-panel relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-10 h-1 bg-[var(--color-red)]" />
      <div className="grid lg:grid-cols-2">
        {/* Imagem preenchendo a coluna */}
        <div className="relative min-h-[300px] overflow-hidden border-b border-white/10 sm:min-h-[380px] lg:border-b-0 lg:border-r">
          <div className="absolute inset-0">
            <CarImage car={car} rounded="rounded-none" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute left-4 top-5 flex items-center gap-2">
            <span className="bg-[var(--color-red)] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
              ★ Destaque da semana
            </span>
            <StatusBadge status={car.status} />
          </div>
        </div>

        {/* Informações */}
        <div className="flex flex-col justify-center p-7 sm:p-10">
          <span className="font-tech text-[11px] font-black uppercase tracking-[0.22em] text-[var(--color-red)]">
            {car.marca} · {car.anoFab}/{car.ano}
          </span>
          <h2 className="font-display mt-3 text-5xl font-black uppercase leading-[0.88] text-white sm:text-6xl">
            {car.modelo}
          </h2>
          <p className="mt-2 text-lg text-[var(--color-mute)]">{car.versao}</p>

          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-4">
            <Spec label="KM" value={km(car.km)} />
            <Spec label="Câmbio" value={car.cambio} />
            <Spec label="Combustível" value={car.combustivel} />
            <Spec label="Cor" value={car.cor} />
          </div>

          <div className="mt-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">
                À vista
              </p>
              <p className="font-display text-5xl font-black leading-none text-[var(--color-red)]">
                {brl(car.preco)}
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={whatsappLink(msg)}
              target="_blank"
              rel="noreferrer"
              className="sheen bg-[var(--color-red)] px-6 py-3.5 text-sm font-black uppercase text-white transition-colors hover:bg-[var(--color-red-bright)]"
            >
              Tenho interesse
            </a>
            <Link
              href={`/veiculos/${car.id}`}
              className="border-2 border-white px-6 py-3.5 text-sm font-black uppercase text-white transition-colors hover:border-[var(--color-red)] hover:bg-[var(--color-red)]"
            >
              Ver detalhes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--color-panel)] px-3 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-mute)]">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-black uppercase text-white">{value}</p>
    </div>
  );
}
