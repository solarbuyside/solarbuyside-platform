/**
 * Resolve o caminho de uma imagem da landing para exibir no /admin.
 *
 * As imagens da LP são servidas pelo próprio site (`/assets/apoiadores/x.png`),
 * mas o painel roda em outro domínio: um caminho relativo aponta para a
 * plataforma, onde o arquivo não existe, e o preview quebra. Só o que já é URL
 * absoluta (o que sobe pelo upload, que vai para o Supabase Storage) passa
 * direto.
 */
export const LANDING_ORIGIN = "https://solarbuyside.com.br";

export function previewSrc(src: string): string {
  const v = src.trim();
  if (!v) return v;
  if (/^(https?:|data:|blob:)/i.test(v)) return v;
  return `${LANDING_ORIGIN}${v.startsWith("/") ? "" : "/"}${v}`;
}
