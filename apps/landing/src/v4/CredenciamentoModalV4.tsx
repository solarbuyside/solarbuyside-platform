import React, { useCallback, useRef, useState } from 'react'
import { ArrowUpRight, CheckCircle2, Loader2 } from 'lucide-react'
import { Img } from './atoms'
import { trackEvent } from '../utils/analytics'
import { comUtm } from './utm'
import { DialogoV4 } from './ModalV4'
import { CAMPO, CAMPOS_VAZIOS, ROTULO_CAMPO, enviarLead, formatarCelular, type CamposContato } from './captura'

/* MODAL "SEU DESCONTO ESTÁ A UM PASSO" — a ponte entre a LP e o cadastro de
   integrador da Belenergy (Francis, 05/09).

   O QUE ELE FAZ, e o que NÃO faz: coleta nome, e-mail e celular, grava o lead
   na mesma base do teaser (`ebook_leads`, marcada com `origem`) e leva a
   pessoa para o formulário da Belenergy com UTM. O desconto NÃO sai daqui: ele
   só existe depois que a Belenergy aprovar o cadastro, e essa aprovação chega
   por fora (relatório diário + e-mail), não por API. O texto do modal diz isso
   com todas as letras para ninguém sair daqui esperando um cupom na tela.

   A UTM no link de saída é o que permite à Belenergy contar quantos cadastros
   vieram da nossa página sem integração nenhuma do lado deles além de ler o
   parâmetro.

   A casca do diálogo (portal, Esc, foco, rolagem travada) mora em ModalV4.tsx
   desde que a inscrição na live do pré-lançamento passou a usar a mesma. */

/** Onde o lead nasceu. Vai gravado no banco e no Brevo para separar do teaser. */
const ORIGEM = 'belenergy-credenciamento'

type Props = {
  aberto: boolean
  aoFechar: () => void
  /** Destino do cadastro na Belenergy. A UTM é somada aqui dentro. */
  url: string
  /** Logo da Belenergy, o mesmo caminho que a caixa de promo já usa. */
  logo?: string
  titulo?: string
  texto?: string
  precoDe?: string
  precoPor?: string
  selo?: string
  rotuloCta?: string
  assinatura?: string
  /** Tela de sucesso (depois do envio do formulário). */
  sucessoTitulo?: string
  /** `{selo}` é trocado pelo selo — assim o texto não repete o valor à mão. */
  sucessoTexto?: string
}

