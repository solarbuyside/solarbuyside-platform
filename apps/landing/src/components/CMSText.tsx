import React from 'react'

const ALLOWED_CMS_CLASSES = [
  'cms-orange',
  'cms-blue',
  'cms-gradient-blue',
  'cms-gradient-orange',
  'cms-bold',
  // Peso 600: destaque mais leve que o cms-bold (700), pedido para a subfrase
  // do Hero, onde o negrito cheio ficava pesado demais.
  'cms-semibold',
]

function sanitizeCmsHtml(html: string): string {
  return html.replace(/<[^>]+>/g, (tag) => {
    if (/^<br\s*\/?>$/i.test(tag)) return tag
    if (/^<\/span>$/i.test(tag)) return tag
    const spanMatch = tag.match(/^<span\s+class="([^"<>]*)"\s*>$/i)
    if (spanMatch) {
      const classes = spanMatch[1]
        .trim()
        .split(/\s+/)
        .filter((c: string) => ALLOWED_CMS_CLASSES.includes(c))
      if (classes.length > 0) return `<span class="${classes.join(' ')}">`
    }
    return ''
  })
}

export const CMSText: React.FC<{ value: string }> = ({ value }) => {
  if (!value) return null
  if (!value.includes('<')) return <>{value}</>
  return <span dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(value) }} />
}
