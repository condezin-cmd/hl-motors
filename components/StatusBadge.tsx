import { CarStatus } from "@/lib/types";

const map: Record<CarStatus, { label: string; cls: string }> = {
  disponivel: {
    label: "Disponível",
    cls: "bg-emerald-500 text-white",
  },
  reservado: {
    label: "Reservado",
    cls: "bg-amber-400 text-black",
  },
  vendido: {
    label: "Vendido",
    cls: "bg-zinc-300 text-black",
  },
};

export function StatusBadge({ status }: { status: CarStatus }) {
  const s = map[status];
  return (
    <span className={`inline-flex px-3 py-1 text-xs font-black uppercase ${s.cls}`}>
      {s.label}
    </span>
  );
}
