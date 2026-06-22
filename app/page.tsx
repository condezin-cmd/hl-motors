import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { CarCatalog } from "@/components/CarCatalog";
import { CarCard } from "@/components/CarCard";
import { FeaturedCar } from "@/components/FeaturedCar";
import { ConsignForm } from "@/components/ConsignForm";
import { cars, brands } from "@/lib/cars";
import { site, whatsappLink } from "@/lib/site";

export default function Home() {
  const featured = cars.find((c) => c.destaque) ?? cars[0];
  const destaques = cars
    .filter((c) => c.destaque && c.id !== featured.id)
    .slice(0, 8);

  return (
    <>
      <Navbar />
      <main>
        <Hero />

        <section className="px-4 pt-6">
          <div className="mx-auto max-w-6xl">
            <FeaturedCar car={featured} />
          </div>
        </section>

        <section id="destaques" className="px-4 pb-16 pt-12">
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              eyebrow="Últimos destaques"
              title="Vitrine HL"
              subtitle="Uma seleção rápida dos veículos que merecem atenção primeiro."
            />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {destaques.map((car) => (
                <CarCard key={car.id} car={car} compact />
              ))}
            </div>
          </div>
        </section>

        <section id="qualidade" className="px-4 py-20">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="brand-panel overflow-hidden">
              <div className="brand-stripe flex min-h-24 items-center justify-center px-16 py-5">
                <span className="font-display text-4xl font-black italic text-white">
                  Qualidade garantida
                </span>
              </div>
              <div className="p-8">
                <h2 className="font-display text-5xl font-black uppercase leading-none">
                  Transparência antes da chave.
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-[var(--color-mute)]">
                  A HL Motors apresenta veículos selecionados, com histórico
                  verificado, atendimento humano e uma negociação simples para
                  quem quer comprar sem perder tempo.
                </p>
                <a
                  href={whatsappLink(`Olá, ${site.name}! Quero conhecer as condições dos veículos.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="sheen mt-8 inline-flex bg-[var(--color-red)] px-6 py-4 text-sm font-black uppercase text-white hover:bg-[var(--color-red-bright)]"
                >
                  Falar com a loja
                </a>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Trust title="Procedência" text="Laudo cautelar, documentação em dia e histórico verificado." />
              <Trust title="Financiamento" text="Simulação rápida com bancos parceiros e atendimento direto." />
              <Trust title="Test-drive" text="Agendamento prático pelo WhatsApp." />
              <Trust title="Pós-venda" text="Relacionamento próximo para dúvidas depois da entrega." />
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[var(--color-red)] px-4 py-16">
          <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <span className="font-tech text-[11px] font-black uppercase tracking-[0.25em] text-white/80">
                Galeria HL
              </span>
              <h2 className="font-display mt-3 text-5xl font-black uppercase leading-none text-white">
                Confira tudo o que já passou por aqui.
              </h2>
            </div>
            <a
              href={site.instagram}
              target="_blank"
              rel="noreferrer"
              className="border-2 border-white px-7 py-4 text-sm font-black uppercase text-white transition-colors hover:bg-white hover:text-[var(--color-red)]"
            >
              Abrir Instagram
            </a>
          </div>
        </section>

        <section id="estoque" className="px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              eyebrow="Estoque"
              title="Todo o estoque"
              subtitle="Filtre por marca, compare opções e fale direto com a loja."
            />
            <div className="mt-10">
              <CarCatalog cars={cars} brands={brands} />
            </div>
          </div>
        </section>

        <section id="consignacao" className="border-y border-white/10 bg-black/25 px-4 py-20">
          <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[1fr_1.05fr]">
            <div>
              <span className="font-tech inline-flex bg-[var(--color-red)] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-white">
                Venda ou consigne
              </span>
              <h2 className="font-display mt-5 text-5xl font-black uppercase leading-[0.9] sm:text-6xl">
                Quer vender
                <br />
                <span className="text-[var(--color-red)]">seu carro?</span>
              </h2>
              <p className="mt-5 max-w-md text-lg text-[var(--color-mute)]">
                A {site.name} vende o seu veículo por você. Você deixa em
                consignação, a gente cuida de tudo — anúncio, fotos, atendimento
                e negociação — e você recebe quando vender. Sem dor de cabeça.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  "Avaliação justa e transparente",
                  "Exposição na loja e no site",
                  "Cuidamos de toda a negociação",
                  "Documentação e segurança garantidas",
                ].map((b) => (
                  <li key={b} className="flex items-center gap-3 text-sm font-semibold text-white">
                    <span className="h-2 w-6 shrink-0 bg-[var(--color-red)]" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <ConsignForm />
          </div>
        </section>

        <section id="contato" className="px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              eyebrow="Contato"
              title="Fale com a loja"
              subtitle="Estamos prontos para te atender."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <ContactCard title="Endereço" text={site.address} />
              <ContactCard title="WhatsApp" text={site.whatsappDisplay} />
              <ContactCard title="Horários" text={site.hours} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="max-w-3xl">
      <span className="font-tech bg-[var(--color-red)] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-white">
        {eyebrow}
      </span>
      <h2 className="font-display mt-5 text-5xl font-black uppercase leading-none sm:text-6xl">
        {title}
      </h2>
      <p className="mt-4 text-lg text-[var(--color-mute)]">{subtitle}</p>
    </div>
  );
}

function Trust({ title, text }: { title: string; text: string }) {
  return (
    <div className="brand-panel p-6">
      <div className="mb-5 h-2 w-16 bg-[var(--color-red)]" />
      <h3 className="font-display text-2xl font-black uppercase text-white">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-mute)]">{text}</p>
    </div>
  );
}

function ContactCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="brand-panel p-6">
      <h3 className="font-display text-2xl font-black uppercase text-white">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-mute)]">{text}</p>
    </div>
  );
}
