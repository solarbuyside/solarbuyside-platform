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

export function validatePassword(value: string): {
  ok: boolean;
  failed: string[];
} {
  const failed = passwordRules.filter((r) => !r.test(value)).map((r) => r.id);
  return { ok: failed.length === 0, failed };
}
