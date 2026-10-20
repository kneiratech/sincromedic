import { Pill, Shield, Stethoscope, FlaskConical, Banknote, CircleCheck } from "lucide-react";
import Shell, { Card, SectionTitle } from "@/components/Shell";
import SubmitButton from "@/components/SubmitButton";
import ExpenseModal from "@/components/ExpenseModal";
import { getFinanceSummary, getMembers, getSplitMode, getSenior } from "@/lib/data";
import { setSplitMode, settleDebt } from "../actions";
import { soles, shortDate, monthName, capitalize } from "@/lib/format";

const CAT_ICONS = { Farmacia: Pill, Seguro: Shield, Citas: Stethoscope, Exámenes: FlaskConical };

export default async function FinanzasPage() {
  const [senior, summary, members, mode] = await Promise.all([
    getSenior(),
    getFinanceSummary(),
    getMembers(),
    getSplitMode(),
  ]);

  return (
    <Shell title="Gastos Compartidos" subtitle={`Finanzas familiares del cuidado de ${senior.nickname}`}>
      <section className="rounded-2xl bg-navy-900 p-5 text-center text-white shadow">
        <p className="text-sm font-bold tracking-wide text-white/85 uppercase">Gasto total mensual en salud</p>
        <p className="mt-1 text-5xl font-bold">{soles(summary.total)}</p>
        <p className="mt-1 text-base text-white/90">Periodo: {capitalize(monthName())}</p>
      </section>

      <Card>
        <div role="group" aria-label="Método de división" className="grid grid-cols-2 gap-1 rounded-xl bg-surface p-1">
          {[["iguales", "Partes iguales"], ["personalizado", "Personalizado"]].map(([id, label]) => (
            <form key={id} action={setSplitMode}>
              <input type="hidden" name="mode" value={id} />
              <SubmitButton
                aria-pressed={mode === id}
                pendingText="…"
                className={`w-full ${mode === id ? "bg-navy-900 text-white shadow" : "bg-transparent text-muted"}`}
              >
                {label}
              </SubmitButton>
            </form>
          ))}
        </div>

        <ul className="mt-4 space-y-2">
          {summary.members.map((m) => (
            <li key={m.id} className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2 font-bold">
                <span aria-hidden className="h-4 w-4 rounded-full" style={{ background: m.color }} />
                {m.name}
              </span>
              <span>
                <strong>{m.pct}%</strong> <span className="text-muted">({soles(m.share)})</span>
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-base font-bold">Distribución entre hermanos</p>
        <div className="mt-2 flex h-5 overflow-hidden rounded-full" role="img" aria-label={summary.members.map((m) => `${m.name} ${m.pct}%`).join(", ")}>
          {summary.members.map((m) => (
            <span key={m.id} style={{ width: `${m.pct}%`, background: m.color }} />
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle>Saldos del periodo</SectionTitle>
        {summary.transfers.length === 0 ? (
          <p className="flex items-center gap-2 text-lg font-bold text-ok">
            <CircleCheck aria-hidden /> Todos están al día
          </p>
        ) : (
          <ul className="space-y-3">
            {summary.transfers.map((t) => (
              <li key={`${t.from.id}-${t.to.id}`} className="flex items-center gap-3 rounded-xl border-2 border-warn bg-warn-soft p-3">
                <Banknote aria-hidden className="shrink-0 text-warn" />
                <div className="flex-1">
                  <p className="text-base font-bold">Saldo pendiente</p>
                  <p className="text-base">
                    {t.from.name} debe transferir <strong>{soles(t.amount)}</strong> a {t.to.name}
                  </p>
                </div>
                <form action={settleDebt}>
                  <input type="hidden" name="from" value={t.from.id} />
                  <input type="hidden" name="to" value={t.to.id} />
                  <input type="hidden" name="amount" value={t.amount} />
                  <SubmitButton className="bg-navy-900 text-white" pendingText="…">Saldar</SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div>
        <SectionTitle>Categorías de gastos</SectionTitle>
        <ul className="grid grid-cols-2 gap-3">
          {summary.categories.map((c) => {
            const Icon = CAT_ICONS[c.name];
            return (
              <li key={c.name} className="rounded-2xl border border-line bg-white p-3 shadow-sm">
                <Icon aria-hidden className="text-navy-800" />
                <p className="mt-1 text-base font-bold">{c.name}</p>
                <p className="text-lg">{soles(c.total)}</p>
              </li>
            );
          })}
        </ul>
      </div>

      <Card>
        <SectionTitle>Historial de gastos</SectionTitle>
        <ul className="divide-y divide-line">
          {summary.expenses.map((e) => {
            const Icon = CAT_ICONS[e.category];
            return (
              <li key={e.id} className="flex items-center gap-3 py-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-100 text-navy-900">
                  <Icon aria-hidden />
                </span>
                <div className="flex-1">
                  <p className="text-base font-bold">
                    {e.category} — {e.description}
                  </p>
                  <p className="text-sm text-muted">
                    Pagado por {e.paid_by_name} · {shortDate(e.spent_on)}
                  </p>
                </div>
                <p className="text-base font-bold">{soles(e.amount)}</p>
              </li>
            );
          })}
        </ul>
      </Card>

      <ExpenseModal members={members} defaultSplit={mode} />
    </Shell>
  );
}
