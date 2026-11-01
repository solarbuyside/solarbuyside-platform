import React, { useEffect, useState } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Img, Reveal } from './atoms'
import { temConteudo } from './cms'
import { InscricaoLiveModalV4 } from './InscricaoLiveModalV4'
import { capturaDoBuild } from './ambiente'
import { SemQuebraNoHifen } from './SemQuebraV4'
import {
  ID_LIVE,
  SECAO_LIVE,
  faseDaLive,
  iniciais,
  lerDataHoraBrasilia,
  lerDuracao,
  tempoRestante,
  usePreLancamento,
  type FaseLive,
} from './prelancamento'

/* BLOCO DA LIVE DE LANÇAMENTO (pré-lançamento, Francis 29/10, slide 5: "No
   lugar do bloco de oferta, cria arte para inserir essas mensagens e uma
   contagem regressiva").

   Ocupa o lugar do card de preço, dentro da seção da oferta: as quatro capas
   do kit continuam logo acima, e o que era "quanto custa" vira "quando você
   conhece". A moldura é a mesma do card de preço (v4-conic-frame), para o
   bloco ler como o palco da oferta trocado de função, não como uma seção
   colada de fora.

   A arte do slide usa verde e amarelo. Aqui ela fala a língua da LP: o
   amarelo dos números é o âmbar do sistema (--v4-amber), e o selo verde virou
   a etiqueta mono âmbar. O botão é o laranja de conversão de toda a página.

   TRÊS FASES, pela hora de Brasília:
   - antes: a contagem e o botão de inscrição;
   - ao vivo (do início até o fim estimado): "Ao vivo agora" e o link da
     transmissão, se houver;
   - depois: o recado de que a oferta abre em instantes, até alguém virar o
     modo da página para vendas.

   A CONTAGEM E O HTML CONGELADO. O HTML da LP é pré-renderizado no build e o
   React adota esse DOM sem repintar (hydrateRoot). Um relógio que saísse com
   números no HTML nunca bateria com o primeiro render do visitante, segundos
   ou dias depois, e a hidratação acusaria mismatch. Por isso o primeiro render
   é SEMPRE neutro ("--" e a fase "antes"), e o relógio só começa a andar no
   efeito. No build (Chromium automatizado, `navigator.webdriver`) ele nem
   começa: o que o prerender captura é exatamente esse primeiro render. */

const pad2 = (n: number) => `${n < 10 ? '0' : ''}${n}`

const UNIDADES = [
  { chave: 'dias', rotulo: 'Dias' },
  { chave: 'horas', rotulo: 'Horas' },
  { chave: 'minutos', rotulo: 'Minutos' },
  { chave: 'segundos', rotulo: 'Segundos' },
] as const

/** Relógio de 1s que só existe no navegador de um visitante real. */
function useAgora(): number | null {
  const [agora, setAgora] = useState<number | null>(null)
  useEffect(() => {
    if (capturaDoBuild()) return
    const tick = () => setAgora(Date.now())
    const primeiro = window.setTimeout(tick, 0)
    const intervalo = window.setInterval(tick, 1000)
    return () => {
      window.clearTimeout(primeiro)
      window.clearInterval(intervalo)
    }
  }, [])
  return agora
}

const CTA_CLASSES =
  'v4-cta-shine group relative mx-auto mt-10 flex w-full max-w-md items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-b from-orange-500 to-orange-600 px-6 py-5 text-base font-extrabold tracking-tight text-white shadow-[0_18px_40px_-12px_rgba(249,115,22,0.65),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_52px_-12px_rgba(249,115,22,0.8),inset_0_1px_0_rgba(255,255,255,0.3)] active:scale-[0.98] md:text-lg'

