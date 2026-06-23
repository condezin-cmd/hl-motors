import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente que GRAVA cookies — usar só em login/logout.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // chamado de Server Component — ignorável
          }
        },
      },
    }
  );
}

// Cliente SOMENTE LEITURA (setAll no-op). Usar em layouts, páginas e
// Server Actions de leitura/escrita de dados. NÃO tenta gravar cookies,
// então não quebra o POST dos Server Actions. A sessão é renovada na middleware.
export async function createReadClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          /* no-op de propósito */
        },
      },
    }
  );
}
