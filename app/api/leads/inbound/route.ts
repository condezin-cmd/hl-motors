import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseEmailLead, type EmailBruto } from "@/lib/leads/parse";

export const runtime = "nodejs";

// Ponto único de entrada de leads de fontes externas (encaminhador de e-mail,
// Zapier/Make, webhooks de portais). Protegido por segredo compartilhado.
//
// Dois formatos aceitos:
//  1. Lead já normalizado:  { origem, nome, telefone, email, veiculo_texto, mensagem, external_id }
//  2. E-mail cru:           { tipo:"email", from, subject, text, html }
//
// Segredo via header "x-webhook-secret" ou query ?secret=  (== LEADS_WEBHOOK_SECRET)

function autorizado(req: NextRequest): boolean {
  const secret = process.env.LEADS_WEBHOOK_SECRET;
  if (!secret) return false;
  const header = req.headers.get("x-webhook-secret");
  const query = req.nextUrl.searchParams.get("secret");
  return header === secret || query === secret;
}

export async function POST(req: NextRequest) {
  if (!autorizado(req)) {
    return NextResponse.json({ ok: false, error: "não autorizado" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "json inválido" }, { status: 400 });
  }

  let row: Record<string, any>;
  if (body?.tipo === "email" || body?.from || body?.html) {
    const extraido = parseEmailLead(body as EmailBruto);
    row = { ...extraido, raw: body };
  } else {
    row = {
      origem: String(body.origem || "email"),
      canal_detalhe: body.canal_detalhe ?? null,
      external_id: body.external_id ?? null,
      nome: body.nome ?? null,
      telefone: body.telefone ?? null,
      email: body.email ?? null,
      veiculo_texto: body.veiculo_texto ?? body.veiculo ?? null,
      mensagem: body.mensagem ?? null,
      raw: body,
    };
  }
  row.status = "novo";

  // precisa de pelo menos um jeito de contatar
  if (!row.nome && !row.telefone && !row.email) {
    return NextResponse.json({ ok: false, error: "lead sem nome/telefone/email" }, { status: 422 });
  }

  const sb = createAdminClient();
  // idempotência: se veio external_id e já existe, ignora
  if (row.external_id) {
    const { data: existe } = await sb
      .from("leads")
      .select("id")
      .eq("origem", row.origem)
      .eq("external_id", row.external_id)
      .maybeSingle();
    if (existe?.id) return NextResponse.json({ ok: true, duplicado: true, id: existe.id });
  }

  const { data, error } = await sb.from("leads").insert(row).select("id").single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}
