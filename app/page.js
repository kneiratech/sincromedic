import Link from "next/link";
import { Pill, Stethoscope, CalendarDays, ShoppingCart, TriangleAlert, CircleCheck, Info, ChevronRight, Check } from "lucide-react";
import Shell, { Card, SectionTitle, Badge } from "@/components/Shell";
import SubmitButton from "@/components/SubmitButton";
import { getSenior, getNextPendingDose, getAppointments, getCareTasks, getFeed } from "@/lib/data";
import { confirmDose, toggleTask } from "./actions";
import { hour12, longDate, timeOf, relativeTime, capitalize } from "@/lib/format";

export default async function DashboardPage() {
  const [senior, dose, appointments, tasks, feed] = await Promise.all([
    getSenior(),
    getNextPendingDose(),
    getAppointments(),
    getCareTasks(),
    getFeed(),
  ]);
  const nextAppt = appointments[0];

  return (
    <Shell title="Gestión Familiar" subtitle={`Cuidado de ${senior.nickname} (${senior.name}, ${senior.age})`}>
      {/* Tarjeta del adulto mayor */}
      <section className="flex items-center gap-4 rounded-2xl bg-navy-900 p-4 text-white shadow">
        <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-warn-soft text-2xl font-bold text-warn">
          {senior.name[0]}
        </span>
        <div>
          <p className="text-xl font-bold">
            {senior.nickname} ({senior.name}, {senior.age})
          </p>
          <p className="text-base text-white/90">Familia: Carla (referente) · Juan · Diego</p>
        </div>
      </section>

      {/* Próxima pastilla */}
      <Card>
        <SectionTitle
          action={
            dose && dose.minutes_late > 0 ? (
              <Badge tone="warn">Pendiente</Badge>
            ) : dose ? (
              <Badge>A las {hour12(dose.time)}</Badge>
            ) : null
          }
        >
          Próxima pastilla
        </SectionTitle>
        {dose ? (
          <>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-warn-soft text-warn">
                <Pill aria-hidden />
              </span>
              <div>
                <p className="text-lg font-bold">
                  {dose.name} {dose.dose}
                </p>
                <p className="text-base text-muted">
                  Tomar a las {hour12(dose.time)}
                  {dose.instructions ? ` · ${dose.instructions}` : ""}
                </p>
              </div>
            </div>
            <form action={confirmDose} className="mt-4">
              <input type="hidden" name="medicationId" value={dose.id} />
              <input type="hidden" name="by" value="Carla" />
              <SubmitButton className="w-full bg-navy-900 text-white" pendingText="Confirmando…">
                <Check aria-hidden /> Confirmar toma
              </SubmitButton>
            </form>
          </>
        ) : (
          <p className="flex items-center gap-2 text-lg font-bold text-ok">
            <CircleCheck aria-hidden /> Todas las pastillas de hoy fueron tomadas
          </p>
        )}
      </Card>

      {/* Próxima cita */}
      {nextAppt && (
        <Link href="/citas" className="block">
          <Card className="transition hover:border-navy-800">
            <SectionTitle action={nextAppt.assigned_name && <Badge>Asignado a {nextAppt.assigned_name}</Badge>}>
              Próxima cita médica
            </SectionTitle>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-100 text-navy-900">
                <Stethoscope aria-hidden />
              </span>
              <div className="flex-1">
                <p className="text-lg font-bold">
                  {nextAppt.specialty} — {nextAppt.doctor}
                </p>
                <p className="text-base text-muted">
                  {capitalize(longDate(nextAppt.starts_at))} · {timeOf(nextAppt.starts_at)} · {nextAppt.clinic}
                </p>
              </div>
              <ChevronRight aria-hidden className="text-muted" />
            </div>
          </Card>
        </Link>
      )}

      {/* Turnos */}
      <Card>
        <SectionTitle>Turnos asignados</SectionTitle>
        <ul className="divide-y divide-line">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-100 text-navy-900">
                {t.kind === "cita" ? <CalendarDays aria-hidden /> : <ShoppingCart aria-hidden />}
              </span>
              <div className="flex-1">
                <p className={`text-base font-bold ${t.done ? "text-muted line-through" : ""}`}>{t.title}</p>
                <p className="text-sm text-muted">{t.due_label}</p>
              </div>
              <form action={toggleTask}>
                <input type="hidden" name="taskId" value={t.id} />
                <SubmitButton
                  pendingText="…"
                  aria-label={t.done ? `Marcar "${t.title}" como pendiente` : `Marcar "${t.title}" como hecho`}
                  className={`min-w-12 border-2 ${t.done ? "border-ok bg-ok text-white" : "border-line bg-white text-muted"}`}
                >
                  <Check aria-hidden />
                </SubmitButton>
              </form>
            </li>
          ))}
        </ul>
      </Card>

      {/* Feed */}
      <Card>
        <SectionTitle>Feed en vivo y alertas</SectionTitle>
        <ul className="space-y-3" aria-live="polite">
          {feed.map((e) => (
            <li
              key={e.id}
              className={`flex gap-3 rounded-xl p-3 ${
                e.level === "alert" ? "border-2 border-danger bg-danger-soft" : "bg-surface"
              }`}
            >
              {e.level === "alert" ? (
                <TriangleAlert aria-hidden className="mt-0.5 shrink-0 text-danger" />
              ) : e.level === "ok" ? (
                <CircleCheck aria-hidden className="mt-0.5 shrink-0 text-ok" />
              ) : (
                <Info aria-hidden className="mt-0.5 shrink-0 text-navy-800" />
              )}
              <div>
                <p className={`text-base font-bold ${e.level === "alert" ? "text-danger" : ""}`}>{e.title}</p>
                {e.detail && <p className="text-sm text-muted">{e.detail}</p>}
                <p className="mt-1 text-sm font-medium text-muted">{relativeTime(e.created_at)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </Shell>
  );
}
