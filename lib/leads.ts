// Config compartilhada da Central de Leads (funil de atendimento).

export type LeadStatus = "novo" | "em_contato" | "visita" | "negociacao" | "ganho" | "perdido";

export const LEAD_STATUSES: { key: LeadStatus; label: string; cls: string; dot: string }[] = [
  { key: "novo",       label: "Novo",       cls: "border-amber-400/50",   dot: "bg-amber-400" },
  { key: "em_contato", label: "Em contato", cls: "border-sky-400/50",     dot: "bg-sky-400" },
  { key: "visita",     label: "Visita",     cls: "border-violet-400/50",  dot: "bg-violet-400" },
  { key: "negociacao", label: "Negociação", cls: "border-blue-400/50",    dot: "bg-blue-400" },
  { key: "ganho",      label: "Ganho",      cls: "border-emerald-400/50", dot: "bg-emerald-400" },
  { key: "perdido",    label: "Perdido",    cls: "border-zinc-500/50",    dot: "bg-zinc-500" },
];

export const statusLabel = (s: string) => LEAD_STATUSES.find((x) => x.key === s)?.label ?? s;

export const ORIGEM_LABEL: Record<string, string> = {
  site: "Site",
  whatsapp: "WhatsApp",
  socarrao: "SóCarrão",
  webmotors: "Webmotors",
  olx: "OLX / Zap",
  icarros: "iCarros",
  facebook: "Facebook",
  email: "E-mail",
  manual: "Manual",
};
export const origemLabel = (o: string) => ORIGEM_LABEL[o] ?? o;

export type Lead = {
  id: string;
  created_at: string;
  origem: string;
  canal_detalhe: string | null;
  nome: string | null;
  telefone: string | null;
  email: string | null;
  veiculo_id: string | null;
  veiculo_texto: string | null;
  mensagem: string | null;
  status: LeadStatus;
  negociacao_id: string | null;
};
