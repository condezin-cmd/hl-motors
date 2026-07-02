"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const base = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/leads", label: "Leads", icon: "◉" },
  { href: "/admin/negociacoes", label: "Negociações", icon: "₪" },
  { href: "/admin/financeiro", label: "Financeiro", icon: "$" },
  { href: "/admin/clientes", label: "Clientes", icon: "◍" },
  { href: "/admin/estoque", label: "Estoque", icon: "▤" },
  { href: "/admin/avaliacoes", label: "Avaliações", icon: "◈" },
  { href: "/admin/documentos", label: "Documentos", icon: "▣" },
  { href: "/admin/consignacao", label: "Consignação", icon: "◆" },
];

export function AdminNav() {
  const path = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string>();
  const [role, setRole] = useState<string>();

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setEmail(data.user.email ?? "");
      const { data: p } = await sb
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      setRole(p?.role ?? undefined);
    });
  }, []);

  async function sair() {
    await createClient().auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const items =
    role === "gestor"
      ? [...base, { href: "/admin/usuarios", label: "Usuários", icon: "◎" }]
      : base;

  return (
    <nav className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-1">
        {items.map((it) => {
          const active =
            it.href === "/admin" ? path === "/admin" : path.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-3 border-l-2 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
                active
                  ? "border-[var(--color-red)] bg-white/5 text-white"
                  : "border-transparent text-[var(--color-mute)] hover:text-white"
              }`}
            >
              <span className="text-[var(--color-red)]">{it.icon}</span>
              {it.label}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-white/10 p-4">
        {email && (
          <p className="mb-3 truncate text-xs text-[var(--color-mute)]">{email}</p>
        )}
        <button
          type="button"
          onClick={sair}
          className="w-full border border-white/15 px-4 py-2.5 text-xs font-black uppercase text-white transition-colors hover:border-[var(--color-red)] hover:bg-[var(--color-red)]"
        >
          Sair
        </button>
      </div>
    </nav>
  );
}
