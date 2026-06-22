# HL Motors — Site (padrão iPhone Diamond)

Vitrine de seminovos da **HL Motors (Pinhais/PR)**. Visual premium escuro com
vidro fosco, gradientes platina e brilho de diamante. Construído com **Next.js +
TypeScript + Tailwind CSS v4**, preparado para **Supabase** e bot do WhatsApp via
**Evolution API**.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000

## Estrutura

```
app/
  page.tsx              # Home (hero, destaques, estoque, confiança)
  veiculos/[id]/        # Página de cada veículo
  admin/                # Área do lojista (fase 2)
  layout.tsx, globals.css
components/              # Navbar, Hero, CarCard, CarCatalog, Footer, etc.
lib/
  cars.ts               # Dados de exemplo (trocados pelo Supabase depois)
  types.ts              # Tipo Car
  site.ts               # Configs: WhatsApp, endereço, Instagram
  format.ts             # Formatação BRL / km
```

### ⚠️ Antes de publicar

Edite `lib/site.ts` e troque `whatsapp: "5541999999999"` pelo número real
(formato internacional, só dígitos).

## Roadmap — fase 2 (backend + WhatsApp)

1. **Supabase**: tabela `veiculos` + storage de fotos + auth do lojista.
   A UI já lê de `lib/cars.ts` com o tipo `Car`; basta trocar a fonte por uma
   query Supabase sem mexer nos componentes.
2. **Evolution API**: subir a instância (Docker), parear o número da loja.
3. **Bot de cadastro**: webhook recebe as mensagens, conduz o fluxo de perguntas
   (marca → modelo → versão → ano → km → preço → opcionais → fotos) e grava no
   Supabase. As fotos enviadas no WhatsApp vão para o storage e aparecem no site.
4. **Painel admin**: editar/remover/reservar anúncios.

> Fluxo do bot pensado: o lojista manda "novo carro" no WhatsApp, o bot pergunta
> cada detalhe, confirma um resumo e publica automaticamente no estoque.
