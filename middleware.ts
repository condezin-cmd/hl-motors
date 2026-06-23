import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// Só roda no painel — o site público não é afetado.
export const config = {
  matcher: ["/admin/:path*"],
};
