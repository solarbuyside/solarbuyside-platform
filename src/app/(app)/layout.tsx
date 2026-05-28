"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSpreadsheet,
  History,
  Lightbulb,
  Zap,
  Menu,
  X,
  User,
  Bell,
  SunDim
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menuItems: SidebarItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Avaliações", href: "/avaliacoes", icon: FileSpreadsheet },
  { name: "Histórico", href: "/historico", icon: History },
  { name: "Dicas & Guias", href: "/dicas", icon: Lightbulb },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Premium Sidebar (Large screens) */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 glass-panel-sidebar fixed h-screen z-20">
        {/* Brand logo & tagline */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-border/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shadow-[0_0_12px_rgba(249,115,22,0.15)]">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg tracking-tight leading-none">
              Solar Buy-Side
            </h1>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1 block">
              SaaS Platform
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-4 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href) || (pathname === "/" && item.href === "/dashboard");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 h-11 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "text-white bg-white/[0.03]"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.015]"
                )}
              >
                {/* Active Left Accent Bar from design.md */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-md bg-primary shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                )}
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info Footer in Sidebar */}
        <div className="p-4 border-t border-border/30 bg-slate-950/20">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300 font-semibold text-sm">
              GB
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate leading-none">
                Gabriel Barbosa
              </p>
              <span className="text-xs text-slate-400 truncate mt-1 block">
                Comprador Solar
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navigation */}
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

      {/* Mobile Menu Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-20"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "md:hidden fixed top-16 bottom-0 left-0 w-64 bg-[#050d24] border-r border-border/40 z-25 transition-transform duration-300 ease-in-out z-25",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="py-6 px-4 space-y-1.5 h-full flex flex-col justify-between">
          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.href) || (pathname === "/" && item.href === "/dashboard");
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 h-11 rounded-lg text-sm font-medium transition-all duration-200 relative",
                    isActive
                      ? "text-white bg-white/[0.03]"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.015]"
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

          <div className="border-t border-border/30 pt-4 pb-2">
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-semibold text-xs">
                GB
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">Gabriel Barbosa</p>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Comprador</span>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Page Content Layout wrapper */}
      <div className="flex-1 flex flex-col md:pl-64 pt-16 md:pt-0 min-w-0">
        {/* Header Component from design.md */}
        <header className="h-20 glass-panel-header flex items-center justify-between px-6 md:px-10 sticky top-0 z-10 hidden md:flex">
          {/* Quick search input */}
          <div className="relative w-72">
            <SunDim className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <div className="pl-9 pr-4 py-1.5 h-10 w-full rounded-lg bg-slate-100 border border-border text-sm text-slate-700 focus-within:border-primary/50 transition-all flex items-center gap-2">
              <span className="text-xs text-slate-500">Escopo da Avaliação Solar</span>
            </div>
          </div>

          {/* Quick profile / status actions */}
          <div className="flex items-center gap-4">
            <button className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-100 border border-border text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
            </button>

            <div className="h-px w-6 bg-border/60" />

            <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg">
              <User className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                SaaS Solar - Ativo
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
