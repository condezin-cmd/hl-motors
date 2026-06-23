import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cars as staticCars } from "@/lib/cars";
import type { Car, CarStatus } from "@/lib/types";

// Cliente público (anon, sem sessão) — leitura do estoque para o site.
// RLS "veiculos_public_read" permite SELECT público.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  { auth: { persistSession: false } },
);

// Gradiente de placeholder (atrás da foto). Determinístico por slug p/ variar.
const GRADIENTS: [string, string][] = [
  ["#2b2e33", "#08090b"],
  ["#3a2326", "#0b0809"],
  ["#1f2a33", "#070b0e"],
  ["#2e2a1f", "#0c0a07"],
  ["#262433", "#08070d"],
];
function gradientFor(seed: string): [string, string] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

type Row = Record<string, any>;

function rowToCar(r: Row): Car {
  const slug: string = r.slug || r.id;
  return {
    id: slug,
    marca: r.marca ?? "",
    modelo: r.modelo ?? "",
    versao: r.versao ?? "",
    ano: Number(r.ano_modelo ?? r.ano_fab ?? 0),
    anoFab: Number(r.ano_fab ?? r.ano_modelo ?? 0),
    km: Number(r.km ?? 0),
    preco: Number(r.preco ?? 0),
    cambio: (r.cambio ?? "Manual") as Car["cambio"],
    combustivel: (r.combustivel ?? "Flex") as Car["combustivel"],
    cor: r.cor ?? "—",
    portas: Number(r.portas ?? 4),
    status: (r.status ?? "disponivel") as CarStatus,
    destaque: !!r.destaque,
    gradient: gradientFor(slug),
    fotos: Array.isArray(r.fotos) ? r.fotos : [],
    opcionais: Array.isArray(r.opcionais) ? r.opcionais : [],
    descricao: r.descricao ?? "",
  };
}

// Estoque visível no site: tudo que está à venda (inclui consignados).
// Só ficam de fora 'vendido' (vai pra vitrine) e 'inativo' (escondido).
export async function getCarsPublic(): Promise<Car[]> {
  try {
    const { data, error } = await supabase
      .from("veiculos")
      .select("*")
      .not("status", "in", "(vendido,inativo)")
      .order("destaque", { ascending: false })
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) return staticCars;
    return data.map(rowToCar);
  } catch {
    return staticCars; // nunca deixa o site vazio
  }
}

// Página de um veículo (qualquer status — link direto a um vendido ainda abre).
export async function getCarPublic(slug: string): Promise<Car | null> {
  try {
    const { data } = await supabase
      .from("veiculos")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (data) return rowToCar(data);
  } catch {
    /* cai no fallback */
  }
  return staticCars.find((c) => c.id === slug) ?? null;
}

// Vitrine de vendidos (prova social). Marcar 'vendido' move o carro pra cá;
// marcar 'inativo' some de tudo.
export async function getSoldCars(limit = 8): Promise<Car[]> {
  try {
    const { data, error } = await supabase
      .from("veiculos")
      .select("*")
      .eq("status", "vendido")
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data.map(rowToCar);
  } catch {
    return [];
  }
}

export function brandsOf(cars: Car[]): string[] {
  return Array.from(new Set(cars.map((c) => c.marca))).sort();
}
