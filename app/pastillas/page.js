import Link from "next/link";
import { Pill, ShieldAlert, FileDown, RefreshCw } from "lucide-react";
import Shell, { Card, Badge } from "@/components/Shell";
import SubmitButton from "@/components/SubmitButton";
import ScanPrescription from "@/components/ScanPrescription";
import { getMedicationsToday, getSenior } from "@/lib/data";
import { confirmDose, undoDose, restock } from "../actions";
import { hour12, timeOf } from "@/lib/format";

export default async function PastillasPage() {
  const [senior, meds] = await Promise.all([getSenior(), getMedicationsToday()]);
  const lowStock = meds.filter((m) => m.stock_days <= 5);

  return (
    <Shell title="Adherencia y Pastillas" subtitle={`Control de medicamentos de ${senior.nickname}`}>
      <ScanPrescription />

      {lowStock.map((m) => (
        <div key={`stock-${m.id}`} role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-danger bg-danger-soft p-3">
          <ShieldAlert aria-hidden className="shrink-0 text-danger" />
          <p className="flex-1 text-base font-bold text-danger">
            {m.name}: quedan {m.stock_days} {m.stock_days === 1 ? "día" : "días"}
          </p>
          <form action={restock} className="w-full">
            <input type="hidden" name="medicationId" value={m.id} />
            <SubmitButton className="w-full bg-danger text-white" pendingText="Solicitando…">
              <RefreshCw aria-hidden size={20} /> Reabastecer 30 pastillas
            </SubmitButton>
          </form>
        </div>
      ))}

      {meds.map((m) => {
        const taken = Boolean(m.taken_at);
        return (
          <Card key={m.id}>
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-100 text-navy-900">
                <Pill aria-hidden />
              </span>
              <div className="flex-1">
                <p className="text-lg font-bold">
                  {m.name} {m.dose}
                </p>
                <p className="text-base text-muted">{m.frequency}</p>
              </div>
              <Badge tone={taken ? "ok" : m.minutes_late > 0 ? "warn" : "navy"}>
                {taken ? "Tomada" : m.minutes_late > 0 ? "Pendiente" : "Activo"}
              </Badge>
            </div>

            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-xl bg-surface p-3 text-base">
              <dt className="font-bold text-muted">Horario</dt>
              <dd>{hour12(m.time)}</dd>
              {m.description && (
                <>
                  <dt className="font-bold text-muted">Para qué</dt>
                  <dd>{m.description}</dd>
                </>
              )}
              {m.instructions && (
                <>
                  <dt className="font-bold text-muted">Indicación</dt>
                  <dd>{m.instructions}</dd>
                </>
              )}
              <dt className="font-bold text-muted">Stock</dt>
              <dd className={m.stock_days <= 5 ? "font-bold text-danger" : ""}>
                {m.stock_units} pastillas ({m.stock_days} días)
              </dd>
            </dl>

            <form action={taken ? undoDose : confirmDose} className="mt-3 flex items-center justify-between gap-3">
              <input type="hidden" name="medicationId" value={m.id} />
              <input type="hidden" name="by" value="Carla" />
              <div>
                <p className="text-base font-bold">Toma de hoy · {hour12(m.time)}</p>
                <p className={`text-sm ${taken ? "font-bold text-ok" : "text-muted"}`}>
                  {taken ? `✓ Tomada por ${m.confirmed_by} a las ${timeOf(m.taken_at)}` : "Aún no confirmada"}
                </p>
              </div>
              <button
                type="submit"
                role="switch"
                aria-checked={taken}
                aria-label={`Toma de ${m.name} de hoy`}
                className={`relative h-10 w-[4.5rem] shrink-0 rounded-full transition ${taken ? "bg-ok" : "bg-line"}`}
              >
                <span
                  className={`absolute top-1 left-1 h-8 w-8 rounded-full bg-white shadow transition ${taken ? "translate-x-8" : ""}`}
                />
              </button>
            </form>
          </Card>
        );
      })}

      <Card>
        <h2 className="text-lg font-bold text-navy-900">Reporte de adherencia</h2>
        <p className="mt-1 text-base text-muted">
          Genera el historial de tomas de los últimos 14 días para presentarlo en la próxima cita médica de {senior.nickname}.
        </p>
        <Link
          href="/reporte"
          className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 text-base font-bold text-white"
        >
          <FileDown aria-hidden /> Exportar reporte en PDF
        </Link>
      </Card>
    </Shell>
  );
}
