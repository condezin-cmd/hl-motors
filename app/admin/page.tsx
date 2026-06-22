import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function AdminPage() {
  return (
    <>
      <Navbar />
      <main className="px-4 pb-10 pt-32">
        <div className="mx-auto max-w-2xl">
          <span className="font-tech bg-[var(--color-red)] px-3 py-1.5 text-xs font-black uppercase tracking-[0.22em] text-white">
            Fase 2
          </span>
          <h1 className="font-display mt-5 text-5xl font-black uppercase leading-none">
            Área do lojista
          </h1>
          <p className="mt-5 text-[var(--color-mute)]">
            Aqui ficará o painel para cadastrar veículos e a integração com o
            bot do WhatsApp (Evolution API): você conversa, o bot pergunta os
            detalhes e publica o carro direto no estoque.
          </p>

          <div className="brand-panel mt-10 p-7">
            <h2 className="font-display text-2xl font-black uppercase">Próximos passos</h2>
            <ol className="mt-5 space-y-3 text-sm text-[var(--color-mute)]">
              <li>1. Conectar Supabase: banco de veículos, fotos e login.</li>
              <li>2. Subir a Evolution API e conectar o número do WhatsApp.</li>
              <li>3. Criar webhook do bot com fluxo de perguntas e publicação.</li>
              <li>4. Montar painel de edição e remoção de anúncios.</li>
            </ol>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
