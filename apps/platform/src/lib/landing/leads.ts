import { createAdminClient } from "@/lib/supabase/admin";

/** Leitura dos leads da landing (newsletter + ebook). Server-only. */

export type NewsletterLead = { email: string; createdAt: string };
export type EbookLead = {
  nome: string | null;
  sobrenome: string | null;
  email: string;
  celular: string | null;
  createdAt: string;
};

export type LeadsOverview = {
  newsletterCount: number;
  ebookCount: number;
  newsletter: NewsletterLead[];
  ebook: EbookLead[];
};

export async function getLeadsOverview(): Promise<LeadsOverview> {
  const admin = createAdminClient();
  const [nlHead, ebHead, nlRows, ebRows] = await Promise.all([
    admin.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
    admin.from("ebook_leads").select("*", { count: "exact", head: true }),
    admin
      .from("newsletter_subscribers")
      .select("email,created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    admin
      .from("ebook_leads")
      .select("nome,sobrenome,email,celular,created_at")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  return {
    newsletterCount: nlHead.count ?? 0,
    ebookCount: ebHead.count ?? 0,
    newsletter: (nlRows.data ?? []).map((r) => ({ email: r.email, createdAt: r.created_at })),
    ebook: (ebRows.data ?? []).map((r) => ({
      nome: r.nome,
      sobrenome: r.sobrenome,
      email: r.email,
      celular: r.celular,
      createdAt: r.created_at,
    })),
  };
}