export const CredenciamentoModalV4: React.FC<Props> = ({
  aberto,
  aoFechar,
  url,
  logo = '/assets/apoiadores/belenergy.png',
  titulo = 'Seu desconto está a um passo',
  texto = 'Deixe seus contatos aqui no Solar Buy-Side e continue seu cadastro na plataforma Belenergy. Após a aprovação, você desbloqueia seu benefício exclusivo no Método Solar Buy-Side.',
  precoDe = 'De R$ 797,00',
  precoPor = 'Por R$ 677,45',
  selo = '15% OFF',
  rotuloCta = 'Continuar para o cadastro Belenergy',
  assinatura = 'Seja um integrador credenciado Belenergy',
  sucessoTitulo = 'Falta só o cadastro',
  sucessoTexto =
    'Recebemos seus dados. Agora conclua seu cadastro de integrador na Belenergy: assim que ele for aprovado, seu benefício de {selo} é liberado por e-mail.',
}) => {
  const primeiroCampo = useRef<HTMLInputElement | null>(null)

  const [campos, setCampos] = useState<CamposContato>(CAMPOS_VAZIOS)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const destino = comUtm(url)

  /* Cada abertura recomeça limpa: quem fechasse depois de enviar reabriria
     direto na tela de sucesso, sem formulário. O reset acontece no gesto de
     fechar, e não num efeito que observa `aberto` — efeito que só chama
     setState é render em cascata sem motivo. */
  const fechar = useCallback(() => {
    setCampos(CAMPOS_VAZIOS)
    setEnviando(false)
    setEnviado(false)
    aoFechar()
  }, [aoFechar])

  const enviar = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (enviando) return
      setEnviando(true)

      trackEvent('ebook_download', { sectionName: ORIGEM })
      // A pessoa vai para a Belenergy em outra aba logo em seguida: ver o
      // `keepalive` e o sucesso otimista em enviarLead (captura.ts).
      enviarLead(campos, ORIGEM)

      setEnviando(false)
      setEnviado(true)
    },
    [campos, enviando],
  )

  const rotuloCampo = ROTULO_CAMPO
  const campo = CAMPO

  return (
    <DialogoV4
      aberto={aberto}
      aoFechar={fechar}
      tituloId="credenciamento-titulo"
      /* Clique no fundo fecha, mas só antes do envio: com o formulário
         preenchido, um clique torto fora da caixa custaria o lead. Depois de
         enviado não há mais nada a perder. */
      fecharNoFundo={enviado || (!campos.nome && !campos.email && !campos.celular)}
      focoInicial={primeiroCampo}
    >
            {!enviado ? (
              <>
                <Img src={logo} alt="Belenergy" loading="lazy" className="h-9 w-auto" />

                <h2
                  id="credenciamento-titulo"
                  className="mt-5 font-['Sora'] text-[1.6rem] font-extrabold leading-[1.12] tracking-tight text-white"
                >
                  {titulo}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-300">{texto}</p>

                {/* Benefício: o preço riscado, o preço novo e o selo. É a
                    promessa do modal, então fica acima do formulário, e não
                    depois dele. */}
                {/* `flex-nowrap` de propósito: com `flex-wrap`, o selo caía
                    para a linha de baixo no celular e ficava sozinho, longe do
                    preço que ele qualifica. O bloco de preço encolhe (min-w-0)
                    e o selo nunca encolhe (shrink-0). */}
                <div className="mt-6 flex flex-nowrap items-center gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/[0.07] px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-500 line-through">{precoDe}</p>
                    {/* `whitespace-nowrap`: "Por R$ 677,45" quebrando em duas
                        linhas a 360px empurrava o selo para fora do eixo do
                        preço. O corpo cede antes (text-xl no estreito). */}
                    <p className="whitespace-nowrap font-['Sora'] text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                      {precoPor}
                    </p>
                  </div>
                  <span className="v4-mono ml-auto shrink-0 whitespace-nowrap rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                    {selo}
                  </span>
                </div>

                <form onSubmit={enviar} className="mt-6 space-y-4">
                  <div>
                    <label className={rotuloCampo} htmlFor="cred-nome">
                      Nome completo
                    </label>
                    <input
                      ref={primeiroCampo}
                      id="cred-nome"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={campos.nome}
                      onChange={(e) => setCampos((c) => ({ ...c, nome: e.target.value }))}
                      placeholder="Seu nome completo"
                      className={campo}
                    />
                  </div>

                  <div>
                    <label className={rotuloCampo} htmlFor="cred-email">
                      E-mail
                    </label>
                    <input
                      id="cred-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      value={campos.email}
                      onChange={(e) => setCampos((c) => ({ ...c, email: e.target.value }))}
                      placeholder="voce@empresa.com.br"
                      className={campo}
                    />
                  </div>

                  <div>
                    <label className={rotuloCampo} htmlFor="cred-celular">
                      Celular
                    </label>
                    <input
                      id="cred-celular"
                      name="tel"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      required
                      /* 14 = "(11) 9999-9999" com DDD de 10 dígitos. O
                         `pattern` cobre os dois formatos porque fixo antigo
                         ainda aparece em cadastro de empresa. */
                      minLength={14}
                      value={campos.celular}
                      onChange={(e) => setCampos((c) => ({ ...c, celular: formatarCelular(e.target.value) }))}
                      placeholder="(11) 98765-4321"
                      className={campo}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={enviando}
                    className="v4-cta-shine group relative mt-2 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-b from-orange-500 to-orange-600 py-4 text-base font-extrabold uppercase tracking-tight text-white shadow-[0_18px_40px_-12px_rgba(249,115,22,0.65),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
                  >
                    {enviando ? (
                      <Loader2 size={18} className="animate-spin" aria-hidden />
                    ) : (
                      <span className="relative z-10 leading-tight">{rotuloCta}</span>
                    )}
                  </button>
                </form>

                <p className="v4-mono mt-5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  {assinatura}
                </p>
              </>
            ) : (
              /* Depois do envio o modal não fecha sozinho: o link para a
                 Belenergy é o próximo passo e precisa de um clique da pessoa.
                 Abrir a aba por script seria bloqueado como popup, já que o
                 clique original foi no "enviar", não no link. */
              <div className="text-center">
                <CheckCircle2 size={44} className="mx-auto text-emerald-500" aria-hidden />
                <h2 id="credenciamento-titulo" className="mt-5 font-['Sora'] text-2xl font-extrabold tracking-tight text-white">
                  {sucessoTitulo}
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-slate-300">
                  {sucessoTexto.split('{selo}').join(selo)}
                </p>

                <a
                  href={destino}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="v4-cta-shine group relative mt-7 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-b from-orange-500 to-orange-600 py-4 text-base font-extrabold uppercase tracking-tight text-white shadow-[0_18px_40px_-12px_rgba(249,115,22,0.65),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <span className="relative z-10 leading-tight">{rotuloCta}</span>
                  <ArrowUpRight size={18} className="relative z-10 shrink-0 transition-transform group-hover:-translate-y-0.5" aria-hidden />
                </a>

                <button
                  type="button"
                  onClick={fechar}
                  className="mt-4 text-sm font-semibold text-slate-400 transition-colors hover:text-white"
                >
                  Fechar
                </button>
              </div>
            )}
    </DialogoV4>
  )
}
