"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Trash2,
  Lock,
  Unlock,
  X,
  Loader2,
  AlertTriangle,
  Search,
} from "lucide-react";

import { cn, formatDateBR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { ManagedUser } from "@/lib/admin/users";
import type { UserRole } from "@/lib/auth/current-user";
import {
  updateUserProfileAction,
  setUserBlockedAction,
  deleteUserAction,
} from "./actions";

const ROLE_BADGE: Record<UserRole, { label: string; variant: "orange" | "default" | "secondary" }> = {
  admin: { label: "Administrador", variant: "orange" },
  writer: { label: "Editor", variant: "default" },
  user: { label: "Comprador", variant: "secondary" },
};

function statusFor(u: ManagedUser): { label: string; variant: "destructive" | "warning" | "emerald" } {
  if (u.blocked) return { label: "Bloqueado", variant: "destructive" };
  if (u.accessExpiresAt && new Date(u.accessExpiresAt).getTime() < Date.now()) {
    return { label: "Expirado", variant: "warning" };
  }
  return { label: "Ativo", variant: "emerald" };
}

const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition-all hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/15";

export function UsersManager({
  users,
  currentUserId,
  currentUserRole,
}: {
  users: ManagedUser[];
  currentUserId: string;
  currentUserRole: UserRole;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [editing, setEditing] = React.useState<ManagedUser | null>(null);
  const [deleting, setDeleting] = React.useState<ManagedUser | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [rowError, setRowError] = React.useState<string | null>(null);

  const canManageAdmins = currentUserRole === "admin";

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.fullName ?? "").toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.companyName ?? "").toLowerCase().includes(q),
    );
  }, [users, query]);

  async function toggleBlock(u: ManagedUser) {
    setRowError(null);
    setBusyId(u.id);
    try {
      await setUserBlockedAction(u.id, !u.blocked);
      router.refresh();
    } catch (err) {
      setRowError(err instanceof Error ? err.message : "Erro ao atualizar acesso.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          <strong className="text-slate-800">{users.length}</strong>{" "}
          {users.length === 1 ? "conta" : "contas"}
        </p>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, e-mail ou empresa…"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          />
        </div>
      </div>

      {rowError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-sm font-medium text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {rowError}
        </div>
      )}

      <TableContainer className="bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Avaliações</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell className="text-slate-400" colSpan={6}>
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => {
                const role = ROLE_BADGE[u.role];
                const status = statusFor(u);
                const isSelf = u.id === currentUserId;
                const protectedAdmin = u.role === "admin" && !canManageAdmins;
                const busy = busyId === u.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">
                          {u.fullName ?? "—"}
                          {isSelf && (
                            <span className="ml-1.5 text-[11px] font-medium text-slate-400">(você)</span>
                          )}
                        </span>
                        <span className="text-xs text-slate-500">{u.email ?? "—"}</span>
                        {u.companyName && (
                          <span className="text-[11px] text-slate-400">{u.companyName}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.variant} className="text-[10px]">
                        {role.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className="text-[10px]">
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-slate-700">{u.comparisonCount}</TableCell>
                    <TableCell className="text-xs text-slate-500">{formatDateBR(u.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          title="Editar dados"
                          onClick={() => {
                            setRowError(null);
                            setEditing(u);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          title={
                            protectedAdmin
                              ? "Apenas um administrador pode bloquear um administrador"
                              : u.blocked
                                ? "Desbloquear acesso"
                                : "Bloquear acesso"
                          }
                          disabled={protectedAdmin || busy}
                          onClick={() => toggleBlock(u)}
                          className={u.blocked ? "text-amber-600 hover:bg-amber-50" : undefined}
                        >
                          {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : u.blocked ? (
                            <Unlock className="h-4 w-4" />
                          ) : (
                            <Lock className="h-4 w-4" />
                          )}
                        </IconButton>
                        <IconButton
                          title={
                            isSelf
                              ? "Você não pode remover a própria conta"
                              : protectedAdmin
                                ? "Apenas um administrador pode remover um administrador"
                                : "Remover conta"
                          }
                          disabled={isSelf || protectedAdmin}
                          onClick={() => {
                            setRowError(null);
                            setDeleting(u);
                          }}
                          className="text-destructive hover:bg-destructive/5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {editing && (
        <EditModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}

      {deleting && (
        <DeleteModal
          user={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function IconButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-500",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function EditModal({
  user,
  onClose,
  onSaved,
}: {
  user: ManagedUser;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [fullName, setFullName] = React.useState(user.fullName ?? "");
  const [companyName, setCompanyName] = React.useState(user.companyName ?? "");
  const [phone, setPhone] = React.useState(user.phone ?? "");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateUserProfileAction(user.id, { fullName, companyName, phone });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
      setSaving(false);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Editar usuário</h3>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        <Field label="Nome completo">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="Nome" />
        </Field>
        <Field label="Empresa">
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} placeholder="Empresa" />
        </Field>
        <Field label="Telefone">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className={inputClass} placeholder="(00) 00000-0000" />
        </Field>
      </div>

      {error && <p className="mt-4 text-sm font-medium text-destructive">{error}</p>}

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="inline-flex h-11 items-center rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/95 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </Overlay>
  );
}

function DeleteModal({
  user,
  onClose,
  onDeleted,
}: {
  user: ManagedUser;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await deleteUserAction(user.id);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover.");
      setDeleting(false);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Trash2 className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Remover usuário?</h3>
          <p className="mt-1 text-sm text-slate-500">
            A conta <strong className="text-slate-700">{user.email}</strong> e todos os dados
            associados (avaliações, comparativos) serão removidos permanentemente. Esta ação não
            pode ser desfeita.
          </p>
        </div>
      </div>

      {error && <p className="mt-4 text-sm font-medium text-destructive">{error}</p>}

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="inline-flex h-11 items-center rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-destructive px-6 text-sm font-bold text-destructive-foreground transition-all hover:bg-destructive/90 disabled:opacity-50"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          {deleting ? "Removendo…" : "Remover conta"}
        </button>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{label}</span>
      {children}
    </label>
  );
}
