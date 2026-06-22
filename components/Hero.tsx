import Link from "next/link";
import { site, whatsappLink } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[90vh] items-center overflow-hidden pb-20">
      {/* Fundo: frente do Dodge Challenger preto */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero/challenger.jpg"
        alt="Dodge Challenger preto"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[60%_center]"
      />
      {/* Escurece só o lado esquerdo (texto), mantém o carro visível */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="speedline pointer-events-none absolute inset-0 -z-10 opacity-10" />

      <div className="mx-auto w-full max-w-6xl px-4 pt-28">
        <div className="reveal max-w-2xl">
          <span className="font-tech inline-flex items-center gap-2 bg-[var(--color-red)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            Seminovos selecionados · {site.city}/{site.state}
          </span>

          <h1 className="font-display mt-6 text-5xl font-black uppercase leading-[0.88] drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)] sm:text-7xl lg:text-8xl">
            Estoque forte.
            <br />
            <span className="text-[var(--color-red)]">Atendimento</span> direto.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-zinc-300 drop-shadow sm:text-lg">
            Veículos com procedência, documentação em dia e negociação rápida
            pelo WhatsApp. A {site.name} é em {site.city}/{site.state}.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="#estoque"
              className="sheen group inline-flex items-center justify-center gap-2.5 bg-[var(--color-red)] px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition-colors hover:bg-[var(--color-red-bright)]"
            >
              Ver estoque completo
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <a
              href={whatsappLink(`Olá, ${site.name}! Quero ajuda para escolher um carro.`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2.5 border-2 border-white/80 bg-black/20 px-8 py-4 text-sm font-black uppercase tracking-wide text-white backdrop-blur transition-colors hover:bg-white hover:text-[var(--color-ink)]"
            >
              <svg viewBox="0 0 32 32" className="h-5 w-5 fill-current" aria-hidden>
                <path d="M16 3C9 3 3.5 8.5 3.5 15.5c0 2.3.6 4.5 1.8 6.4L3 29l7.3-2.2c1.8 1 3.8 1.5 5.7 1.5 7 0 12.5-5.5 12.5-12.5S23 3 16 3zm0 22.7c-1.7 0-3.4-.5-4.9-1.3l-.4-.2-4.3 1.3 1.3-4.2-.3-.4c-1-1.6-1.5-3.4-1.5-5.3C5.6 9.7 10.3 5 16 5s10.4 4.7 10.4 10.5S21.7 25.7 16 25.7z" />
              </svg>
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
