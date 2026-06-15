import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current-user";
import { listManagedUsers } from "@/lib/admin/users";
import { UsersManager } from "./users-manager";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) notFound();

  const users = await listManagedUsers();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-6">
        <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/admin" className="inline-flex items-center gap-1 hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" />
            Admin
          </Link>
          <span>/</span>
          <span className="text-slate-600">Usuários</span>
        </div>
        <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
          <Users className="h-7 w-7 text-primary" />
          Usuários
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Edite os dados, bloqueie o acesso ou remova contas da plataforma.{" "}
          {user.role === "writer"
            ? "Como editor, você tem acesso completo — exceto remover ou bloquear um administrador."
            : "Como administrador, você gerencia todas as contas."}
        </p>
      </div>

      <UsersManager users={users} currentUserId={user.id} currentUserRole={user.role} />
    </div>
  );
}
