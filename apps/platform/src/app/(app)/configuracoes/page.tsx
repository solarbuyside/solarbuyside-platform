import { redirect } from "next/navigation";

import { getCurrentUser, getProfileDetails } from "@/lib/auth/current-user";
import { SettingsForm } from "./settings-form";

export default async function ConfiguracoesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getProfileDetails();

  return (
    <div className="space-y-5 md:space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-5 md:pb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Configurações</h2>
        <p className="mt-1 text-sm text-slate-500">Edite seus dados de perfil e gerencie sua conta.</p>
      </div>

      <SettingsForm
        email={user.email}
        isAdmin={user.isAdmin}
        roleLabel={
          user.role === "admin" ? "Administrador" : user.role === "writer" ? "Editor" : "Comprador"
        }
        initialFullName={profile?.fullName ?? user.fullName}
        initialPhone={profile?.phone ?? null}
      />
    </div>
  );
}
