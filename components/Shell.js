import { cookies } from "next/headers";
import BottomNav from "./BottomNav";
import TextSizeControl from "./TextSizeControl";
import { getSenior } from "@/lib/data";

export async function getTextSize() {
  const v = (await cookies()).get("text-size")?.value;
  return ["lg", "xl"].includes(v) ? v : "md";
}

export function Logo({ dark = false }) {
  return (
    <span className={`flex items-center gap-2 text-lg font-bold ${dark ? "text-white" : "text-navy-900"}`}>
      <span
        aria-hidden
        className={`flex h-8 w-8 items-center justify-center rounded-lg text-base ${
          dark ? "bg-white text-navy-900" : "bg-navy-900 text-white"
        }`}
      >
        +
      </span>
      SincroMedic
    </span>
  );
}

export function SeniorChip({ senior }) {
  return (
    <span className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pr-3 pl-1 text-sm font-bold text-navy-900">
      <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded-full bg-warn-soft text-xs font-bold text-warn">
        {senior.name[0]}
      </span>
      {senior.nickname}
    </span>
  );
}

// Estructura común de cada pantalla: cabecera + contenido + navegación inferior
export default async function Shell({ title, subtitle, children }) {
  const [senior, textSize] = await Promise.all([getSenior(), getTextSize()]);
  return (
    <div className="mx-auto min-h-screen max-w-md bg-surface pb-28">
      <header className="border-b border-line bg-white px-4 pt-3 pb-4">
        <div className="flex items-center justify-between gap-2">
          <Logo />
          <SeniorChip senior={senior} />
        </div>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl leading-tight font-bold text-navy-950">{title}</h1>
            {subtitle && <p className="mt-0.5 text-base text-muted">{subtitle}</p>}
          </div>
          <TextSizeControl initial={textSize} />
        </div>
      </header>
      <main className="space-y-5 px-4 pt-5">{children}</main>
      <BottomNav />
    </div>
  );
}

export function Card({ children, className = "" }) {
  return <section className={`rounded-2xl border border-line bg-white p-4 shadow-sm ${className}`}>{children}</section>;
}

export function SectionTitle({ children, action }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-base font-bold tracking-wide text-navy-900 uppercase">{children}</h2>
      {action}
    </div>
  );
}

export function Badge({ tone = "navy", children }) {
  const tones = {
    navy: "bg-navy-100 text-navy-900",
    ok: "bg-ok-soft text-ok",
    warn: "bg-warn-soft text-warn",
    danger: "bg-danger-soft text-danger",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}
