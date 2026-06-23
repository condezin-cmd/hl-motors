// Leitura GRÁTIS de documento via Google Gemini Flash (tier gratuito, sem cartão).
// Para confiabilidade: tenta vários modelos free e re-tenta em sobrecarga (503/429).

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function geminiSchema(campos: Record<string, string>) {
  const properties: Record<string, unknown> = {};
  for (const [k, desc] of Object.entries(campos)) {
    properties[k] = { type: "STRING", description: desc, nullable: true };
  }
  return { type: "OBJECT", properties };
}

export async function extrairGemini(
  campos: Record<string, string>,
  docDesc: string,
  mime: string,
  b64: string,
): Promise<Record<string, string>> {
  const key = process.env.GEMINI_API_KEY!;
  const prompt =
    `Este é um ${docDesc}. Extraia os campos pedidos exatamente como aparecem. ` +
    `Se um campo não estiver presente, retorne null. Não invente. ` +
    `Datas no formato AAAA-MM-DD.`;
  const body = JSON.stringify({
    contents: [{ parts: [{ inline_data: { mime_type: mime, data: b64 } }, { text: prompt }] }],
    generationConfig: {
      response_mime_type: "application/json",
      response_schema: geminiSchema(campos),
      temperature: 0,
    },
  });

  let lastErr = "";
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      let res: Response;
      try {
        res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body },
        );
      } catch (e) {
        lastErr = `${model} rede: ${(e as Error).message}`;
        await sleep(600 * (attempt + 1));
        continue;
      }

      if (res.ok) {
        const json = await res.json();
        const txt = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!txt) { lastErr = `${model}: sem texto`; break; } // tenta próximo modelo
        const parsed = JSON.parse(txt) as Record<string, string | null>;
        const limpo: Record<string, string> = {};
        for (const [k, v] of Object.entries(parsed)) {
          const s = (v ?? "").toString().trim();
          if (s && s.toLowerCase() !== "null") limpo[k] = s;
        }
        return limpo;
      }

      lastErr = `${model} ${res.status}`;
      // 503/429/5xx = sobrecarga temporária → re-tenta; outros erros → próximo modelo
      if (res.status === 503 || res.status === 429 || res.status >= 500) {
        await sleep(700 * (attempt + 1));
        continue;
      }
      break;
    }
  }
  throw new Error("Gemini indisponível: " + lastErr);
}
