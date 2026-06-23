"use client";

import { useActionState } from "react";
import { login } from "./actions";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-ink)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <form
          action={action}
          className="brand-panel p-7"
        >
          <h1 className="font-display text-2xl font-black uppercase text-white">
            Área do lojista
          </h1>
          <p className="mt-1 text-sm text-[var(--color-mute)]">
            Acesso restrito da equipe HL Motors.
          </p>

          <label className="mt-6 block text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">
            E-mail
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1.5 w-full border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]"
          />

          <label className="mt-4 block text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">
            Senha
          </label>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1.5 w-full border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]"
          />

          {state?.error && (
            <p className="mt-4 border border-[var(--color-red)]/40 bg-[var(--color-red)]/10 px-3 py-2 text-sm text-[var(--color-red-bright)]">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-6 w-full bg-[var(--color-red)] px-6 py-3.5 text-sm font-black uppercase text-white transition-colors hover:bg-[var(--color-red-bright)] disabled:opacity-60"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <a href="/" className="mt-5 block text-center text-xs text-[var(--color-mute)] hover:text-white">
          ← Voltar ao site
        </a>
      </div>
    </main>
  );
}
