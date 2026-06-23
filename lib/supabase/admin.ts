import { createClient } from "@supabase/supabase-js";

// Cliente com SERVICE ROLE — ignora RLS. USAR SÓ NO SERVIDOR.
// Nunca importar em componentes client.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
