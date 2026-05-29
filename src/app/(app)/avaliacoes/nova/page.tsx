import { listSavedCompanies } from "@/lib/comparisons/saved-companies";
import { NovaForm, type SavedCompanyOption } from "./nova-form";

export default async function NovaAvaliacaoPage() {
  const saved = await listSavedCompanies().catch(() => []);
  const savedCompanies: SavedCompanyOption[] = saved.map((s) => ({
    id: s.id,
    companyName: s.companyName,
  }));

  return <NovaForm savedCompanies={savedCompanies} />;
}
