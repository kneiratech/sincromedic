import { CalendarCheck, MapPin, Clock, Check, UserRound } from "lucide-react";
import Shell, { Card, SectionTitle, Badge } from "@/components/Shell";
import SubmitButton from "@/components/SubmitButton";
import { getAppointments, getSenior } from "@/lib/data";
import { toggleStep } from "../actions";
import { capitalize, longDate, timeOf } from "@/lib/format";

export default async function CitasPage() {
  const [senior, appointments] = await Promise.all([getSenior(), getAppointments()]);
  const [next, ...rest] = appointments;

  return (
    <Shell title={`Citas de ${senior.nickname}`} subtitle="Ruta y preparación por etapas">
      <a
        href="/citas/calendario.ics"
        download
        className="flex min-h-12 items-center gap-3 rounded-2xl border-2 border-ok bg-ok-soft p-3 text-ok"
      >
        <CalendarCheck aria-hidden className="shrink-0" />
        <span className="flex-1 text-base font-bold">Agregar las citas a mi calendario (Google, iPhone, Outlook)</span>
      </a>

      {next ? (
        <>
          <section className="rounded-2xl bg-navy-900 p-5 text-white shadow">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold tracking-wide text-white/85 uppercase">Próxima consulta</p>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-navy-900">
                {next.days_left === 0 ? "Hoy" : next.days_left === 1 ? "Mañana" : `En ${next.days_left} días`}
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold">Control de {next.specialty}</h2>
            <ul className="mt-3 space-y-2 text-base">
              <li className="flex items-center gap-2"><UserRound aria-hidden size={20} /> {next.doctor}</li>
              <li className="flex items-center gap-2">
                <Clock aria-hidden size={20} /> {capitalize(longDate(next.starts_at))}, {timeOf(next.starts_at)}
              </li>
              <li className="flex items-center gap-2"><MapPin aria-hidden size={20} /> {next.clinic}</li>
            </ul>
            {next.assigned_name && (
              <p className="mt-3 rounded-xl bg-white/10 p-2 text-base">
                Acompaña: <strong>{next.assigned_name}</strong>
              </p>
            )}
          </section>

          <Card>
            <SectionTitle>Control de próximas citas</SectionTitle>
            <p className="mb-2 text-lg font-bold">
              {next.specialty} — {next.clinic}
            </p>
            <Timeline steps={next.steps} />
          </Card>
        </>
      ) : (
        <Card>
          <p className="text-lg">No hay citas programadas.</p>
        </Card>
      )}

      {rest.map((a) => (
        <Card key={a.id}>
          <SectionTitle action={<Badge>En {a.days_left} días</Badge>}>{a.specialty}</SectionTitle>
          <p className="text-base text-muted">
            {a.doctor} · {capitalize(longDate(a.starts_at))}, {timeOf(a.starts_at)} · {a.clinic}
          </p>
          {a.steps.length > 0 && (
            <div className="mt-3">
              <Timeline steps={a.steps} />
            </div>
          )}
        </Card>
      ))}
    </Shell>
  );
}

function Timeline({ steps }) {
  return (
    <ol className="relative space-y-1 border-l-4 border-navy-100 pl-5">
      {steps.map((s) => (
        <li key={s.id} className="relative">
          <span
            aria-hidden
            className={`absolute top-4 -left-[1.95rem] h-5 w-5 rounded-full border-4 border-white ${s.done ? "bg-ok" : "bg-warn"}`}
          />
          <form action={toggleStep} className="flex items-start gap-3 py-2">
            <input type="hidden" name="stepId" value={s.id} />
            <div className="flex-1">
              <p className={`text-base font-bold ${s.done ? "text-ok" : "text-warn"}`}>{s.title}</p>
              {s.detail && <p className="text-sm text-muted">{s.detail}</p>}
            </div>
            <SubmitButton
              pendingText="…"
              aria-label={s.done ? `Marcar "${s.title}" como pendiente` : `Marcar "${s.title}" como hecho`}
              className={`min-w-12 border-2 ${s.done ? "border-ok bg-ok text-white" : "border-line bg-white text-muted"}`}
            >
              <Check aria-hidden />
            </SubmitButton>
          </form>
        </li>
      ))}
    </ol>
  );
}
