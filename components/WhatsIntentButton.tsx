"use client";

import { registrarInteresse } from "@/lib/leads-actions";

// Link de WhatsApp que também registra o lead no funil ao ser clicado.
// Mantém o <a> real (abre o WhatsApp normalmente); o lead é gravado em segundo plano.
export function WhatsIntentButton({
  href,
  veiculoId,
  veiculoTexto,
  mensagem,
  className,
  children,
}: {
  href: string;
  veiculoId?: string | null;
  veiculoTexto?: string | null;
  mensagem?: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  function onClick() {
    // fire-and-forget: não atrasa a abertura do WhatsApp
    void registrarInteresse({ veiculo_id: veiculoId, veiculo_texto: veiculoTexto, mensagem });
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={onClick} className={className}>
      {children}
    </a>
  );
}
