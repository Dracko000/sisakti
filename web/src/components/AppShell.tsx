"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/session";
import { NAV, ROLE_LABEL } from "@/lib/nav";
import { Icon } from "./Icon";
import { Mascot } from "./Mascot";
import { Avatar } from "./ui";
import { cn } from "@/lib/cn";
import type { Role } from "@/lib/types";

export function AppShell({
  role,
  title,
  subtitle,
  children,
}: {
  role: Role;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/");
    if (!loading && user && user.role !== role) router.replace(`/${user.role}`);
  }, [loading, user, role, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <Mascot size={64} className="animate-pulse" />
      </div>
    );
  }

  const items = NAV[role];

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-line bg-white md:flex">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-primary text-white">
            <Icon name="bookOpen" size={24} />
          </div>
          <div>
            <p className="font-display text-xl font-bold leading-none tracking-tight text-primary-dark">SiSAKTI</p>
            <p className="mt-1 text-[11px] font-medium text-muted">Ruang Belajar SIBI</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {items.map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active ? "bg-primary-50 font-bold text-primary-dark" : "font-medium text-muted hover:bg-sl-50",
                )}
              >
                {active && <span className="absolute left-0 h-5 w-1 rounded-full bg-primary" />}
                <Icon name={it.icon} size={20} className={active ? "text-primary-dark" : "text-muted"} />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="m-4 flex items-center gap-3 rounded-2xl bg-sl-50 p-3">
          <Avatar initials={user.initials} color={user.avatarColor} size={40} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-ink">{user.name}</p>
            <p className="truncate text-[11px] font-medium text-muted">{user.detail}</p>
          </div>
          <button onClick={logout} aria-label="Keluar" className="text-subtle hover:text-danger">
            <Icon name="logOut" size={18} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-[72px] items-center gap-4 border-b border-line bg-white/90 px-5 backdrop-blur md:px-8">
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl font-bold tracking-tight text-ink">{title}</h1>
            {subtitle && <p className="truncate text-xs font-medium text-muted">{subtitle}</p>}
          </div>
          <div className="ml-auto hidden items-center gap-3 md:flex">
            <div className="relative">
              <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
              <input
                placeholder="Cari buku, kelas, atau materi…"
                className="w-[300px] rounded-full bg-sl-50 py-2.5 pl-9 pr-4 text-sm text-ink outline-none placeholder:text-subtle focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button className="relative rounded-full p-2 text-text hover:bg-sl-50" aria-label="Notifikasi">
              <Icon name="bell" size={20} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-white" />
            </button>
            <button className="rounded-full p-2 text-text hover:bg-sl-50" aria-label="Pesan">
              <Icon name="messageCircle" size={20} />
            </button>
            <div className="flex items-center gap-2 pl-2">
              <div className="text-right">
                <p className="text-[13px] font-bold leading-none text-ink">{user.name}</p>
                <p className="mt-1 text-[11px] font-medium text-muted">{ROLE_LABEL[user.role]}</p>
              </div>
              <Avatar initials={user.initials} color="#ff9800" size={38} />
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
