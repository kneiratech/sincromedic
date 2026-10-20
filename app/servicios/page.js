import { Clock, Footprints, Car, ShoppingCart, HeartPulse } from "lucide-react";
import Shell, { Card, SectionTitle, Badge } from "@/components/Shell";
import ServiceButton from "@/components/ServiceButton";
import { getNurseLogs, getServices } from "@/lib/data";
import { timeOf, relativeTime } from "@/lib/format";

const ICONS = { car: Car, cart: ShoppingCart };

export default async function ServiciosPage() {
  const [logs, services] = await Promise.all([getNurseLogs(), getServices()]);

  return (
    <Shell title="Bienestar y Aliados" subtitle="Cuidado y servicios especializados">
      <Card>
        <SectionTitle action={logs[0] && <Badge>{logs[0].nurse}</Badge>}>Bitácora del enfermero</SectionTitle>
        <ul className="space-y-3">
          {logs.map((l) => (
            <li key={l.id} className="flex gap-3 rounded-xl bg-surface p-3">
              <HeartPulse aria-hidden className="mt-0.5 shrink-0 text-navy-800" />
              <div>
                <p className="flex items-center gap-1 text-sm font-bold text-muted">
                  <Clock aria-hidden size={16} /> {relativeTime(l.created_at) === "Ahora" ? "Ahora" : `Hoy ${timeOf(l.created_at)}`}
                </p>
                <p className="text-base">{l.note}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <section className="rounded-2xl border-2 border-teal bg-ok-soft p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal text-white">
            <Footprints aria-hidden />
          </span>
          <div>
            <p className="text-sm font-bold tracking-wide text-ok uppercase">Bienestar diario</p>
            <p className="text-lg font-bold">Ruta caminata segura en parque cercano</p>
            <p className="text-base text-muted">
              Parque Reducto N°2 — veredas planas, bancas cada 50 m, sombra y baños accesibles. 20 minutos a paso suave.
            </p>
          </div>
        </div>
      </section>

      <div>
        <SectionTitle>Accesos directos aliados</SectionTitle>
        <ul className="space-y-3">
          {services.map((s) => {
            const Icon = ICONS[s.icon] ?? Car;
            return (
              <li key={s.id}>
                <ServiceButton service={s}>
                  <Icon aria-hidden />
                </ServiceButton>
              </li>
            );
          })}
        </ul>
      </div>
    </Shell>
  );
}
