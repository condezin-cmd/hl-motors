"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { site, whatsappLink } from "@/lib/site";

const links = [
  { href: "/", label: "Home" },
  { href: "/#destaques", label: "Destaques" },
  { href: "/#estoque", label: "Estoque" },
  { href: "/#qualidade", label: "Empresa" },
  { href: "/#contato", label: "Contato" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const overlay = (
    <div
      className="flex flex-col bg-black md:hidden"
      style={{ position: "fixed", inset: 0, zIndex: 100 }}
    >
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-4">
        <span className="font-display text-xl font-black uppercase text-white">Menu</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Fechar menu"
          className="flex h-10 w-10 items-center justify-center text-white"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-col px-4">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className="font-display border-b border-white/10 py-5 text-3xl font-black uppercase text-white"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <a
        href={whatsappLink(`Olá, ${site.name}! Vim pelo site.`)}
        target="_blank"
        rel="noreferrer"
        onClick={() => setOpen(false)}
        className="mx-4 mt-6 flex items-center justify-center gap-2 bg-[var(--color-red)] py-4 text-sm font-black uppercase text-white"
      >
        <svg viewBox="0 0 32 32" className="h-5 w-5 fill-current" aria-hidden>
          <path d="M16 3C9 3 3.5 8.5 3.5 15.5c0 2.3.6 4.5 1.8 6.4L3 29l7.3-2.2c1.8 1 3.8 1.5 5.7 1.5 7 0 12.5-5.5 12.5-12.5S23 3 16 3z" />
        </svg>
        {site.whatsappDisplay}
      </a>
    </div>
  );

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="flex h-10 w-10 items-center justify-center text-white"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
        </svg>
      </button>

      {mounted && open && createPortal(overlay, document.body)}
    </div>
  );
}
