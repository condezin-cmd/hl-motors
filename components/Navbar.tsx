import Link from "next/link";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { site, whatsappLink } from "@/lib/site";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[var(--color-ink)]">
      <div className="border-b border-white/10 bg-black/25 px-4">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between gap-4 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-mute)]">
          <span>{site.city}/{site.state} - Seminovos selecionados</span>
          <div className="flex items-center gap-4">
            <a href={site.instagram} target="_blank" rel="noreferrer" className="hidden hover:text-white sm:inline">
              {site.instagramHandle}
            </a>
            <a href={whatsappLink(`Olá, ${site.name}! Vim pelo site.`)} target="_blank" rel="noreferrer" className="text-white">
              {site.whatsappDisplay}
            </a>
          </div>
        </div>
      </div>

      <nav className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-5 px-4">
        <Link href="/" aria-label="HL Motors - início" className="shrink-0">
          <Logo />
        </Link>

        <div className="hidden items-center gap-7 text-sm font-black uppercase tracking-wide text-[var(--color-mute)] md:flex">
          <Link href="/" className="transition-colors hover:text-white">
            Home
          </Link>
          <Link href="/#destaques" className="transition-colors hover:text-white">
            Destaques
          </Link>
          <Link href="/#estoque" className="transition-colors hover:text-white">
            Estoque
          </Link>
          <Link href="/#qualidade" className="transition-colors hover:text-white">
            Empresa
          </Link>
          <Link href="/#contato" className="transition-colors hover:text-white">
            Contato
          </Link>
        </div>

        <MobileMenu />
      </nav>
    </header>
  );
}
