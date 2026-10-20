import { getAppointments } from "@/lib/data";

const stamp = (d) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s) => String(s).replaceAll("\\", "\\\\").replaceAll(",", "\\,").replaceAll(";", "\\;");

// Exporta las citas como archivo iCalendar para importarlas en cualquier calendario
export async function GET() {
  const appts = await getAppointments();
  const events = appts.map((a) => {
    const end = new Date(new Date(a.starts_at).getTime() + 60 * 60 * 1000);
    return [
      "BEGIN:VEVENT",
      `UID:cita-${a.id}@sincromedic`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(a.starts_at)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${esc(`${a.specialty} — ${a.doctor}`)}`,
      `LOCATION:${esc(a.clinic)}`,
      `DESCRIPTION:${esc(a.steps.map((s) => s.title).join(" | "))}`,
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:Cita médica mañana", "END:VALARM",
      "END:VEVENT",
    ].join("\r\n");
  });
  const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SincroMedic//ES", ...events, "END:VCALENDAR"].join("\r\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="citas-sincromedic.ics"',
    },
  });
}