export const LancamentoV4: React.FC = () => {
  const { getSection } = useContent()
  const { live: txt } = usePreLancamento()
  const imagens = getSection(SECAO_LIVE)?.images ?? {}
  /* Francis e Ovídio já têm foto na seção dos Mentores. Sem foto própria no
     bloco da live, os dois primeiros participantes usam essas, com o mesmo
     default do AuthorityV4. Convidados sem foto ficam com as iniciais. */
  const mentores = getSection('authority')?.images ?? {}
  const PADRAO: Record<number, { nome: string; papel: string; foto: string }> = {
    1: { nome: 'Francis Poloni', papel: 'Criador da solução', foto: mentores.francis ?? '/assets/Francis Poloni LP PRO 368.jpeg' },
    2: { nome: 'Ovídio Collesi', papel: 'Criador da solução', foto: mentores.ovidio ?? '/assets/Ovídio2.png' },
    3: { nome: '', papel: 'Integrador · moderação', foto: '' },
    4: { nome: '', papel: 'Vendedor solar · moderação', foto: '' },
  }
  const [modalAberto, setModalAberto] = useState(false)
  const agora = useAgora()

  const inicio = lerDataHoraBrasilia(txt('startsAt', '01/12/2026 20:00'))
  const duracao = lerDuracao(txt('durationMin', '150'))
  // Primeiro render (e o build): fase "antes", relógio em branco.
  const fase: FaseLive = agora !== null && inicio !== null ? faseDaLive(agora, inicio, duracao) : 'antes'
  const restante = agora !== null && inicio !== null ? tempoRestante(inicio - agora) : null

  const titulos: Record<FaseLive, string> = {
    antes: txt('title', 'Em poucos dias, o Solar Buy-Side<br/>será revelado ao vivo.'),
    aoVivo: txt('liveTitle', 'A live de lançamento<br/>está no ar agora.'),
    depois: txt('afterTitle', 'A live terminou.<br/>A oferta abre em instantes.'),
  }
  const kicker = txt('kicker', 'Lançamento ao vivo · Solar Buy-Side')
  const textoDepois = txt(
    'afterText',
    'Obrigado por estar com a gente. A página com a condição de lançamento volta ao ar em poucos minutos.',
  )
  const dataLinha = txt(
    'dateLine',
    'Terça-feira, <span class="cms-orange">1º de dezembro de 2026</span>, às <span class="cms-orange">20h</span> (horário de Brasília)',
  )

  const anfitrioes = [1, 2, 3, 4]
    .map((n) => {
      const nome = txt(`host${n}Name`, PADRAO[n].nome)
      return {
        nome,
        papel: txt(`host${n}Role`, PADRAO[n].papel),
        // A foto dos Mentores só vale enquanto o participante for a pessoa
        // padrão: se o admin trocar o nome, a foto do Francis não vai junto.
        foto: imagens[`host${n}Photo`] || (nome === PADRAO[n].nome ? PADRAO[n].foto : ''),
      }
    })
    .filter((a) => temConteudo(a.nome))
  const anfitrioesIntro = txt('hostsIntro', 'Com os criadores da solução e convidados que vivem a venda solar na prática:')

  const grupoUrl = txt('groupUrl')
  const grupoRotulo = txt('groupLabel', 'Entrar no grupo do WhatsApp')
  const transmissaoUrl = txt('liveUrl')
  const ehLink = (url: string) => /^https?:\/\//i.test(url)

  /* O botão muda de trabalho com a fase. Antes: inscrição. Ao vivo: assistir,
     se a transmissão estiver cadastrada (sem ela, a inscrição continua sendo o
     caminho para o grupo, onde o link vai circular). Depois: o grupo. */
  let botao: React.ReactNode = null
  if (fase === 'aoVivo' && ehLink(transmissaoUrl)) {
    botao = (
      <a href={transmissaoUrl} target="_blank" rel="noopener noreferrer" className={CTA_CLASSES}>
        <span className="relative z-10 leading-tight">{txt('liveCtaLabel', 'Assistir agora')}</span>
        <ArrowUpRight size={20} className="relative z-10 shrink-0 transition-transform group-hover:-translate-y-0.5" />
      </a>
    )
  } else if (fase === 'depois') {
    botao = ehLink(grupoUrl) ? (
      <a href={grupoUrl} target="_blank" rel="noopener noreferrer" className={CTA_CLASSES}>
        <span className="relative z-10 leading-tight">{grupoRotulo}</span>
        <ArrowUpRight size={20} className="relative z-10 shrink-0 transition-transform group-hover:-translate-y-0.5" />
      </a>
    ) : null
  } else {
    const rotulo = txt('ctaLabel', 'Garantir minha vaga na live')
    botao = temConteudo(rotulo) ? (
      <button type="button" onClick={() => setModalAberto(true)} className={CTA_CLASSES}>
        <span className="relative z-10 leading-tight">{rotulo}</span>
        <ArrowRight size={20} className="relative z-10 shrink-0 transition-transform group-hover:translate-x-1" />
      </button>
    ) : null
  }

  return (
    <div id={ID_LIVE} className="v4-live mx-auto mt-24 max-w-5xl">
      <Reveal delay={120}>
        <div className="v4-conic-frame rounded-[2.5rem] p-px">
          <div className="v4-conic-inner rounded-[calc(2.5rem-1px)] bg-[#0d0a08] px-5 py-12 text-center sm:px-10 md:px-14 md:py-16">
            {fase === 'aoVivo' ? (
              <p className="v4-mono inline-flex items-center gap-2.5 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-red-200">
                <span className="relative flex h-2 w-2" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                {txt('liveKicker', 'Ao vivo agora')}
              </p>
            ) : (
              temConteudo(kicker) && (
                <p className="v4-mono text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400 sm:text-[11px] sm:tracking-[0.26em]">
                  <SemQuebraNoHifen texto={kicker} />
                </p>
              )
            )}

            <h2 className="mx-auto mt-6 max-w-4xl font-['Sora'] text-[clamp(1.85rem,4.2vw,3.25rem)] font-extrabold leading-[1.08] tracking-tight text-white">
              {/* Espaço antes de cada <br>: no celular o v4.css esconde a
                  quebra, e sem o espaço "Buy-Side<br/>será" grudaria. No
                  desktop o espaço fica no fim da linha, invisível. */}
              <CMSText value={titulos[fase].replace(/(\S)<br\s*\/?>/gi, '$1 <br/>')} />
            </h2>

            {temConteudo(dataLinha) && fase !== 'depois' && (
              <p className="mx-auto mt-6 max-w-2xl text-lg font-semibold leading-snug text-slate-200 md:text-xl">
                <CMSText value={dataLinha} />
              </p>
            )}

            {fase === 'depois' && temConteudo(textoDepois) && (
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">{textoDepois}</p>
            )}

            {/* Relógio. Some quando a live começa, e some também se a data do
                admin não for reconhecida: contagem para lugar nenhum é pior
                que nenhuma. */}
            {fase === 'antes' && inicio !== null && (
              <div className="mt-10 flex items-start justify-center gap-1.5 sm:gap-4" role="timer" aria-label="Contagem regressiva para a live">
                {UNIDADES.map((u, i) => (
                  <React.Fragment key={u.chave}>
                    {i > 0 && (
                      <span
                        className="pt-[1.15rem] font-['Sora'] text-xl font-extrabold text-amber-400/50 sm:pt-8 sm:text-4xl md:pt-9"
                        aria-hidden
                      >
                        :
                      </span>
                    )}
                    <div className="flex w-[4.1rem] flex-col items-center sm:w-28 md:w-32">
                      <span className="flex h-[4.4rem] w-full items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] font-['Sora'] text-[2rem] font-extrabold leading-none tabular-nums tracking-tight text-amber-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:h-28 sm:text-6xl md:h-32 md:text-7xl">
                        {restante ? pad2(restante[u.chave]) : '--'}
                      </span>
                      <span className="v4-mono mt-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 sm:text-[11px]">
                        {u.rotulo}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}

            {anfitrioes.length > 0 && fase !== 'depois' && (
              <div className="mt-12 border-t border-white/[0.08] pt-10">
                {temConteudo(anfitrioesIntro) && (
                  <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-slate-400">{anfitrioesIntro}</p>
                )}
                <ul className="mt-7 flex flex-wrap justify-center gap-x-8 gap-y-6">
                  {anfitrioes.map((a) => (
                    <li key={a.nome} className="flex min-w-[11rem] items-center gap-3.5 text-left">
                      {a.foto ? (
                        <Img
                          src={a.foto}
                          alt=""
                          loading="lazy"
                          className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-amber-400/40"
                        />
                      ) : (
                        <span
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-400 font-['Sora'] text-lg font-extrabold text-[#181410]"
                          aria-hidden
                        >
                          {iniciais(a.nome)}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block font-['Sora'] text-base font-bold leading-tight text-white">{a.nome}</span>
                        {temConteudo(a.papel) && (
                          <span className="mt-0.5 block text-sm leading-snug text-slate-400">{a.papel}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {botao}
          </div>
        </div>
      </Reveal>

      <InscricaoLiveModalV4
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        titulo={txt('modalTitle', 'Garanta sua vaga na live')}
        texto={txt(
          'modalText',
          'Deixe seus contatos para receber o link da transmissão e entrar no grupo exclusivo para integradores e vendedores do setor solar.',
        )}
        data={dataLinha}
        rotuloCta={txt('modalCtaLabel', 'Quero participar da live')}
        assinatura={txt('modalFooter', 'Seus dados ficam só com a Solar Buy-Side')}
        sucessoTitulo={txt('modalSuccessTitle', 'Vaga garantida!')}
        sucessoTexto={txt(
          'modalSuccessText',
          'Agora entre no grupo exclusivo do WhatsApp: é por lá que vão chegar o link da transmissão e os avisos da live.',
        )}
        sucessoTextoSemGrupo={txt('modalSuccessTextNoGroup', 'Recebemos seus dados. Anote na agenda e nos vemos na live!')}
        grupoUrl={grupoUrl}
        grupoRotulo={grupoRotulo}
      />
    </div>
  )
}
