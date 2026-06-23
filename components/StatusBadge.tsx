const map: Record<string, { label: string; cls: string }> = {
  disponivel: { label: "Disponível", cls: "bg-emerald-500 text-white" },
  reservado: { label: "Reservado", cls: "bg-amber-400 text-black" },
  vendido: { label: "Vendido", cls: "bg-zinc-300 text-black" },
  consignado: { label: "Consignado", cls: "bg-sky-500 text-white" },
  inativo: { label: "Inativo", cls: "bg-zinc-600 text-white" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = map[status] ?? { label: status, cls: "bg-zinc-600 text-white" };
  return (
    <span className={`inline-flex px-3 py-1 text-xs font-black uppercase ${s.cls}`}>
      {s.label}
    </span>
  );
}
