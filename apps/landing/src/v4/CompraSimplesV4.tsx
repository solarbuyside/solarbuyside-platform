import React from 'react'
import { Inbox, MessageCircle, Timer } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Reveal } from './atoms'
import { criarTxt, temConteudo } from './cms'

/* "COMPRA SIMPLES. ACESSO IMEDIATO. SUPORTE GARANTIDO." (Francis, revisão de
   06/08, slide 19: "novo bloco").

   Ele mandou o bloco escrito num documento: um título, uma linha de abertura e
   três tópicos com emoji (📥 acesso aos materiais, ⏱️ prazo de entrega, 💬
   suporte). O conteúdo é dele; a forma é da LP.

   POSIÇÃO: imediatamente antes de "Capacite todo o seu time" e da oferta. As
   três dúvidas que ele responde aqui (o que chega, quando chega, quem me
   atende se der errado) são exatamente as que travam a mão de quem já decidiu
   comprar. Respondidas ANTES do preço, elas param de virar objeção.

   FUNDO CLARO, e não o preto do rascunho dele: o bloco cai no meio do 4º ato,
   entre o depoimento do Rodrigo e a seção da Equipe, os dois em #f7f8fa.
   Escurecer aqui abriria uma faixa preta de uma dobra só no meio de um trecho
   contínuo e a oferta perderia a entrada escura que ela faz logo depois.

   Os emojis viraram ícones de traço (lucide), como no resto da LP: emoji
   renderiza diferente em cada sistema e não aceita a cor da marca.

   A seção lê o id de CMS `compra-simples`. Enquanto não existir linha dela em
   landing_sections, tudo cai nos padrões daqui, que já são o texto aprovado. */

type Topico = {
  Icon: React.ComponentType<{ size?: number; className?: string }>
  titulo: string
  texto: string
}

export const CompraSimplesV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('compra-simples')
  const txt = criarTxt(section)

  const titulo = txt('title', 'Compra simples. Acesso imediato. Suporte garantido.')
  const lead = txt('subtitle', 'Tudo o que você precisa saber antes de comprar:')

  const topicos: Topico[] = [
    {
      Icon: Inbox,
      titulo: txt('item1Title', 'Acesso aos materiais'),
      texto: txt(
        'item1Text',
        'Após a confirmação do pagamento, você recebe por e-mail, em poucos minutos, o <span class="cms-bold">Manual Solar Buy-Side</span> e o <span class="cms-bold">Código do Vendedor Consultivo</span>, ambos em PDF. A compra também libera <span class="cms-bold">acesso vitalício à Plataforma de Avaliação de Propostas</span>.',
      ),
    },
    {
      Icon: Timer,
      titulo: txt('item2Title', 'Prazo de entrega'),
      texto: txt(
        'item2Text',
        '<span class="cms-bold">É digital e imediato.</span> Confirmado o pagamento, os materiais e as instruções de acesso são enviados automaticamente para o seu e-mail.',
      ),
    },
    {
      Icon: MessageCircle,
      titulo: txt('item3Title', 'Suporte'),
      texto: txt(
        'item3Text',
        'Teve alguma dúvida ou problema com a compra, recebimento ou acesso? <span class="cms-bold">Nossa equipe está disponível pelo WhatsApp para ajudar.</span>',
      ),
    },
  ].filter((t) => temConteudo(t.titulo) || temConteudo(t.texto))

  // Apagar o título no admin tira a dobra inteira do ar, como no resto da LP.
  if (!temConteudo(titulo) || topicos.length === 0) return null

  return (
    <section className="bg-[#f7f8fa] px-6 pb-20 pt-16 text-slate-700 md:pb-24 md:pt-20">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <h2 className="max-w-3xl font-['Sora'] text-[clamp(1.7rem,3.4vw,2.6rem)] font-extrabold leading-[1.12] tracking-tight text-slate-900">
            <CMSText value={titulo} />
          </h2>
        </Reveal>

        {temConteudo(lead) && (
          <Reveal delay={80}>
            <p className="mt-3 text-lg font-semibold text-slate-600">{lead}</p>
          </Reveal>
        )}

        {/* Três colunas no desktop, empilhadas no celular. Cartão branco com
            fio, o mesmo vocabulário das caixas claras da LP (a régua da Equipe
            e os cartões dos depoimentos). */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {topicos.map((topico, i) => (
            <Reveal key={i} delay={140 + i * 90}>
              <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500/10 text-orange-600"
                  aria-hidden
                >
                  <topico.Icon size={20} />
                </span>
                {temConteudo(topico.titulo) && (
                  <h3 className="v4-mono mt-5 text-[10px] font-bold uppercase tracking-[0.24em] text-orange-600">
                    {topico.titulo}
                  </h3>
                )}
                {temConteudo(topico.texto) && (
                  <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                    <CMSText value={topico.texto} />
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
