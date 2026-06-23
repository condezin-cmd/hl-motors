"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createUser, setRole, deleteUser } from "@/app/admin/(panel)/usuarios/actions";

type Role = "gestor" | "admin" | "vendedor";
type User = { id: string; email: string; nome: string; role: Role; created: string };

const roles: { v: Role; l: string }[] = [
  { v: "gestor", l: "Gestor" },
  { v: "admin", l: "Admin" },
  { v: "vendedor", l: "Vendedor" },
];

export function UsuariosManager({ users }: { users: User[] }) {
  const [state, action, pending] = useActionState(createUser, null);
  const router = useRouter();
  const [busy, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [meId, setMeId] = useState("");

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setMeId(data.user?.id ?? ""));
  }, []);

  // fecha o form e atualiza ao criar
  if (state?.ok && open) setOpen(false);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black uppercase text-white">
            Usuários
          </h1>
          <p className="mt-1 text-[var(--color-mute)]">
            Crie logins e defina os papéis da equipe.
          </p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="bg-[var(--color-red)] px-5 py-3 text-sm font-black uppercase text-white hover:bg-[var(--color-red-bright)]"
        >
          {open ? "Fechar" : "+ Novo usuário"}
        </button>
      </div>

      {open && (
        <form
          action={action}
          className="brand-panel mt-6 grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          <Field name="nome" label="Nome" />
          <Field name="email" label="E-mail" type="email" required />
          <Field name="password" label="Senha (mín. 6)" type="password" required />
          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">
              Papel
            </label>
            <select
              name="role"
              defaultValue="vendedor"
              className="w-full border border-white/15 bg-[var(--color-graphite)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]"
            >
              {roles.map((r) => (
                <option key={r.v} value={r.v}>{r.l}</option>
              ))}
            </select>
          </div>
          {state?.error && (
            <p className="sm:col-span-2 lg:col-span-4 border border-[var(--color-red)]/40 bg-[var(--color-red)]/10 px-3 py-2 text-sm text-[var(--color-red-bright)]">
              {state.error}
            </p>
          )}
          <div className="sm:col-span-2 lg:col-span-4">
            <button
              disabled={pending}
              className="bg-[var(--color-red)] px-6 py-3 text-sm font-black uppercase text-white hover:bg-[var(--color-red-bright)] disabled:opacity-60"
            >
              {pending ? "Criando..." : "Criar usuário"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 overflow-x-auto border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-panel)] text-left text-[11px] uppercase tracking-wider text-[var(--color-mute)]">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-white/10">
                <td className="px-4 py-3 font-semibold text-white">
                  {u.nome || "—"}
                  {u.id === meId && (
                    <span className="ml-2 text-[10px] uppercase text-[var(--color-mute)]">(você)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[var(--color-mute)]">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    defaultValue={u.role}
                    disabled={u.id === meId || busy}
                    onChange={(e) =>
                      start(async () => {
                        await setRole(u.id, e.target.value as Role);
                        router.refresh();
                      })
                    }
                    className="border border-white/15 bg-[var(--color-graphite)] px-2 py-1.5 text-xs font-bold uppercase text-white outline-none disabled:opacity-50"
                  >
                    {roles.map((r) => (
                      <option key={r.v} value={r.v}>{r.l}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  {u.id !== meId && (
                    <button
                      onClick={() => {
                        if (confirm(`Excluir o usuário ${u.email}?`))
                          start(async () => {
                            await deleteUser(u.id);
                            router.refresh();
                          });
                      }}
                      className="border border-white/15 px-3 py-1.5 text-xs font-black uppercase text-[var(--color-mute)] hover:border-[var(--color-red)] hover:text-[var(--color-red)]"
                    >
                      Excluir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[var(--color-mute)]">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-red)]"
      />
    </div>
  );
}
