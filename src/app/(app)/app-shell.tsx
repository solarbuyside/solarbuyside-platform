"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileSpreadsheet,
  History,
  Lightbulb,
  ShieldCheck,
  BookOpen,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/app/(auth)/actions";

type SidebarItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type AppShellUser = {
  fullName: string | null;
  email: string | null;
  isAdmin: boolean;
};

export type SearchItem = {
  id: string;
  title: string;
  competitors: string[];
};

export type ManualChapterItem = {
  title: string;
  page: number;
};

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  at: string;
};

const BASE_ITEMS: SidebarItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Avaliações", href: "/avaliacoes", icon: FileSpreadsheet },
  // Curadoria e Curso ocultos da navegação por enquanto (rotas mantidas, não apagadas).
  { name: "Histórico", href: "/historico", icon: History },
  { name: "Guias", href: "/dicas", icon: Lightbulb },
];

function initials(name: string | null, email: string | null) {
  const base = name ?? email ?? "U";
  const parts = base.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

export function AppShell({
  user,
  searchItems,
  manualChapters,
  notifications,
  children,
}: {
  user: AppShellUser;
  searchItems: SearchItem[];
  manualChapters: ManualChapterItem[];
  notifications: NotificationItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  // Admin lives in the header (not the sidebar) — see header actions below.
  const menuItems = BASE_ITEMS;

  const displayName = user.fullName ?? user.email ?? "Usuário";
  const breadcrumb = breadcrumbFor(pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar (desktop) — flex item (not fixed), full height, no padding hack */}
      <aside
        className={cn(
          "hidden md:flex flex-col shrink-0 glass-panel-sidebar h-screen z-20 transition-[width] duration-200",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <div
          className={cn(
            "relative flex items-center gap-3 h-20 border-b border-white/5",
            collapsed ? "justify-center px-2" : "px-6",
          )}
        >
          <Image
            src="/LOGOSOLARBUYSIDE3.png"
            alt="Solar Buy-Side"
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 object-contain"
          />
          {!collapsed && (
            <div>
              <h1 className="font-bold text-white text-lg tracking-tight leading-none">Solar Buy-Side</h1>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1 block">
                Plataforma SaaS
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1.5">
          {/* Destaque sutil: Manual Solar Buy-Side — card escuro com accent
              laranja (não compete com os CTAs laranja sólidos do conteúdo). */}
          <Link
            href="/manual"
            title={collapsed ? "Manual Solar Buy-Side" : undefined}
            className={cn(
              "group relative mb-3 flex items-center gap-3 rounded-xl border transition-all duration-200",
              collapsed ? "h-11 justify-center px-0" : "px-3 py-2.5",
              pathname.startsWith("/manual")
                ? "border-primary/40 bg-primary/10"
                : "border-white/10 bg-white/[0.03] hover:border-primary/30 hover:bg-white/[0.05]",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                pathname.startsWith("/manual")
                  ? "bg-primary text-white"
                  : "bg-primary/15 text-primary group-hover:bg-primary/25",
              )}
            >
              <BookOpen className="h-4 w-4" />
            </span>
            {!collapsed && (
              <span className="flex min-w-0 flex-col">
                <span className="text-[13px] font-bold leading-tight text-white">Manual Solar Buy-Side</span>
                <span className="text-[10px] font-medium text-slate-400">Guia de compra completo</span>
              </span>
            )}
          </Link>

          {menuItems.map((item) => {
            const isActive =
              pathname.startsWith(item.href) || (pathname === "/" && item.href === "/dashboard");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={cn(
                  "flex items-center gap-3 h-11 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                  collapsed ? "justify-center px-0" : "px-4",
                  isActive ? "text-white bg-white/[0.03]" : "text-slate-400 hover:text-white hover:bg-white/[0.015]",
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-md bg-primary shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                )}
                <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-200")} />
                {!collapsed && item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className={cn("flex items-center gap-3 py-1.5", collapsed ? "justify-center px-0" : "px-2")}>
            <div className="h-9 w-9 shrink-0 rounded-full bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300 font-semibold text-sm">
              {initials(user.fullName, user.email)}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate leading-none">{displayName}</p>
                <span className="text-xs text-slate-400 truncate mt-1 block">
                  {user.isAdmin ? "Administrador" : "Comprador Solar"}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass-panel-sidebar border-b border-border/30 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-2">
          <Image
            src="/LOGOSOLARBUYSIDE3.png"
            alt="Solar Buy-Side"
            width={24}
            height={24}
            className="h-6 w-6 object-contain"
          />
          <span className="font-bold text-white text-base">Solar Buy-Side</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-20" />
      )}

      <aside
        className={cn(
          "md:hidden fixed top-16 bottom-0 left-0 w-64 bg-[#050d24] border-r border-border/40 z-25 transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <nav className="py-6 px-4 space-y-1.5 h-full flex flex-col justify-between">
          <div className="space-y-1.5">
            <Link
              href="/manual"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group relative mb-3 flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200",
                pathname.startsWith("/manual")
                  ? "border-primary/40 bg-primary/10"
                  : "border-white/10 bg-white/[0.03] hover:border-primary/30 hover:bg-white/[0.05]",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  pathname.startsWith("/manual") ? "bg-primary text-white" : "bg-primary/15 text-primary",
                )}
              >
                <BookOpen className="h-4 w-4" />
              </span>
              <span className="flex flex-col">
                <span className="text-[13px] font-bold leading-tight text-white">Manual Solar Buy-Side</span>
                <span className="text-[10px] font-medium text-slate-400">Guia de compra completo</span>
              </span>
            </Link>
            {menuItems.map((item) => {
              const isActive =
                pathname.startsWith(item.href) || (pathname === "/" && item.href === "/dashboard");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 h-11 rounded-lg text-sm font-medium transition-all duration-200 relative",
                    isActive ? "text-white bg-white/[0.03]" : "text-slate-400 hover:text-white hover:bg-white/[0.015]",
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-md bg-primary shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                  )}
                  <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-slate-400")} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Content */}
      <div className="flex h-screen flex-1 flex-col pt-16 md:pt-0 min-w-0">

        <header className="h-20 glass-panel-header sticky top-0 z-10 hidden md:flex items-center gap-4 px-6 md:px-8">
          {/* Left: toggle + breadcrumb */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expandir menu" : "Retrair menu"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>

          <nav className="flex items-center gap-1.5 text-sm font-medium text-slate-400 min-w-0">
            {breadcrumb.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-slate-300">/</span>}
                <span className={cn("truncate", i === breadcrumb.length - 1 && "font-semibold text-slate-700")}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>

          {/* Right: search + actions, pushed to the edge */}
          <div className="ml-auto flex items-center gap-2">
            <GlobalSearch items={searchItems} manualChapters={manualChapters} />
            {user.isAdmin && (
              <Link
                href="/admin"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-colors hover:border-primary/40 hover:text-primary"
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden lg:inline">Admin</span>
              </Link>
            )}
            <Link
              href="/manual"
              title="Manual Solar Buy-Side"
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
                pathname.startsWith("/manual")
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary",
              )}
            >
              <BookOpen className="h-4 w-4" />
            </Link>
            <NotificationsBell notifications={notifications} />
            <UserMenu user={user} displayName={displayName} />
          </div>
        </header>

        {/* Scrollable content area — sidebar stays full-height alongside */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-[1600px] p-6 md:px-10 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function breadcrumbFor(pathname: string): string[] {
  const LABELS: Record<string, string> = {
    dashboard: "Dashboard",
    avaliacoes: "Avaliações",
    nova: "Nova",
    preencher: "Preenchimento",
    comparativo: "Comparativo",
    finalistas: "Finalistas",
    curso: "Curso",
    curadoria: "Curadoria",
    historico: "Histórico",
    dicas: "Guias",
    manual: "Manual Solar Buy-Side",
    configuracoes: "Configurações",
    admin: "Admin",
  };
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return ["Dashboard"];
  const crumbs: string[] = [];
  for (const part of parts) {
    // Skip ids (uuids / long tokens); keep readable segment labels.
    if (LABELS[part]) crumbs.push(LABELS[part]);
  }
  return crumbs.length > 0 ? crumbs : ["Dashboard"];
}

// Busca tolerante a acentos.
function normalizeSearch(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function GlobalSearch({
  items,
  manualChapters,
}: {
  items: SearchItem[];
  manualChapters: ManualChapterItem[];
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { evals, chapters } = React.useMemo(() => {
    const q = normalizeSearch(query.trim());
    if (!q) return { evals: [], chapters: [] };
    const evals = items
      .filter(
        (item) =>
          normalizeSearch(item.title).includes(q) ||
          item.competitors.some((c) => normalizeSearch(c).includes(q)),
      )
      .slice(0, 5);
    const chapters = manualChapters
      .filter((ch) => normalizeSearch(ch.title).includes(q))
      .slice(0, 6);
    return { evals, chapters };
  }, [query, items, manualChapters]);

  const hasResults = evals.length > 0 || chapters.length > 0;

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function goEval(id: string) {
    setOpen(false);
    setQuery("");
    router.push(`/avaliacoes/${id}/comparativo`);
  }

  function goChapter(page: number) {
    setOpen(false);
    setQuery("");
    router.push(`/manual?page=${page}`);
  }

  return (
    <div ref={containerRef} className="relative w-80">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar avaliações ou capítulos do manual…"
        className="pl-9 pr-4 h-10 w-full rounded-lg bg-slate-100 border border-border text-sm text-slate-700 placeholder-slate-400 outline-none focus-within:border-primary/50 focus:border-primary/50 transition-all"
      />
      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-12 z-50 max-h-[70vh] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl">
          {!hasResults && (
            <p className="px-4 py-3 text-xs text-slate-400">Nada encontrado.</p>
          )}

          {evals.length > 0 && (
            <div>
              <p className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Avaliações
              </p>
              {evals.map((item) => (
                <button
                  key={item.id}
                  onClick={() => goEval(item.id)}
                  className="flex w-full items-start gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                >
                  <FileSpreadsheet className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold text-slate-800">{item.title}</span>
                    {item.competitors.length > 0 && (
                      <span className="truncate text-[11px] text-slate-400">
                        {item.competitors.join(" · ")}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}

          {chapters.length > 0 && (
            <div>
              {evals.length > 0 && <div className="my-1 border-t border-slate-100" />}
              <p className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Manual Solar Buy-Side
              </p>
              {chapters.map((ch, i) => (
                <button
                  key={`${ch.page}-${i}`}
                  onClick={() => goChapter(ch.page)}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-primary/5"
                >
                  <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                    {ch.title}
                  </span>
                  <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                    p. {ch.page}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationsBell({ notifications }: { notifications: NotificationItem[] }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const hasUnread = notifications.length > 0;

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
      >
        <Bell className="h-4 w-4" />
        {hasUnread && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-bold text-slate-800">Notificações</p>
            {hasUnread && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                {notifications.length}
              </span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="mx-auto h-7 w-7 text-slate-200" />
                <p className="mt-2 text-xs text-slate-400">Sem notificações no momento.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="border-b border-slate-50 px-4 py-3 last:border-0 hover:bg-slate-50">
                  <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{n.description}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{n.at}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function UserMenu({ user, displayName }: { user: AppShellUser; displayName: string }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 transition-colors hover:bg-slate-50"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-[11px] font-bold text-white">
          {initials(user.fullName, user.email)}
        </span>
        <span className="hidden lg:block max-w-[120px] truncate text-xs font-semibold text-slate-700">
          {displayName}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in zoom-in-95">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-800">{displayName}</p>
            {user.email && <p className="truncate text-xs text-slate-400">{user.email}</p>}
          </div>
          <div className="p-1.5">
            <Link
              href="/configuracoes"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              Configurações
            </Link>
            {user.isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                Painel Admin
              </Link>
            )}
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
