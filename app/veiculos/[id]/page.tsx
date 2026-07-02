import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCarPublic } from "@/lib/veiculos";
import { brl, km } from "@/lib/format";
import { site, whatsappLink } from "@/lib/site";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { CarImage } from "@/components/CarImage";
import { Gallery } from "@/components/Gallery";
import { StatusBadge } from "@/components/StatusBadge";
import { InteresseCTA } from "@/components/InteresseCTA";

// Página renderizada sob demanda lendo o estoque ao vivo do Supabase.
export const dynamic = "force-dynamic";

const absFoto = (f: string) => (f.startsWith("http") ? f : `${site.url}${f}`);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const car = await getCarPublic(id);
  if (!car) return {};
  const title = `${car.marca} ${car.modelo} ${car.versao} ${car.ano}`;
  const desc = `${car.marca} ${car.modelo} ${car.ano} · ${km(car.km)} · ${brl(
    car.preco
  )} · ${car.cambio} · ${car.combustivel}. ${site.name}, ${site.city}/${site.state}.`;
  return {
    title,
    description: desc,
    alternates: { canonical: `/veiculos/${car.id}` },
    openGraph: {
      title: `${title} — ${brl(car.preco)}`,
      description: desc,
      type: "website",
      images: car.fotos?.length ? [{ url: absFoto(car.fotos[0]) }] : undefined,
    },
  };
}

export default async function VeiculoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await getCarPublic(id);
  if (!car) notFound();

  const vendido = car.status === "vendido";
  const msg = `Olá, ${site.name}! Tenho interesse no ${car.marca} ${car.modelo} ${car.versao} (${car.ano}) por ${brl(car.preco)}. Ainda está disponível?`;

  const specs: [string, string][] = [
    ["Ano", `${car.anoFab}/${car.ano}`],
    ["Quilometragem", km(car.km)],
    ["Câmbio", car.cambio],
    ["Combustível", car.combustivel],
    ["Cor", car.cor],
    ["Portas", `${car.portas} portas`],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: `${car.marca} ${car.modelo} ${car.versao}`,
    brand: { "@type": "Brand", name: car.marca },
    model: car.modelo,
    vehicleModelDate: String(car.ano),
    productionDate: String(car.anoFab),
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: car.km,
      unitCode: "KMT",
    },
    fuelType: car.combustivel,
    vehicleTransmission: car.cambio,
    color: car.cor,
    numberOfDoors: car.portas,
    itemCondition: "https://schema.org/UsedCondition",
    image: (car.fotos ?? []).map(absFoto),
    offers: {
      "@type": "Offer",
      price: car.preco,
      priceCurrency: "BRL",
      availability:
        car.status === "vendido"
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      seller: {
        "@type": "AutoDealer",
        name: site.name,
        areaServed: `${site.city}/${site.state}`,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="px-4 pb-10 pt-28">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/#estoque"
            className="text-sm font-semibold uppercase text-[var(--color-mute)] transition-colors hover:text-white"
          >
            ← Voltar ao estoque
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              {car.fotos && car.fotos.length > 0 ? (
                <Gallery
                  fotos={car.fotos}
                  alt={`${car.marca} ${car.modelo} ${car.versao}`}
                />
              ) : (
                <div className="aspect-[4/3] overflow-hidden border border-white/15">
                  <CarImage car={car} rounded="rounded-none" />
                </div>
              )}
            </div>

            <aside className="brand-panel flex flex-col p-7">
              <div className="flex items-center justify-between gap-3">
                <StatusBadge status={car.status} />
                {car.destaque && (
                  <span className="bg-[var(--color-red)] px-3 py-1 text-xs font-black uppercase text-white">
                    Destaque
                  </span>
                )}
              </div>

              <h1 className="font-display mt-5 text-5xl font-black uppercase leading-none">
                {car.marca} {car.modelo}
              </h1>
              <p className="mt-2 text-[var(--color-mute)]">{car.versao}</p>

              <div className="mt-7 border-y border-white/15 py-5">
                <p className="text-xs font-black uppercase tracking-wider text-[var(--color-mute)]">
                  Preço à vista
                </p>
                <p className="font-display text-5xl font-black text-[var(--color-red)]">
                  {brl(car.preco)}
                </p>
              </div>

              {vendido ? (
                <>
                  <p className="mt-7 border border-white/15 bg-black/30 px-4 py-3 text-center text-sm font-bold uppercase text-[var(--color-mute)]">
                    Este veículo já foi vendido
                  </p>
                  <Link
                    href="/#estoque"
                    className="sheen mt-3 flex items-center justify-center bg-[var(--color-red)] px-6 py-4 text-sm font-black uppercase text-white transition-colors hover:bg-[var(--color-red-bright)]"
                  >
                    Ver carros disponíveis
                  </Link>
                  <a
                    href={whatsappLink(`Olá, ${site.name}! Vi que o ${car.modelo} foi vendido. Têm algo parecido?`)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex items-center justify-center border border-white/20 px-6 py-3.5 text-sm font-black uppercase text-white transition-colors hover:border-[var(--color-red)] hover:bg-[var(--color-red)]"
                  >
                    Quero um parecido
                  </a>
                </>
              ) : (
                <>
                  <InteresseCTA
                    veiculoId={car.id}
                    veiculoTexto={`${car.marca} ${car.modelo} ${car.versao} ${car.ano}`}
                    msgInteresse={msg}
                    msgTestDrive={`Olá, ${site.name}! Quero agendar um test-drive do ${car.marca} ${car.modelo} ${car.versao} (${car.ano}).`}
                  />
                </>
              )}

              <p className="mt-5 text-center text-xs text-[var(--color-mute)]">
                {site.hours}
              </p>
            </aside>
          </div>

          <section className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="brand-panel p-7">
              <h2 className="font-display text-3xl font-black uppercase">Ficha técnica</h2>
              <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {specs.map(([k, v]) => (
                  <div key={k} className="border border-white/12 bg-black/20 p-4">
                    <dt className="text-xs font-black uppercase tracking-wider text-[var(--color-mute)]">
                      {k}
                    </dt>
                    <dd className="mt-1 font-semibold text-white">{v}</dd>
                  </div>
                ))}
              </dl>

              <h3 className="font-display mt-8 text-2xl font-black uppercase">Descrição</h3>
              <p className="mt-3 text-[var(--color-mute)]">{car.descricao}</p>
            </div>

            <div className="brand-panel p-7">
              <h2 className="font-display text-3xl font-black uppercase">Opcionais</h2>
              <ul className="mt-5 space-y-3">
                {car.opcionais.map((o) => (
                  <li key={o} className="flex items-center gap-3 text-sm font-semibold text-white">
                    <span className="h-2 w-6 bg-[var(--color-red)]" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
