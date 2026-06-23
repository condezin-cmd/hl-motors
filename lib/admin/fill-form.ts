// Preenche campos (não-controlados) de um <form> a partir de um objeto de dados.
// Para <input>/<textarea> seta .value; para <select> tenta casar a opção
// (match exato, depois case-insensitive). Retorna os rótulos preenchidos.
export function fillForm(
  form: HTMLFormElement | null,
  dados: Record<string, string>,
  labels: Record<string, string>,
): string[] {
  if (!form) return [];
  const preenchidos: string[] = [];

  for (const [name, raw] of Object.entries(dados)) {
    const value = (raw ?? "").toString().trim();
    if (!value) continue;
    const el = form.elements.namedItem(name) as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
      | null;
    if (!el) continue;

    if (el instanceof HTMLSelectElement) {
      const opts = Array.from(el.options);
      const match =
        opts.find((o) => o.value.toLowerCase() === value.toLowerCase()) ||
        opts.find((o) => o.text.toLowerCase() === value.toLowerCase()) ||
        opts.find((o) => o.text.toLowerCase().includes(value.toLowerCase()));
      if (!match) continue;
      el.value = match.value;
    } else {
      el.value = value;
    }

    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    preenchidos.push(labels[name] ?? name);
  }

  return preenchidos;
}
