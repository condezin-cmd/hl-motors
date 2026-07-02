// Normalização e unicidade de placa de veículo.
// Placa é a identidade real do carro — usamos para impedir duplicatas no estoque.

// Placas "curinga" usadas como preenchimento quando o carro entra sem placa real.
// Não servem para identificar o carro, então não contam como duplicata.
const CURINGAS = new Set([
  "AAA0000", "ABC0000", "ABC1234", "XXX0000", "AAA0A00", "0000000", "1111111",
]);

/** Uppercase + só letras/números. Retorna null se vazia. */
export function normPlaca(raw?: string | null): string | null {
  if (!raw) return null;
  const p = String(raw).toUpperCase().replace(/[^A-Z0-9]/g, "");
  return p || null;
}

/**
 * Placa "confiável" para checagem de duplicidade.
 * Retorna a placa normalizada apenas se ela realmente identifica um carro
 * (7 caracteres, não é curinga, não é caractere repetido). Senão null.
 */
export function placaUnica(raw?: string | null): string | null {
  const p = normPlaca(raw);
  if (!p) return null;
  if (p.length !== 7) return null;        // placa BR tem 7 caracteres
  if (/^(.)\1+$/.test(p)) return null;    // todos iguais (ex.: AAAAAAA)
  if (CURINGAS.has(p)) return null;
  return p;
}

/**
 * Procura um veículo ATIVO já cadastrado com a mesma placa.
 * Compara de forma normalizada (ignora caixa e separadores).
 * Retorna o veículo encontrado ou null. `excludeId` ignora o próprio registro (edição).
 */
export async function veiculoComMesmaPlaca(
  supabase: any,
  placa: string | null | undefined,
  excludeId?: string | null,
): Promise<{ id: string; marca: string; modelo: string; status: string; placa: string | null } | null> {
  const alvo = placaUnica(placa);
  if (!alvo) return null;
  const { data } = await supabase
    .from("veiculos")
    .select("id, marca, modelo, status, placa")
    .not("status", "in", "(vendido,inativo)");
  const hit = (data ?? []).find(
    (v: any) => v.id !== excludeId && placaUnica(v.placa) === alvo,
  );
  return hit ?? null;
}
