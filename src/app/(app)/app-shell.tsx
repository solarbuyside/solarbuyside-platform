"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileSpreadsheet,
  History,
  Lightbulb,
  GraduationCap,
  ShieldCheck,
  Zap,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
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

const BASE_ITEMS: SidebarItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Avaliações", href: "/avaliacoes", icon: FileSpreadsheet },
  { name: "Curso", href: "/curso", icon: GraduationCap },
  { name: "Histórico", href: "/historico", icon: History },
  { name: "Dicas & Guias", href: "/dicas", icon: Lightbulb },
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
  children,
}: {
  user: AppShellUser;
  searchItems: SearchItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const menuItems = React.useMemo(() => {
    const items = [...BASE_ITEMS];
    if (user.isAdmin) {
      items.push({ name: "Admin", href: "/admin", icon: ShieldCheck });
    }
    return items;
  }, [user.isAdmin]);

  const displayName = user.fullName ?? user.email ?? "Usuário";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 glass-panel-sidebar fixed h-screen z-20">
        <div className="flex items-center gap-3 px-6 h-20 border-b border-border/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shadow-[0_0_12px_rgba(249,115,22,0.15)]">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg tracking-tight leading-none">Solar Buy-Side</h1>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1 block">
              SaaS Platform
            </span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1.5">
          {menuItems.map((item) => {
            const isActive =
              pathname.startsWith(item.href) || (pathname === "/" && item.href === "/dashboard");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 h-11 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                  isActive ? "text-white bg-white/[0.03]" : "text-slate-400 hover:text-white hover:bg-white/[0.015]",
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-md bg-primary shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                )}
                <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-200")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/30 bg-slate-950/20">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300 font-semibold text-sm">
              {initials(user.fullName, user.email)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate leading-none">{displayName}</p>
              <span className="text-xs text-slate-400 truncate mt-1 block">
                {user.isAdmin ? "Administrador" : "Comprador Solar"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass-panel-sidebar border-b border-border/30 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
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
      <div className="flex-1 flex flex-col md:pl-64 pt-16 md:pt-0 min-w-0">
        <header className="h-20 glass-panel-header flex items-center justify-between px-6 md:px-10 sticky top-0 z-10 hidden md:flex">
          <GlobalSearch items={searchItems} />

          <div className="flex items-center gap-4">
            <button className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-100 border border-border text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
            </button>

            <div className="h-px w-6 bg-border/60" />

            <UserMenu user={user} displayName={displayName} />
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

function GlobalSearch({ items }: { items: SearchItem[] }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.competitors.some((c) => c.toLowerCase().includes(q)),
      )
      .slice(0, 6);
  }, [query, items]);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(id: string) {
    setOpen(false);
    setQuery("");
    router.push(`/avaliacoes/${id}/comparativo`);
  }

  return (
    <div ref={containerRef} className="relative w-72">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar avaliações ou fornecedores…"
        className="pl-9 pr-4 h-10 w-full rounded-lg bg-slate-100 border border-border text-sm text-slate-700 placeholder-slate-400 outline-none focus-within:border-primary/50 focus:border-primary/50 transition-all"
      />
      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-xs text-slate-400">Nenhuma avaliação encontrada.</p>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
              >
                <span className="text-sm font-semibold text-slate-800">{item.title}</span>
                {item.competitors.length > 0 && (
                  <span className="truncate text-[11px] text-slate-400">
                    {item.competitors.join(" · ")}
                  </span>
                )}
              </button>
            ))
          )}
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
        className="flex items-center gap-2.5 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 transition-colors hover:bg-primary/15"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
          {initials(user.fullName, user.email)}
        </span>
        <span className="hidden lg:block max-w-[120px] truncate text-xs font-semibold text-primary">
          {displayName}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-primary transition-transform", open && "rotate-180")} />
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
