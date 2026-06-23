// ============================================================
// Modelo de documentos (blocos) + os 4 templates da HL Motors.
// Os blocos são renderizados em PDF e DOCX pelo mesmo conteúdo.
// ============================================================

export type Block =
  | { t: "h1"; text: string }
  | { t: "h2"; text: string }
  | { t: "p"; text: string; bold?: boolean; center?: boolean }
  | { t: "kv"; label: string; value: string }
  | { t: "sp" }
  | { t: "sign"; caption: string }
  | { t: "small"; text: string };

export type Doc = { titulo: string; blocks: Block[] };

export type Loja = {
  nome: string;
  cnpj: string;
  rua: string;
  numero: string;
  cidade: string;
  uf: string;
};

export type Cliente = {
  nome?: string | null;
  cpf?: string | null;
  rg?: string | null;
  orgao_emissor?: string | null;
  nacionalidade?: string | null;
  estado_civil?: string | null;
  profissao?: string | null;
  telefone?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
};

export type Veiculo = {
  marca?: string | null;
  modelo?: string | null;
  versao?: string | null;
  ano_fab?: number | null;
  ano_modelo?: number | null;
  cor?: string | null;
  combustivel?: string | null;
  placa?: string | null;
  renavam?: string | null;
  chassi?: string | null;
  km?: number | null;
  preco?: number | null;
};

export type Pagamento = {
  tipo: string; // À vista, PIX, Transferência, Dinheiro, Cartão, Financiamento, Entrada/Sinal, Troca
  valor?: string;
  banco?: string;
  parcelas?: string;
  valorParcela?: string;
  descricao?: string; // p/ troca: marca/modelo/ano
  placa?: string; // p/ troca
};

export type Extra = {
  valor?: string;
  formaPagamento?: string;
  pagamentos?: Pagamento[];
  comissao?: string;
  telefone?: string;
  observacoes?: string;
};

export function pagamentoLinha(p: Pagamento): string {
  let s = `${p.tipo}: ${brl(p.valor)}`;
  if (/financ/i.test(p.tipo)) {
    const extras: string[] = [];
    if (p.banco) extras.push(`Banco ${p.banco}`);
    if (p.parcelas) extras.push(`${p.parcelas}x${p.valorParcela ? " de " + brl(p.valorParcela) : ""}`);
    if (extras.length) s += ` (${extras.join(", ")})`;
  } else if (/cart/i.test(p.tipo) && p.parcelas) {
    s += ` (${p.parcelas}x)`;
  } else if (/troca/i.test(p.tipo)) {
    const d: string[] = [];
    if (p.descricao) d.push(p.descricao);
    if (p.placa) d.push(`placa ${p.placa}`);
    if (d.length) s += ` — veículo recebido: ${d.join(", ")}`;
  }
  return s;
}

const dash = "____________";

