// Fallback GRÁTIS para fotos/escaneados: Google Gemini Flash (tier gratuito,
// sem cartão). Só é usado se GEMINI_API_KEY estiver configurada.

const MODEL = "gemini-2.5-flash";

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
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
  const prompt =
    `Este é um ${docDesc}. Extraia os campos pedidos exatamente como aparecem. ` +
    `Se um campo não estiver presente, retorne null. Não invente. ` +
    `Datas no formato AAAA-MM-DD.`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ inline_data: { mime_type: mime, data: b64 } }, { text: prompt }] }],
      generationConfig: {
        response_mime_type: "application/json",
        response_schema: geminiSchema(campos),
        temperature: 0,
      },
    }),
  });

  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  const txt = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!txt) throw new Error("Gemini não retornou dados.");

  const parsed = JSON.parse(txt) as Record<string, string | null>;
  const limpo: Record<string, string> = {};
  for (const [k, v] of Object.entries(parsed)) {
    const s = (v ?? "").toString().trim();
    if (s && s.toLowerCase() !== "null") limpo[k] = s;
  }
  return limpo;
}
