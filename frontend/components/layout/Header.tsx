"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getDashboardLabel } from "@/lib/format";
import { getDashboardRoute } from "@/lib/routes";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const publicNav = [{ href: "/incidents", label: "Public incidents" }];

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

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-3 px-4 sm:h-[72px] sm:gap-6 md:px-6">
        <Link
          href="/"
          aria-label="USJ Incident Reporting home"
          className="flex min-w-0 items-center gap-2.5 no-underline hover:text-inherit sm:gap-3"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-white">
            USJ
          </span>
          <span className="min-w-0">
            <span className="hidden truncate font-serif text-sm leading-tight text-text-secondary sm:block">
              University of Sri Jayewardenepura
            </span>
            <span className="block truncate text-sm font-medium text-foreground">
              Incident Reporting
            </span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-4 lg:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex h-11 items-center text-sm no-underline transition-colors hover:text-foreground ${
                  isActive ? "font-medium text-foreground" : "text-text-secondary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {isAuthenticated && user ? (
            <>
              <NotificationBell onOpen={() => setMenuOpen(false)} />
              <span className="hidden max-w-[10rem] truncate text-sm text-text-secondary xl:inline">
                {user.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="hidden h-11 items-center px-2 text-sm font-medium text-primary hover:text-primary-dark lg:inline-flex"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="hidden h-11 items-center px-2 text-sm font-medium text-primary no-underline hover:text-primary-dark lg:inline-flex"
            >
              Sign in
            </Link>
          )}

          <button
            type="button"
            className="inline-flex h-11 min-w-11 items-center justify-center rounded-md border border-border px-3 text-sm font-medium lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="border-t border-border bg-surface px-4 py-3 lg:hidden"
        >
          <div className="mx-auto flex max-w-[1400px] flex-col">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center text-sm text-foreground no-underline"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {!isAuthenticated ? (
              <>
                <Link
                  href="/login"
                  className="flex min-h-11 items-center text-sm text-foreground no-underline"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="flex min-h-11 items-center text-sm text-foreground no-underline"
                  onClick={() => setMenuOpen(false)}
                >
                  Create student account
                </Link>
              </>
            ) : (
              <button
                type="button"
                className="flex min-h-11 items-center text-left text-sm font-medium text-primary"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
              >
                Sign out
              </button>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
