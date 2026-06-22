export type CarStatus = "disponivel" | "reservado" | "vendido";

export interface Car {
  id: string;
  marca: string;
  modelo: string;
  versao: string;
  ano: number;       // ano modelo
  anoFab: number;    // ano fabricação
  km: number;
  preco: number;
  cambio: "Manual" | "Automático" | "Automatizado" | "CVT";
  combustivel: "Flex" | "Gasolina" | "Diesel" | "Híbrido" | "Elétrico";
  cor: string;
  portas: number;
  status: CarStatus;
  destaque?: boolean;
  // gradiente de placeholder (sempre renderiza bonito mesmo sem foto)
  gradient: [string, string];
  // fotos reais (Supabase/upload) entram aqui depois
  fotos?: string[];
  opcionais: string[];
  descricao: string;
}
