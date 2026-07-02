// Extrai um lead a partir de um e-mail de aviso de portal (Webmotors, OLX, iCarros…).
// Estratégia genérica por rótulos, que cobre a maioria dos formatos brasileiros.

export type EmailBruto = {
  from?: string;
  subject?: string;
  text?: string;
  html?: string;
};

export type LeadExtraido = {
  origem: string;
  canal_detalhe: string | null;
  nome: string | null;
  telefone: string | null;
  email: string | null;
  veiculo_texto: string | null;
  mensagem: string | null;
};

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|li|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n");
}

// origem a partir do remetente
function origemDoRemetente(from: string): { origem: string; detalhe: string | null } {
  const f = from.toLowerCase();
  if (f.includes("webmotors")) return { origem: "webmotors", detalhe: "Webmotors" };
  if (f.includes("icarros")) return { origem: "icarros", detalhe: "iCarros" };
  if (f.includes("olx") || f.includes("zap") || f.includes("grupozap")) return { origem: "olx", detalhe: "OLX / Zap" };
  if (f.includes("socarrao") || f.includes("sócarrão")) return { origem: "socarrao", detalhe: "SóCarrão" };
  if (f.includes("mobiauto")) return { origem: "email", detalhe: "Mobiauto" };
  if (f.includes("mercadolivre") || f.includes("mercadolibre")) return { origem: "email", detalhe: "Mercado Livre" };
  if (f.includes("facebook") || f.includes("meta")) return { origem: "facebook", detalhe: "Facebook" };
  return { origem: "email", detalhe: null };
}

// pega o valor de um rótulo tipo "Nome: Fulano" (aceita variações)
function campo(texto: string, rotulos: string[]): string | null {
  for (const r of rotulos) {
    const re = new RegExp(`${r}\\s*[:\\-]\\s*(.+)`, "i");
    for (const linha of texto.split("\n")) {
      const m = linha.match(re);
      if (m && m[1].trim()) return m[1].trim();
    }
  }
  return null;
}

function primeiroTelefone(texto: string): string | null {
  const m = texto.match(/\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/);
  return m ? m[0].trim() : null;
}

function primeiroEmail(texto: string): string | null {
  const m = texto.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  // ignora e-mails do próprio portal
  if (m && !/webmotors|icarros|olx|zap|socarrao|noreply|no-reply|mkt|marketing/i.test(m[0])) return m[0];
  return null;
}

export function parseEmailLead(email: EmailBruto): LeadExtraido {
  const corpo = (email.text && email.text.trim()) || (email.html ? stripHtml(email.html) : "") || email.subject || "";
  const { origem, detalhe } = origemDoRemetente(email.from ?? "");

  const nome = campo(corpo, ["nome do interessado", "nome do cliente", "nome completo", "nome"]);
  const telefone = campo(corpo, ["telefone", "celular", "whatsapp", "fone", "contato"]) || primeiroTelefone(corpo);
  const emailContato = campo(corpo, ["e-mail", "email"]) || primeiroEmail(corpo);
  const veiculo = campo(corpo, ["veículo", "veiculo", "modelo", "anúncio", "anuncio", "carro", "interesse"]) ||
    (email.subject ?? null);
  const mensagem = campo(corpo, ["mensagem", "observação", "observacao", "comentário", "comentario"]);

  return {
    origem,
    canal_detalhe: detalhe,
    nome: nome,
    telefone: telefone,
    email: emailContato,
    veiculo_texto: veiculo,
    mensagem: mensagem,
  };
}