export const brl = (v?: number | string | null) => {
  const n = typeof v === "string" ? Number(v.replace(/[^\d.,]/g, "").replace(".", "").replace(",", ".")) : v;
  if (n == null || isNaN(Number(n))) return dash;
  return Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export function endereco(c: Cliente): string {
  const p: string[] = [];
  if (c.logradouro) p.push(c.logradouro + (c.numero ? `, nº ${c.numero}` : ""));
  if (c.complemento) p.push(c.complemento);
  if (c.bairro) p.push(c.bairro);
  if (c.cidade) p.push(`${c.cidade}${c.uf ? "/" + c.uf : ""}`);
  if (c.cep) p.push("CEP " + c.cep);
  return p.join(", ") || dash;
}

export function dataExtenso(d = new Date()): string {
  const meses = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

const nz = (v?: string | number | null) => (v == null || v === "" ? dash : String(v));

// ---------------------------------------------------------------------------
// 1) CONTRATO DE COMPRA E VENDA
// ---------------------------------------------------------------------------
export function contrato(loja: Loja, comprador: Cliente, v: Veiculo, ex: Extra): Doc {
  const blocks: Block[] = [
    { t: "h1", text: "CONTRATO DE COMPRA E VENDA" },
    { t: "sp" },
    { t: "p", text: "VENDEDOR:", bold: true },
    { t: "p", text: `${loja.nome}, pessoa jurídica de direito privado, inscrita no CNPJ ${loja.cnpj}, com sede em ${loja.cidade.toUpperCase()}, na ${loja.rua}, nº ${loja.numero}.` },
    { t: "sp" },
    { t: "p", text: "COMPRADOR:", bold: true },
    { t: "p", text: `${nz(comprador.nome)}, inscrito no CPF/CNPJ sob o nº ${nz(comprador.cpf)}, com endereço em ${endereco(comprador)}.` },
    { t: "sp" },
    { t: "p", text: "As partes acima referidas e qualificadas resolvem entabular a presente compra e venda na forma e termos a seguir expostos:" },
    { t: "h2", text: "CLÁUSULA PRIMEIRA – DO OBJETO" },
    { t: "kv", label: "Marca", value: nz(v.marca) },
    { t: "kv", label: "Modelo", value: `${nz(v.modelo)} ${v.versao ?? ""}`.trim() },
    { t: "kv", label: "Cor", value: nz(v.cor) },
    { t: "kv", label: "Combustível", value: nz(v.combustivel) },
    { t: "kv", label: "Ano Fab/Mod", value: `${nz(v.ano_fab)}/${nz(v.ano_modelo)}` },
    { t: "kv", label: "Placa", value: nz(v.placa) },
    { t: "kv", label: "Renavam", value: nz(v.renavam) },
    { t: "kv", label: "Chassi", value: nz(v.chassi) },
    { t: "h2", text: "CLÁUSULA SEGUNDA - DO PREÇO E FORMA DE PAGAMENTO" },
    { t: "p", text: `Valor da venda: ${brl(ex.valor || v.preco)}.`, bold: true },
    ...(ex.pagamentos && ex.pagamentos.length
      ? ([
          { t: "p", text: "O pagamento se dará da seguinte forma:" },
          ...ex.pagamentos.map((p) => ({ t: "p", text: "•  " + pagamentoLinha(p) }) as Block),
        ] as Block[])
      : ex.formaPagamento
        ? ([{ t: "p", text: `Forma de pagamento: ${ex.formaPagamento}.` }] as Block[])
        : []),
    ...(ex.observacoes ? [{ t: "p", text: ex.observacoes } as Block] : []),
    { t: "h2", text: "CLÁUSULA TERCEIRA - DA VISTORIA E AVALIAÇÃO DO VEÍCULO" },
    { t: "p", text: "O COMPRADOR declara ter vistoriado e avaliado o estado em que se encontra o veículo ora negociado, estando o mesmo em perfeitas condições de funcionamento e estado de conservação." },
    { t: "h2", text: "CLÁUSULA QUARTA - DA RESPONSABILIDADE CIVIL E CRIMINAL" },
    { t: "p", text: "A partir desta data e hora, o COMPRADOR se responsabiliza por quaisquer danos, seja no âmbito civil ou criminal, decorrentes da utilização do veículo ora adquirido, inclusive multas e pontuações na CNH, sejam de âmbito Municipal, Estadual e/ou Federal, respondendo ainda pela evicção e eventuais vícios redibitórios. Acaso o VENDEDOR tenha recebido algum veículo do COMPRADOR como forma de pagamento, fica este responsável, nos mesmos termos, pelo veículo recebido. O presente instrumento é firmado nos termos do artigo 784, III do CPC, constituindo título executivo extrajudicial." },
    { t: "h2", text: "CLÁUSULA QUINTA – DA GARANTIA" },
    { t: "p", text: "Para os veículos usados a VENDEDORA fornece a garantia pelo tempo exigido por lei, somente para os componentes internos de motor e caixa de câmbio, cancelada automaticamente em caso de mau uso, alteração das características originais, uso fora dos padrões/limites do fabricante, competições ou manutenção negligenciada. Serviços cobertos devem ser executados por oficina indicada pela VENDEDORA, mediante orçamento aprovado. Ficam de fora componentes eletroeletrônicos, sistema de arrefecimento e itens de desgaste natural (embreagem, freios, correias, bateria, amortecedores, etc.)." },
    { t: "h2", text: "CLÁUSULA SEXTA - DA TRANSFERÊNCIA DO BEM" },
    { t: "p", text: "A transferência do bem para o nome do comprador só se dará após a total quitação do bem descrito na cláusula primeira; em caso de pagamento em cheque ou título de crédito, após a respectiva compensação ou quitação." },
    { t: "h2", text: "CLÁUSULA SÉTIMA - DA CLÁUSULA RESOLUTIVA" },
    { t: "p", text: "No caso de não cumprimento dos pagamentos devidos, permite-se ao VENDEDOR pedir a resolução do contrato ou exigir seu cumprimento, independentemente de notificação, nos termos do art. 475 do Código Civil. Na hipótese de resolução, o COMPRADOR pagará ao VENDEDOR o valor diário pelo uso do veículo na base de 0,5% sobre o valor do mesmo, até a devolução do bem." },
    { t: "h2", text: "CLÁUSULA OITAVA - DO DEPÓSITO" },
    { t: "p", text: "Nos termos do artigo 629 do Código Civil, o COMPRADOR assume, de forma gratuita, a condição de depositário do bem, obrigando-se pela guarda e conservação do mesmo até o integral pagamento do preço." },
    { t: "h2", text: "CLÁUSULA NONA - LGPD" },
    { t: "p", text: "A VENDEDORA está em conformidade com a Lei 13.709/2018 (LGPD). Os dados pessoais fornecidos serão utilizados somente para a finalidade de elaboração deste documento e dos trâmites necessários, com a ciência e autorização do titular." },
    { t: "h2", text: "CLÁUSULA DÉCIMA - FORO" },
    { t: "p", text: "Para dirimir quaisquer dúvidas, as partes elegem o foro da Comarca da VENDEDORA, renunciando o COMPRADOR ao foro previsto no artigo 101, I do CDC." },
    { t: "sp" },
    { t: "p", text: `${loja.cidade}/${loja.uf}, ${dataExtenso()}.` },
    { t: "sp" },
    { t: "sign", caption: `${nz(comprador.nome)} — CPF ${nz(comprador.cpf)} (COMPRADOR)` },
    { t: "sign", caption: `${loja.nome} — CNPJ ${loja.cnpj} (VENDEDOR)` },
  ];
  return { titulo: `Contrato de Compra e Venda — ${nz(v.marca)} ${nz(v.modelo)}`, blocks };
}

// ---------------------------------------------------------------------------
// 2) PROCURAÇÃO COM PODERES DE VENDA (Detran/PR)
// ---------------------------------------------------------------------------
export function procuracao(loja: Loja, outorgante: Cliente, outorgado: Cliente, v: Veiculo): Doc {
  const q = (c: Cliente) =>
    `${nz(c.nome)}, ${c.nacionalidade || "brasileiro(a)"}, ${c.estado_civil || "—"}, ${c.profissao || "—"}, portador(a) do RG nº ${nz(c.rg)} e CPF nº ${nz(c.cpf)}, residente e domiciliado(a) à ${endereco(c)}`;
  const blocks: Block[] = [
    { t: "h1", text: "PROCURAÇÃO COM PODERES DE VENDA" },
    { t: "sp" },
    { t: "p", text: "Pelo presente instrumento particular de procuração," },
    { t: "p", text: `EU, ${q(outorgante)}, outorga poderes a` },
    { t: "p", text: `${q(outorgado)}, para:` },
    { t: "p", text: "Representar-me perante o Departamento de Trânsito do Estado do Paraná – DETRAN/PR em todos os processos relacionados ao(s) meu(s) veículo(s), inclusive vender, transferir ou alienar veículos de minha propriedade, assinando como vendedor(a) e/ou comprador(a) o Certificado de Registro de Veículo (CRV) e/ou a Autorização para Transferência de Propriedade de Veículo (ATPV-e) e/ou autorização para preenchimento de ATPV-e; bem como assinar declaração de residência, representar-me perante quaisquer terceiros, requerer, alegar e assinar o que necessário for, e assinar liberação para retirada de veículos apreendidos, praticando todos os atos necessários ao fiel cumprimento deste mandato;" },
    { t: "p", text: "Veículo(s):", bold: true },
    { t: "kv", label: "Placa", value: nz(v.placa) },
    { t: "kv", label: "Chassi", value: nz(v.chassi) },
    { t: "kv", label: "Renavam", value: nz(v.renavam) },
    { t: "p", text: "Podendo substabelecer, total ou parcialmente, os poderes ora concedidos. Esta procuração é válida respeitado o prazo máximo de 3 (três) anos contado da assinatura." },
    { t: "sp" },
    { t: "p", text: `${loja.cidade}/${loja.uf}, ${dataExtenso()}.` },
    { t: "sp" },
    { t: "sign", caption: `${nz(outorgante.nome)} (Outorgante — assinatura com reconhecimento de firma por autenticidade)` },
  ];
  return { titulo: `Procuração — ${nz(outorgante.nome)}`, blocks };
}

// ---------------------------------------------------------------------------
// 3) DECLARAÇÃO DE CONSIGNAÇÃO
// ---------------------------------------------------------------------------
export function consignacao(loja: Loja, prop: Cliente, v: Veiculo, ex: Extra): Doc {
  const blocks: Block[] = [
    { t: "h1", text: loja.nome },
    { t: "h2", text: "DECLARAÇÃO DE CONSIGNAÇÃO" },
    { t: "kv", label: "Valor do veículo", value: brl(ex.valor || v.preco) },
    { t: "kv", label: "Telefone", value: nz(ex.telefone || prop.telefone) },
    { t: "p", text: `${loja.cidade}/${loja.uf}, ${dataExtenso()}.` },
    { t: "p", text: "Declaro para todos e quaisquer fins que deixei em consignação, para venda, o veículo de minha propriedade e/ou responsabilidade, abaixo descriminado:" },
    { t: "kv", label: "Proprietário", value: `${nz(prop.nome)}, CPF ${nz(prop.cpf)}` },
    { t: "kv", label: "Endereço", value: endereco(prop) },
    { t: "kv", label: "Marca/Modelo", value: `${nz(v.marca)} ${nz(v.modelo)} ${v.versao ?? ""}`.trim() },
    { t: "kv", label: "Placa", value: nz(v.placa) },
    { t: "kv", label: "Cor", value: nz(v.cor) },
    { t: "kv", label: "Ano", value: `${nz(v.ano_fab)}/${nz(v.ano_modelo)}` },
    { t: "kv", label: "Chassi", value: nz(v.chassi) },
    { t: "kv", label: "Renavam", value: nz(v.renavam) },
    { t: "kv", label: "KM", value: nz(v.km) },
    { t: "p", text: "Declaro ainda que me responsabilizo civil e criminalmente pela procedência do mesmo (mecânica, elétrica, dentre outras), bem como pelas multas, bloqueio de venda, judicial, número de chassi e outras pendências que possam haver sobre o referido veículo até a presente data, conforme os artigos pertinentes do Código Civil e do Código de Defesa do Consumidor. A garantia do veículo é de minha responsabilidade; qualquer vício/defeito que possa surgir ficará sob a responsabilidade do proprietário." },
    { t: "p", text: `Declaro também que a loja – ${loja.nome} – poderá realizar a venda da melhor maneira que entender, para que surta o objetivo de valores. Por outro lado, a empresa assegura o veículo, responsabilizando-se sobre a sua estadia, garantindo todo e qualquer negócio, tratando de toda a documentação e efetuando o pagamento no prazo pré-estipulado.` },
    { t: "p", text: "O prazo mínimo desta é de 30 (trinta) dias. Na retirada antecipada será cobrada uma taxa referente à emissão de notas fiscais, de R$ 100,00." },
    ...(ex.observacoes ? [{ t: "p", text: "Observações: " + ex.observacoes } as Block] : []),
    { t: "sp" },
    { t: "sign", caption: `${nz(prop.nome)} (Proprietário — de acordo)` },
  ];
  return { titulo: `Termo de Consignação — ${nz(v.marca)} ${nz(v.modelo)}`, blocks };
}

// ---------------------------------------------------------------------------
// 4) DECLARAÇÃO DE RESIDÊNCIA
// ---------------------------------------------------------------------------
export function residencia(loja: Loja, c: Cliente): Doc {
  const blocks: Block[] = [
    { t: "h1", text: "DECLARAÇÃO DE RESIDÊNCIA" },
    { t: "p", text: "Ao DETRAN" },
    { t: "p", text: "Ilmo. Sr. Diretor Geral do DETRAN/PR,", bold: true },
    { t: "sp" },
    { t: "kv", label: "Nome", value: nz(c.nome) },
    { t: "kv", label: "CPF/CNPJ", value: nz(c.cpf) },
    { t: "kv", label: "RG", value: nz(c.rg) },
    { t: "kv", label: "Telefone", value: nz(c.telefone) },
    { t: "sp" },
    { t: "p", text: "Na ausência de documentos para comprovação de residência, DECLARO para os devidos fins, sob as penas da Lei, ser residente e domiciliado à:" },
    { t: "kv", label: "Endereço", value: endereco(c) },
    { t: "p", text: "Declaro ainda estar ciente de que a falsidade da presente declaração pode implicar na sanção penal prevista no Art. 299 do Código Penal:" },
    { t: "small", text: "“Art. 299 - Omitir, em documento público ou particular, declaração que nele deveria constar, ou nele inserir ou fazer inserir declaração falsa ou diversa da que deveria ser escrita, com o fim de prejudicar direito, criar obrigação ou alterar a verdade sobre o fato juridicamente relevante.” Pena: reclusão de 1 a 5 anos e multa, se o documento é público; e reclusão de 1 a 3 anos, se o documento é particular." },
    { t: "p", text: "Para que surta os efeitos legais, firmo a presente." },
    { t: "p", text: `${loja.cidade}/${loja.uf}, ${dataExtenso()}.` },
    { t: "sp" },
    { t: "sign", caption: "Reconhecer firma por VERDADEIRO" },
  ];
  return { titulo: `Declaração de Residência — ${nz(c.nome)}`, blocks };
}
