"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getDashboardLabel } from "@/lib/format";
import { getDashboardRoute } from "@/lib/routes";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const publicNav = [
  { href: "/incidents", label: "Public incidents" },
  { href: "/about", label: "About" },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    ...publicNav,
    ...(isAuthenticated && user
      ? [{ href: getDashboardRoute(user.role), label: getDashboardLabel(user.role) }]
      : []),
  ];

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-6 px-4 md:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-white">
            USJ
          </span>
          <span className="min-w-0">
            <span className="block truncate font-serif text-sm leading-tight text-text-secondary">
              University of Sri Jayewardenepura
            </span>
            <span className="block truncate text-sm font-medium text-foreground">
              Incident Reporting
            </span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`text-sm transition-colors hover:text-foreground ${
                  isActive ? "font-medium text-foreground" : "text-text-secondary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <NotificationBell />
              <span className="hidden text-sm text-text-secondary md:inline">{user.name}</span>
              <button
                type="button"
                onClick={logout}
                className="text-sm font-medium text-primary hover:text-primary-dark"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              Sign in
            </Link>
          )}

          <button
            type="button"
            className="inline-flex h-11 items-center rounded-md border border-border px-3 text-sm font-medium md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Close menu" : "Menu"}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="border-t border-border bg-surface px-4 py-4 md:hidden"
        >
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {!isAuthenticated ? (
              <Link href="/register" className="text-sm text-foreground" onClick={() => setMenuOpen(false)}>
                Create student account
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
