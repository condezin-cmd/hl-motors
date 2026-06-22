import { notFound } from "next/navigation";

// Área do lojista — CONGELADA.
// Rota reservada para a Fase 2 (painel completo + bot WhatsApp/Evolution + Supabase).
// Por enquanto não abre publicamente: retorna 404.
export default function AdminPage() {
  notFound();
}
