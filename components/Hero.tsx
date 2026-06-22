import Link from "next/link";
import { site, whatsappLink } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative flex items-center overflow-hidden px-4 pb-12 pt-28">
      <div className="speedline pointer-events-none absolute inset-x-0 top-32 h-20 opacity-20" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 bg-[var(--color-red)]" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="reveal">
          <span className="font-tech inline-flex bg-[var(--color-red)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-white">
            Seminovos em {site.city}/{site.state}
          </span>

          <h1 className="font-display mt-6 max-w-xl text-6xl font-black uppercase leading-[0.88] sm:text-7xl lg:text-8xl">
            Estoque forte.
            <br />
            Atendimento direto.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--color-mute)]">
            A {site.name} seleciona veículos com procedência, documentação em
            dia e negociação rápida pelo WhatsApp.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="#destaques"
              className="sheen bg-white px-7 py-4 text-sm font-black uppercase tracking-wide text-[var(--color-ink)] transition-colors hover:bg-zinc-200"
            >
              Ver destaques
            </Link>
            <a
              href={whatsappLink(`Olá, ${site.name}! Quero ajuda para escolher um carro.`)}
              target="_blank"
              rel="noreferrer"
              className="border-2 border-white px-7 py-4 text-sm font-black uppercase tracking-wide text-white transition-colors hover:border-[var(--color-red)] hover:bg-[var(--color-red)]"
            >
              Chamar no WhatsApp
            </a>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 divide-x divide-white/10 border-l-4 border-[var(--color-red)] bg-black/30 py-5">
            <Stat n="100%" l="Procedência" />
            <Stat n="48h" l="Crédito" />
            <Stat n="5.0" l="Atendimento" />
          </dl>
        </div>

        <div className="reveal relative" style={{ animationDelay: "0.12s" }}>
          <div className="brand-plate p-3 shadow-[0_22px_70px_rgba(0,0,0,0.45)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/hl-motors-placa.png"
              alt="Placa HL Motors"
              className="h-auto w-full object-contain"
            />
          </div>

          <div className="brand-stripe mt-8 flex min-h-24 items-center justify-center px-20 py-5 text-center">
            <a
              href={whatsappLink(`Olá, ${site.name}! Vim pelo site.`)}
              target="_blank"
              rel="noreferrer"
              className="font-display text-4xl font-black italic leading-none tracking-wide text-white sm:text-5xl"
            >
              {site.whatsappDisplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="px-5">
      <dt className="font-display text-3xl font-black text-white">{n}</dt>
      <dd className="text-xs font-semibold uppercase tracking-wide text-[var(--color-mute)]">{l}</dd>
    </div>
  );
}
