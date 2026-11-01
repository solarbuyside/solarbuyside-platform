import React, { useCallback, useRef, useState } from 'react'
import { ArrowUpRight, CheckCircle2, Loader2 } from 'lucide-react'
import { CMSText } from '../components/CMSText'
import { trackEvent } from '../utils/analytics'
import { DialogoV4 } from './ModalV4'
import { CAMPO, CAMPOS_VAZIOS, ROTULO_CAMPO, enviarLead, formatarCelular, type CamposContato } from './captura'
import { temConteudo } from './cms'
import { SemQuebraNoHifen } from './SemQuebraV4'

/* INSCRIÇÃO NA LIVE DE LANÇAMENTO (pré-lançamento, Francis 29/10, slide 5:
   "CTA de preenchimento similar ao do link Belenergy, com abertura da janela
   com solicitação de dados: Nome completo, Whatsapp, E-mail").

   Os campos estão na ordem que ele escreveu, com o WhatsApp antes do e-mail:
   o canal da campanha é o grupo, então é o dado que mais importa aqui.

   O documento que veio junto pede outra coisa para o mesmo botão: "clique no
   link abaixo e entre no grupo exclusivo". As duas coisas cabem juntas. O
   formulário grava o lead (na mesma base do teaser, com origem própria) e a
   tela de sucesso entrega o link do grupo. Sem link cadastrado no admin, a
   tela de sucesso só confirma a inscrição.

   Nenhum e-mail sai daqui. Confirmação e lembrete, se o Francis quiser, são
   uma campanha no Brevo, e campanha não se dispara sem ele pedir. */

const ORIGEM = 'live-lancamento'

type Props = {
  aberto: boolean
  aoFechar: () => void
  titulo: string
  texto: string
  /** Linha da data, a mesma do bloco (aceita o destaque do CMS). */
  data: string
  rotuloCta: string
  assinatura: string
  sucessoTitulo: string
  sucessoTexto: string
  /** Sucesso quando ainda não há link do grupo: o texto padrão fala do grupo. */
  sucessoTextoSemGrupo: string
  grupoUrl: string
  grupoRotulo: string
}

/* O WhatsApp é verde em todo lugar da LP onde ele aparece (o "Fale com a
   equipe" do contato). Aqui também, para a pessoa reconhecer o destino antes
   de ler o rótulo. */
const BOTAO_WHATSAPP =
  'group relative mt-7 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-[#25D366] py-4 text-base font-extrabold tracking-tight text-[#062b14] shadow-[0_18px_40px_-14px_rgba(37,211,102,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2ee073] active:scale-[0.98]'

export const InscricaoLiveModalV4: React.FC<Props> = ({
  aberto,
  aoFechar,
  titulo,
  texto,
  data,
  rotuloCta,
  assinatura,
  sucessoTitulo,
  sucessoTexto,
  sucessoTextoSemGrupo,
  grupoUrl,
  grupoRotulo,
}) => {
  const primeiroCampo = useRef<HTMLInputElement | null>(null)
  const [campos, setCampos] = useState<CamposContato>(CAMPOS_VAZIOS)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  /* Cada abertura recomeça limpa (mesma regra do modal Belenergy): o reset é
     no gesto de fechar, não num efeito que observa `aberto`. */
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
      enviarLead(campos, ORIGEM)
      setEnviando(false)
      setEnviado(true)
    },
    [campos, enviando],
  )

  const temGrupo = temConteudo(grupoUrl) && /^https?:\/\//i.test(grupoUrl)

  return (
    <DialogoV4
      aberto={aberto}
      aoFechar={fechar}
      tituloId="inscricao-live-titulo"
      fecharNoFundo={enviado || (!campos.nome && !campos.email && !campos.celular)}
      focoInicial={primeiroCampo}
    >
      {!enviado ? (
        <>
          <p className="v4-mono flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
            </span>
            Live de lançamento
          </p>

          <h2
            id="inscricao-live-titulo"
            className="mt-4 font-['Sora'] text-[1.6rem] font-extrabold leading-[1.12] tracking-tight text-white"
          >
            {titulo}
          </h2>
          {temConteudo(texto) && <p className="mt-3 text-[15px] leading-relaxed text-slate-300">{texto}</p>}

          {temConteudo(data) && (
            <p className="v4-live mt-5 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] px-5 py-3.5 text-[15px] font-semibold leading-snug text-slate-100">
              <CMSText value={data} />
            </p>
          )}

          <form onSubmit={enviar} className="mt-6 space-y-4">
            <div>
              <label className={ROTULO_CAMPO} htmlFor="live-nome">
                Nome completo
              </label>
              <input
                ref={primeiroCampo}
                id="live-nome"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={campos.nome}
                onChange={(e) => setCampos((c) => ({ ...c, nome: e.target.value }))}
                placeholder="Seu nome completo"
                className={CAMPO}
              />
            </div>

            <div>
              <label className={ROTULO_CAMPO} htmlFor="live-whatsapp">
                WhatsApp
              </label>
              <input
                id="live-whatsapp"
                name="tel"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                required
                minLength={14}
                value={campos.celular}
                onChange={(e) => setCampos((c) => ({ ...c, celular: formatarCelular(e.target.value) }))}
                placeholder="(11) 98765-4321"
                className={CAMPO}
              />
            </div>

            <div>
              <label className={ROTULO_CAMPO} htmlFor="live-email">
                E-mail
              </label>
              <input
                id="live-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={campos.email}
                onChange={(e) => setCampos((c) => ({ ...c, email: e.target.value }))}
                placeholder="voce@empresa.com.br"
                className={CAMPO}
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

          {temConteudo(assinatura) && (
            <p className="v4-mono mt-5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              <SemQuebraNoHifen texto={assinatura} />
            </p>
          )}
        </>
      ) : (
        /* Como no modal Belenergy, o próximo passo é um link que precisa do
           clique da pessoa: abrir o grupo por script seria bloqueado como
           popup, já que o clique original foi no "enviar". */
        <div className="text-center">
          <CheckCircle2 size={44} className="mx-auto text-emerald-500" aria-hidden />
          <h2 id="inscricao-live-titulo" className="mt-5 font-['Sora'] text-2xl font-extrabold tracking-tight text-white">
            {sucessoTitulo}
          </h2>
          {temConteudo(temGrupo ? sucessoTexto : sucessoTextoSemGrupo) && (
            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-slate-300">
              {temGrupo ? sucessoTexto : sucessoTextoSemGrupo}
            </p>
          )}

          {temGrupo && (
            <a href={grupoUrl} target="_blank" rel="noopener noreferrer" className={BOTAO_WHATSAPP}>
              <span className="relative z-10 leading-tight">{grupoRotulo}</span>
              <ArrowUpRight size={18} className="relative z-10 shrink-0 transition-transform group-hover:-translate-y-0.5" aria-hidden />
            </a>
          )}

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
