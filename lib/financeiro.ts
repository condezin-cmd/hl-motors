// Categorias do livro caixa. veiculo/socio indicam campos extras no formulário.
export type Categoria = {
  key: string;
  label: string;
  tipo: "entrada" | "saida";
  veiculo?: boolean;
  socio?: boolean;
};

export const CATEGORIAS: Categoria[] = [
  // ---- entradas ----
  { key: "venda", label: "Venda de veículo", tipo: "entrada", veiculo: true },
  { key: "comissao_consignacao", label: "Comissão de consignação", tipo: "entrada", veiculo: true },
  { key: "comissao_financeira", label: "Comissão de financeira / banco", tipo: "entrada", veiculo: true },
  { key: "aporte_socio", label: "Aporte de sócio", tipo: "entrada", socio: true },
  { key: "outra_entrada", label: "Outra entrada", tipo: "entrada" },
  // ---- saídas ----
  { key: "custo_veiculo", label: "Custo de aquisição (veículo)", tipo: "saida", veiculo: true },
  { key: "reparo", label: "Reparo / agregado (veículo)", tipo: "saida", veiculo: true },
  { key: "repasse_consignante", label: "Repasse ao consignante", tipo: "saida", veiculo: true },
  { key: "gasto_fixo", label: "Gasto fixo da loja", tipo: "saida" },
  { key: "retirada_socio", label: "Retirada de sócio", tipo: "saida", socio: true },
  { key: "outra_saida", label: "Outra saída", tipo: "saida" },
];

export const catByKey = (k: string) => CATEGORIAS.find((c) => c.key === k);
export const catLabel = (k: string) => catByKey(k)?.label ?? k;
