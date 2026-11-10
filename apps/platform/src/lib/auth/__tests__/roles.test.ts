import { describe, expect, it } from "vitest";

import {
  assignableRoles,
  createRoleError,
  manageTargetError,
  roleChangeError,
  type RoleActor,
  type RoleTarget,
} from "../roles";
import { defaultRoleForEmail, resolveRole } from "../role-resolution";
import { generatePassword, validatePassword } from "../password-rules";
import { buildNewAccountEmail } from "../../email/brevo";

const francis: RoleActor = { id: "francis", role: "admin" };
const editor: RoleActor = { id: "editor", role: "writer" };
const buyer: RoleActor = { id: "buyer", role: "user" };

const t = (id: string, role: RoleTarget["role"], isProtected = false): RoleTarget => ({
  id,
  role,
  protected: isProtected,
});

describe("resolução do papel", () => {
  it("papel salvo no banco vence o padrão do código", () => {
    expect(resolveRole("francis_poloni@yahoo.com.br", "user")).toBe("user");
    expect(resolveRole("alguem@empresa.com", "writer")).toBe("writer");
  });

  it("sem papel salvo vale o mapa de staff, e o resto é comprador", () => {
    expect(resolveRole("francis_poloni@yahoo.com.br", null)).toBe("admin");
    expect(resolveRole("alguem@empresa.com", null)).toBe("user");
    expect(resolveRole(null, null)).toBe("user");
  });

  it("a conta do Gabriel ignora o banco e fica sempre no papel do código", () => {
    const fixed = defaultRoleForEmail("gab.feelix@gmail.com");
    expect(fixed).not.toBe("user");
    expect(resolveRole("gab.feelix@gmail.com", "user")).toBe(fixed);
    expect(resolveRole("  GAB.FEELIX@gmail.com ", "admin")).toBe(fixed);
  });
});

describe("troca de papel", () => {
  it("admin promove e rebaixa contas comuns", () => {
    expect(roleChangeError(francis, t("a", "user"), "admin")).toBeNull();
    expect(roleChangeError(francis, t("a", "admin"), "writer")).toBeNull();
  });

  it("ninguém troca o papel da conta protegida, nem o admin", () => {
    expect(roleChangeError(francis, t("gab", "writer", true), "user")).toMatch(/protegida/);
    expect(roleChangeError(francis, t("gab", "writer", true), "admin")).toMatch(/protegida/);
  });

  it("ninguém troca o próprio papel (evita se trancar fora)", () => {
    expect(roleChangeError(francis, t("francis", "admin"), "user")).toMatch(/próprio/);
  });

  it("editor não mexe em admin nem promove a admin", () => {
    expect(roleChangeError(editor, t("a", "admin"), "user")).toMatch(/administrador/);
    expect(roleChangeError(editor, t("a", "user"), "admin")).toMatch(/administrador/);
    expect(roleChangeError(editor, t("a", "user"), "writer")).toBeNull();
  });

  it("comprador não troca papel de ninguém", () => {
    expect(roleChangeError(buyer, t("a", "user"), "writer")).not.toBeNull();
  });
});

describe("bloquear/remover", () => {
  it("conta protegida não pode ser bloqueada nem removida", () => {
    expect(manageTargetError(francis, t("gab", "writer", true))).toMatch(/protegida/);
  });

  it("editor não mexe em admin; admin mexe em todos os não protegidos", () => {
    expect(manageTargetError(editor, t("a", "admin"))).not.toBeNull();
    expect(manageTargetError(editor, t("a", "user"))).toBeNull();
    expect(manageTargetError(francis, t("a", "admin"))).toBeNull();
  });
});

describe("criação de conta", () => {
  it("só admin cria admin", () => {
    expect(createRoleError("admin", "admin")).toBeNull();
    expect(createRoleError("writer", "admin")).not.toBeNull();
    expect(createRoleError("writer", "user")).toBeNull();
    expect(createRoleError("user", "user")).not.toBeNull();
  });

  it("o seletor só oferece o que o ator pode atribuir", () => {
    expect(assignableRoles("admin")).toEqual(["user", "writer", "admin"]);
    expect(assignableRoles("writer")).toEqual(["user", "writer"]);
    expect(assignableRoles("user")).toEqual([]);
  });
});

describe("senha aleatória", () => {
  it("sempre passa em todas as regras de senha", () => {
    for (let i = 0; i < 500; i++) {
      const pw = generatePassword(12);
      expect(pw).toHaveLength(12);
      expect(validatePassword(pw).ok).toBe(true);
    }
  });

  it("não usa caracteres que se confundem ao copiar", () => {
    for (let i = 0; i < 200; i++) expect(generatePassword(16)).not.toMatch(/[0O1lI]/);
  });
});

describe("e-mail de conta criada", () => {
  it("leva login, senha e link, com HTML escapado", () => {
    const { subject, htmlContent } = buildNewAccountEmail({
      name: "Maria <b>Silva</b>",
      email: "maria@empresa.com",
      password: "Ab3&<x>!",
      loginUrl: "https://plataforma.solarbuyside.com.br/login",
      roleLabel: "Comprador",
    });
    expect(subject).toMatch(/Solar Buy-Side/);
    expect(htmlContent).toContain("maria@empresa.com");
    expect(htmlContent).toContain("Ab3&amp;&lt;x&gt;!");
    expect(htmlContent).not.toContain("<b>Silva");
    expect(htmlContent).toContain('href="https://plataforma.solarbuyside.com.br/login"');
    expect(htmlContent).toContain("Comprador");
  });
});
