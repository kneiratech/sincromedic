"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Link2, CalendarDays, Wallet, Heart, Activity } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Familia", Icon: Users },
  { href: "/pastillas", label: "Pastillas", Icon: Link2 },
  { href: "/citas", label: "Citas", Icon: CalendarDays },
  { href: "/finanzas", label: "Finanzas", Icon: Wallet },
  { href: "/senior", label: "Papá", Icon: Heart },
  { href: "/servicios", label: "Servicios", Icon: Activity },
];

export default function BottomNav({ dark = false }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegación principal"
      className={`fixed inset-x-0 bottom-0 z-30 border-t ${
        dark ? "border-white/20 bg-navy-950" : "border-line bg-white"
      }`}
    >
      <ul className="mx-auto grid max-w-md grid-cols-6">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          const color = dark
            ? active ? "text-white" : "text-white/75"
            : active ? "text-navy-900" : "text-muted";
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 py-2 ${color}`}
              >
                <span
                  className={`flex h-8 w-11 items-center justify-center rounded-full ${
                    active ? (dark ? "bg-white/15" : "bg-navy-100") : ""
                  }`}
                >
                  <Icon aria-hidden size={22} strokeWidth={active ? 2.6 : 2} />
                </span>
                <span className={`text-[0.72rem] leading-none ${active ? "font-bold" : "font-medium"}`}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
