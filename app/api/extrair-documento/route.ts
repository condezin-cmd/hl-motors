import { NextRequest, NextResponse } from "next/server";
import { createReadClient } from "@/lib/supabase/server";
import { pdfText, parseLocal } from "@/lib/extract/local";
import { extrairGemini } from "@/lib/extract/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB

const ESSENCIAIS: Record<string, string[]> = {
  veiculo: ["marca", "modelo", "placa", "chassi"],
  cliente: ["nome", "cpf"],
};

// Descrição + campos para o motor de IA (Gemini), usados só no fallback de fotos.
const SPEC: Record<string, { doc: string; campos: Record<string, string> }> = {
  veiculo: {
    doc: "CRLV-e (Certificado de Registro e Licenciamento de Veículo) brasileiro, ou foto/PDF do documento do veículo",
    campos: {
      marca: "Montadora. No CRLV o campo MARCA/MODELO vem junto (ex.: 'VW/NIVUS HIGHLINE'); aqui retorne só a marca por extenso (VW=Volkswagen, GM=Chevrolet, MMC=Mitsubishi, etc.).",
      modelo: "Só o modelo, sem a marca nem a versão (ex.: de 'VW/NIVUS HIGHLINE' → 'Nivus').",
      versao: "Versão/acabamento que sobra depois do modelo (ex.: 'Highline 1.0 TSI'). Pode ser vazio.",
      ano_fab: "ANO FABRICAÇÃO (4 dígitos). No CRLV costuma vir 'ANO FAB./ANO MOD.' como '2021/2022'.",
      ano_modelo: "ANO MODELO (4 dígitos).",
      cor: "COR PREDOMINANTE.",
      combustivel: "Exatamente um de: Flex, Gasolina, Diesel, Híbrido, Elétrico. 'ÁLCOOL/GASOLINA', 'GASOLINA/ÁLCOOL' ou 'BICOMBUSTÍVEL' = Flex.",
      placa: "PLACA (só letras e números, sem hífen).",
      renavam: "CÓDIGO RENAVAM (11 dígitos).",
      chassi: "CHASSI (17 caracteres).",
    },
  },
  cliente: {
    doc: "CNH digital ou documento de identidade",
    campos: {
      nome: "Nome completo",
      cpf: "CPF (000.000.000-00)",
      rg: "Número do RG / Doc. Identidade",
      orgao_emissor: "Órgão emissor e UF (ex.: SSP/PR)",
      data_nascimento: "Data de nascimento AAAA-MM-DD",
      nacionalidade: "Nacionalidade (senão Brasileiro(a))",
      cidade: "Cidade",
      uf: "UF (2 letras)",
    },
  },
};

const faltaEssencial = (tipo: string, d: Record<string, string>) =>
  (ESSENCIAIS[tipo] ?? []).some((k) => !d[k]);

export async function POST(req: NextRequest) {
  // Acesso restrito a usuários logados.
  const sb = await createReadClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const form = await req.formData();
  const tipo = String(form.get("tipo") ?? "");
  const file = form.get("file");
  const spec = SPEC[tipo];
  if (!spec) return NextResponse.json({ error: "Tipo de documento inválido." }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "Arquivo não enviado." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Arquivo muito grande (máx. 12 MB)." }, { status: 400 });

  const mime = file.type || "application/pdf";
  const buffer = Buffer.from(await file.arrayBuffer());
  const isPdf = mime === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const isImg = /^image\/(png|jpe?g|webp)$/i.test(mime);
  if (!isPdf && !isImg)
    return NextResponse.json({ error: "Envie um PDF ou uma imagem (JPG/PNG)." }, { status: 400 });

  let dados: Record<string, string> = {};
  let modelo = "";

  // 1) IA grátis (Gemini) PRIMEIRO — máxima confiabilidade em CRLV/CNH real,
  //    qualquer layout (CRLV-e do gov.br, foto, scan). Lê PDF e imagem nativo.
  if (process.env.GEMINI_API_KEY) {
    try {
      const b64 = buffer.toString("base64");
      dados = await extrairGemini(spec.campos, spec.doc, isPdf ? "application/pdf" : mime, b64);
      modelo = "IA (grátis)";
    } catch (e) {
      console.error("[gemini]", (e as Error).message);
    }
  }

  // 2) Reforço local (PDF com texto) — quando não há IA configurada ou ela
  //    falhou/deixou campo essencial em branco. IA tem prioridade.
  if (isPdf && faltaEssencial(tipo, dados)) {
    try {
      const texto = await pdfText(buffer);
      if (texto && texto.replace(/\s/g, "").length > 40) {
        const loc = parseLocal(tipo, texto);
        dados = { ...loc, ...dados }; // IA prevalece sobre o local
        modelo = modelo ? "IA + local" : "local (grátis)";
      }
    } catch {
      /* sem texto extraível */
    }
  }

  if (Object.keys(dados).length === 0) {
    const dica =
      isImg && !process.env.GEMINI_API_KEY
        ? "Para ler fotos é preciso configurar a leitura por IA (Gemini, grátis)."
        : "Não reconheci os dados neste documento. Tente o PDF/foto original do CRLV ou CNH.";
    return NextResponse.json({ error: dica }, { status: 422 });
  }

  return NextResponse.json({ dados, modelo });
}
