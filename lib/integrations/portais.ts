// Config dos portais de anúncio. Adicionar um portal novo aqui já reflete na UI
// (coluna + checkbox + botão de sincronizar) sem mexer no resto.
export type Portal = {
  key: string;
  label: string;
  // como detectar que um veículo já está sincronizado neste portal
  synced: (v: { socarrao_id?: number | string | null }) => boolean;
  ativo: boolean; // false = "em breve" (aparece desabilitado)
};

export const PORTAIS: Portal[] = [
  { key: "socarrao", label: "SóCarrão", synced: (v) => Boolean(v.socarrao_id), ativo: true },
  // exemplos futuros (deixar ativo:false até implementar):
  // { key: "webmotors", label: "Webmotors", synced: () => false, ativo: false },
  // { key: "olx", label: "OLX", synced: () => false, ativo: false },
];
