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
    doc: "CRLV / documento do veículo",
    campos: {
      marca: "Marca/montadora (ex.: Volkswagen). Só a marca.",
      modelo: "Modelo (ex.: Nivus). Sem a marca.",
      versao: "Versão/acabamento (ex.: Highline)",
      ano_fab: "Ano de fabricação (4 dígitos)",
      ano_modelo: "Ano do modelo (4 dígitos)",
      cor: "Cor predominante",
      combustivel: "Um de: Flex, Gasolina, Diesel, Híbrido, Elétrico. Álcool/Gasolina = Flex.",
      placa: "Placa (só letras e números)",
      renavam: "RENAVAM",
      chassi: "Chassi (VIN)",
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

  // 1) GRÁTIS: PDF com texto embutido (CNH-e / CRLV-e) → leitura local, sem IA.
  if (isPdf) {
    try {
      const texto = await pdfText(buffer);
      if (texto && texto.replace(/\s/g, "").length > 40) {
        dados = parseLocal(tipo, texto);
        modelo = "local (grátis)";
      }
    } catch {
      /* PDF escaneado/sem texto → cai no fallback */
    }
  }

  // 2) Fallback GRÁTIS: foto/escaneado ou leitura local incompleta → Gemini (se configurado).
  const precisaIA = isImg || faltaEssencial(tipo, dados);
  if (precisaIA && process.env.GEMINI_API_KEY) {
    try {
      const b64 = buffer.toString("base64");
      const ia = await extrairGemini(spec.campos, spec.doc, isPdf ? "application/pdf" : mime, b64);
      dados = { ...dados, ...ia }; // IA preenche o que faltou
      modelo = isPdf && modelo ? "local + IA (grátis)" : "IA (grátis)";
    } catch (e) {
      console.error("[gemini]", (e as Error).message);
      /* mantém o que já temos do local */
    }
  }

  if (Object.keys(dados).length === 0) {
    const dica =
      isImg && !process.env.GEMINI_API_KEY
        ? "Para ler fotos é preciso configurar a leitura por IA (Gemini, grátis)."
        : "Não reconheci os dados neste documento. Tente o PDF original da CNH/CRLV digital.";
    return NextResponse.json({ error: dica }, { status: 422 });
  }

  return NextResponse.json({ dados, modelo });
}
