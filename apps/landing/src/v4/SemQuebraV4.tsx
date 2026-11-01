import React from 'react'

/* Texto em que palavras com hífen não quebram no meio.

   As etiquetas mono da LP (tracking largo, caixa alta) no celular partiam
   "BUY-SIDE" em "BUY-" / "SIDE", porque o hífen é ponto de quebra legítimo
   para o navegador. Aqui, cada palavra com hífen vira um <span> nowrap; o
   resto do texto quebra normalmente. Como o texto vem do CMS, a regra precisa
   valer para qualquer palavra, não só para a marca.

   Os pedaços alternam texto e <span>, nunca dois textos vizinhos: é o que
   mantém a hidratação estável (ver design-landing.md). */
export const SemQuebraNoHifen: React.FC<{ texto: string }> = ({ texto }) => {
  const partes = texto.split(/(\S+-\S+)/)
  if (partes.length === 1) return <>{texto}</>
  return (
    <>
      {partes.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} className="whitespace-nowrap">
            {p}
          </span>
        ) : (
          p && <React.Fragment key={i}>{p}</React.Fragment>
        ),
      )}
    </>
  )
}
