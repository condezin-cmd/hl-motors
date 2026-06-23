// Extração GRÁTIS, local, sem IA — para PDFs digitais (CNH-e / CRLV-e) que têm
// texto embutido. O documento (com CPF etc.) não sai do servidor.

export async function pdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const inst = new PDFParse({ data: buffer });
  try {
    const r = await inst.getText();
    return r.text ?? "";
  } finally {
    await inst.destroy().catch(() => {});
  }
}

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();

function blocoApos(linhas: string[], labelRe: RegExp): string {
  for (let i = 0; i < linhas.length; i++) {
    const ln = linhas[i];
    if (labelRe.test(norm(ln))) {
      // resto da própria linha após o rótulo
      const resto = ln.replace(new RegExp(labelRe, "i"), "").trim();
      if (resto.replace(/[:/.\-\s]/g, "")) return resto;
      // senão a próxima linha não-vazia
      for (let j = i + 1; j < linhas.length; j++) {
        if (linhas[j].trim()) return linhas[j].trim();
      }
    }
  }
  return "";
}

function combustivel(s: string): string {
  const t = norm(s);
  if (/ALCOOL|ETANOL|FLEX|BICOMB/.test(t) && /GASOL/.test(t)) return "Flex";
  if (/FLEX|BICOMB/.test(t)) return "Flex";
  if (/DIESEL/.test(t)) return "Diesel";
  if (/ELETRIC/.test(t)) return "Elétrico";
  if (/HIBRID/.test(t)) return "Híbrido";
  if (/GASOL/.test(t)) return "Gasolina";
  if (/ALCOOL|ETANOL/.test(t)) return "Flex";
  return "";
}

const MARCAS: Record<string, string> = {
  VW: "Volkswagen", GM: "Chevrolet", "CHEV": "Chevrolet", FIAT: "Fiat",
  FORD: "Ford", HYUNDAI: "Hyundai", TOYOTA: "Toyota", HONDA: "Honda",
  RENAULT: "Renault", NISSAN: "Nissan", JEEP: "Jeep", PEUGEOT: "Peugeot",
  CITROEN: "Citroën", MMC: "Mitsubishi", "M.BENZ": "Mercedes-Benz", BMW: "BMW",
  AUDI: "Audi", KIA: "Kia", CHERY: "Chery", "GWM": "GWM", VOLVO: "Volvo",
};

export function parseVeiculo(text: string): Record<string, string> {
  const linhas = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const flat = " " + norm(text).replace(/\s+/g, " ") + " ";
  const out: Record<string, string> = {};

  const renavam = flat.match(/RENAVAM\D{0,4}(\d{9,11})/) || text.match(/\b(\d{11})\b/);
  if (renavam) out.renavam = renavam[1];

  const chassi = text.match(/\b([A-HJ-NPR-Z0-9]{17})\b/i);
  if (chassi) out.chassi = chassi[1].toUpperCase();

  // placa: Mercosul (ABC1D23) ou antiga (ABC1234)
  const placaCtx = blocoApos(linhas, /PLACA/);
  const placaM =
    (placaCtx + " " + text).match(/\b([A-Z]{3}\d[A-Z]\d{2})\b/i) ||
    (placaCtx + " " + text).match(/\b([A-Z]{3}\d{4})\b/i);
  if (placaM) out.placa = placaM[1].toUpperCase().replace(/[^A-Z0-9]/g, "");

  // marca / modelo / versão — procura "CÓDIGO/MODELO" (ex.: VW/NIVUS HIGHLINE)
  // pelas marcas conhecidas (evita casar com "ALCOOL/GASOLINA").
  for (const [code, nome] of Object.entries(MARCAS)) {
    const re = new RegExp(`\\b${code.replace(/\./g, "\\.")}\\s*/\\s*([A-Z0-9][A-Za-z0-9 .]+)`, "i");
    const m = text.match(re);
    if (m) {
      out.marca = nome;
      const ws = m[1].trim().replace(/\s+(ANO|COR|COMB|RENAVAM|CHASSI|PLACA).*$/i, "").split(/\s+/);
      if (ws[0]) out.modelo = ws[0];
      if (ws.length > 1) out.versao = ws.slice(1).join(" ");
      break;
    }
  }
  // fallback: linha após "MARCA/MODELO" se a marca não for conhecida
  if (!out.marca) {
    const mm = blocoApos(linhas, /MARCA\s*\/?\s*MODELO/);
    const tok = mm.match(/([A-Z][A-Za-z.]+)\s*\/\s*([A-Z0-9][A-Za-z0-9 .]+)/);
    if (tok) {
      out.marca = MARCAS[norm(tok[1])] || tok[1];
      const ws = tok[2].trim().split(/\s+/);
      out.modelo = ws[0];
      if (ws.length > 1) out.versao = ws.slice(1).join(" ");
    }
  }

  const anoF = flat.match(/ANO[^\d]{0,12}FAB[^\d]{0,12}(\d{4})/);
  if (anoF) out.ano_fab = anoF[1];
  const anoM = flat.match(/(?:ANO[^\d]{0,4})?MODELO[^\d]{0,12}(\d{4})/) || flat.match(/\/\s*MOD[^\d]{0,8}(\d{4})/);
  if (anoM) out.ano_modelo = anoM[1];
  // fallback: "2021 / 2022"
  if (!out.ano_fab || !out.ano_modelo) {
    const par = text.match(/\b(\d{4})\s*\/\s*(\d{4})\b/);
    if (par) { out.ano_fab ||= par[1]; out.ano_modelo ||= par[2]; }
  }

  const corM = text.match(/COR(?:\s+PREDOMINANTE)?\s+([A-Za-zÀ-ÿ]+)/i);
  if (corM && !/PREDOMIN/i.test(corM[1])) out.cor = corM[1];

  const comb = combustivel(blocoApos(linhas, /COMBUST/) || text);
  if (comb) out.combustivel = comb;

  return out;
}

