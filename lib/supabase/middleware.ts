import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Guarda /admin e renova a sessão — SÓ em navegações GET.
// Em POST (Server Actions) passa direto, sem tocar em getUser/cookies,
// para não quebrar a execução das actions.
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next();
  if (request.method !== "GET") return response;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isLogin = path.startsWith("/admin/login");

  if (!isLogin && !user) {
    const r = request.nextUrl.clone();
    r.pathname = "/admin/login";
    return NextResponse.redirect(r);
  }
  if (isLogin && user) {
    const r = request.nextUrl.clone();
    r.pathname = "/admin";
    return NextResponse.redirect(r);
  }

  // Área de Usuários é só do gestor
  if (user && path.startsWith("/admin/usuarios")) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (prof?.role !== "gestor") {
      const r = request.nextUrl.clone();
      r.pathname = "/admin";
      return NextResponse.redirect(r);
    }
  }

  return response;
}
