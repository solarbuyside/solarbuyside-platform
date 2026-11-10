// Regras de senha compartilhadas entre cliente (checklist ao vivo no
// /update-password) e servidor (validação em updatePasswordAction). Fonte única
// para os dois lados não saírem de sincronia.

export type PasswordRule = {
  id: string;
  label: string;
  test: (value: string) => boolean;
};

export const passwordRules: PasswordRule[] = [
  { id: "len", label: "Pelo menos 8 caracteres", test: (v) => v.length >= 8 },
  { id: "upper", label: "Uma letra maiúscula", test: (v) => /[A-Z]/.test(v) },
  { id: "number", label: "Um número", test: (v) => /[0-9]/.test(v) },
  {
    id: "symbol",
    label: "Um símbolo (ex.: ! ? @ #)",
    // Qualquer caractere que não seja letra, número ou espaço.
    test: (v) => /[^A-Za-z0-9\s]/.test(v),
  },
];

// Sem caracteres que se confundem ao copiar de um e-mail (0/O, 1/l/I).
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnopqrstuvwxyz";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%&*?";

function randomIndex(max: number): number {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return buf[0] % max;
}

/**
 * Senha aleatória que sempre passa em todas as regras acima (o botão de
 * randomizar do cadastro de usuário no admin). Usa o crypto do navegador/Node.
 */
export function generatePassword(length = 12): string {
  const size = Math.max(8, length);
  const all = UPPER + LOWER + DIGITS + SYMBOLS;
  const chars = [
    UPPER[randomIndex(UPPER.length)],
    LOWER[randomIndex(LOWER.length)],
    DIGITS[randomIndex(DIGITS.length)],
    SYMBOLS[randomIndex(SYMBOLS.length)],
  ];
  while (chars.length < size) chars.push(all[randomIndex(all.length)]);
  // Embaralha (Fisher-Yates) para os obrigatórios não ficarem sempre no começo.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

export function validatePassword(value: string): {
  ok: boolean;
  failed: string[];
} {
  const failed = passwordRules.filter((r) => !r.test(value)).map((r) => r.id);
  return { ok: failed.length === 0, failed };
}