function isoData(s: string): string {
  const m = s.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : "";
}

export function parseCliente(text: string): Record<string, string> {
  const linhas = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out: Record<string, string> = {};

  const cpf = text.match(/\b(\d{3}\.?\d{3}\.?\d{3}-?\d{2})\b/);
  if (cpf) {
    const d = cpf[1].replace(/\D/g, "");
    out.cpf = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  }

  // nome: linha após "NOME" (e não "NOME SOCIAL"/"FILIACAO")
  let nome = blocoApos(linhas, /\bNOME\b(?!\s*SOCIAL)/);
  if (nome && /[A-Za-zÀ-ÿ]{2,}\s+[A-Za-zÀ-ÿ]/.test(nome)) out.nome = nome.replace(/\s{2,}/g, " ").trim();

  // RG / doc identidade (formato \d{1,2}.\d{3}.\d{3}-X, distinto do CPF)
  const rgM =
    text.match(/\b(\d{1,2}\.\d{3}\.\d{3}-?[\dxX])\b/) ||
    blocoApos(linhas, /(DOC\.?\s*IDENT|IDENTIDADE|REGISTRO\s*GERAL)/).match(/\d[\d.\-/]{4,}/);
  if (rgM) out.rg = (Array.isArray(rgM) ? rgM[1] || rgM[0] : rgM).toString().trim();

  // órgão emissor + UF (ex.: SSP/PR, SSP PR, DETRAN-SP)
  const org = text.match(/\b(SSP|SESP|DETRAN|PC|PM|IFP|SDS|PTC|IIRGD)[\s/\-]+([A-Z]{2})\b/);
  if (org) out.orgao_emissor = `${org[1]}/${org[2]}`;

  // nascimento
  const nasc = blocoApos(linhas, /NASC/);
  const iso = isoData(nasc) || isoData(text);
  if (iso) out.data_nascimento = iso;

  // local (cidade, UF)
  const local = blocoApos(linhas, /\bLOCAL\b/);
  const lm = local.match(/([A-Za-zÀ-ÿ.\s]+?)[,\s]+([A-Z]{2})\b/);
  if (lm) { out.cidade = lm[1].trim(); out.uf = lm[2]; }

  return out;
}

export function parseLocal(tipo: string, text: string): Record<string, string> {
  return tipo === "veiculo" ? parseVeiculo(text) : parseCliente(text);
}
