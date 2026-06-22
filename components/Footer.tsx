import { Logo } from "./Logo";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer id="sobre" className="relative px-4 pb-12 pt-10">
      <div className="mx-auto max-w-6xl border-t-8 border-[var(--color-red)] bg-[var(--color-panel)] p-8 md:p-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[var(--color-mute)]">
              {site.name} - {site.tagline}. Veículos com procedência, revisados
              e prontos para a estrada.
            </p>
          </div>

          <div>
            <h4 className="font-display text-xl font-black uppercase text-white">
              Contato
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-[var(--color-mute)]">
              <li>{site.address}</li>
              <li>{site.hours}</li>
              <li>{site.whatsappDisplay}</li>
              <li>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  {site.instagramHandle}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-xl font-black uppercase text-white">
              Navegação
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-[var(--color-mute)]">
              <li><a href="/#destaques" className="hover:text-white">Destaques</a></li>
              <li><a href="/#estoque" className="hover:text-white">Estoque</a></li>
              <li><a href="/#qualidade" className="hover:text-white">Empresa</a></li>
              <li><a href="/#contato" className="hover:text-white">Contato</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-[var(--color-mute)] sm:flex-row">
          <p>© {new Date().getFullYear()} {site.name}. Todos os direitos reservados.</p>
          <p>Identidade visual baseada na placa oficial da marca.</p>
        </div>
      </div>
    </footer>
  );
}
