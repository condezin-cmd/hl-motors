export const site = {
  name: "HL Motors",
  url: "https://hlmotors.mpbg.cloud",
  tagline: "Seminovos selecionados - Pinhais/PR",
  city: "Pinhais",
  state: "PR",
  cnpj: "10.886.530/0001-32",
  address: "Av. Camilo Di Lellis, 224 - Pinhais/PR",
  addressStreet: "Avenida Camilo Di Lellis",
  addressNumber: "224",
  whatsapp: "5541992878252",
  whatsappDisplay: "(41) 99287-8252",
  instagram: "https://www.instagram.com/hlmotors_pinhais/",
  instagramHandle: "@hlmotors_pinhais",
  hours: "Seg a Sex 9h-18h · Sáb 9h-13h",
};

export function whatsappLink(message: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}
