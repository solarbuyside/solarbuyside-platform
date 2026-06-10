/**
 * Sanitiza o texto de um bloco legal para render seguro com
 * dangerouslySetInnerHTML. Só sobrevive <strong> e <em> (sem atributos);
 * qualquer outra tag/atributo é removida. O editor (/admin/legal) grava o
 * innerHTML do contentEditable; a sanitização aqui é a barreira anti-XSS.
 */
export function sanitizeRichText(input: string): string {
  if (!input) return "";
  return input.replace(/<\/?[a-zA-Z][^>]*>/g, (tag) => {
    const m = tag.match(/^<\/?\s*([a-zA-Z]+)/);
    const name = m ? m[1].toLowerCase() : "";
    const isClose = tag.startsWith("</");
    if (name === "strong" || name === "b") return isClose ? "</strong>" : "<strong>";
    if (name === "em" || name === "i") return isClose ? "</em>" : "<em>";
    if (name === "br") return " ";
    return ""; // remove qualquer outra tag (e atributos)
  });
}
