import Link from "next/link";
import { Logo } from "@/components/Logo";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = { title: "Painel" };

// Todo o painel exige login + dados ao vivo: nunca pre-renderizar no build
// (evita precisar de chaves Supabase em build-time).
export const dynamic = "force-dynamic";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--color-ink)]">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/10 bg-[var(--color-panel)] md:flex">
        <div className="flex h-20 items-center border-b border-white/10 px-4">
          <Link href="/admin">
            <Logo compact />
          </Link>
        </div>
        <div className="flex-1">
          <AdminNav />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-white/10 px-5 md:px-8">
          <span className="font-display text-lg font-black uppercase text-white">
            Painel HL Motors
          </span>
          <Link
            href="/"
            target="_blank"
            className="text-xs font-bold uppercase text-[var(--color-mute)] hover:text-white"
          >
            Ver site ↗
          </Link>
        </header>
        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
