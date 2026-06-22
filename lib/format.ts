export const brl = (v: number) =>
  v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

export const km = (v: number) => `${v.toLocaleString("pt-BR")} km`;
