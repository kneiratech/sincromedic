import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PrintButton from "@/components/PrintButton";
import { Logo } from "@/components/Shell";
import { getSenior, getAdherence, getAdherenceByMedication } from "@/lib/data";
import { capitalize, longDate } from "@/lib/format";

export const metadata = { title: "Reporte de adherencia — SincroMedic" };

export default async function ReportePage() {
  const [senior, total, byMed] = await Promise.all([getSenior(), getAdherence(14), getAdherenceByMedication(14)]);

  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-white p-6 print:p-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href="/pastillas" className="flex min-h-12 items-center gap-2 text-base font-bold text-navy-900">
          <ArrowLeft aria-hidden /> Volver
        </Link>
      </div>
      <Logo />
      <h1 className="mt-4 text-2xl font-bold text-navy-950">Reporte de adherencia — últimos 14 días</h1>
      <p className="mt-1 text-base text-muted">
        Paciente: {senior.name} ({senior.age} años) · Emitido el {capitalize(longDate(new Date()))}
      </p>

      <div className="my-6 rounded-2xl bg-navy-900 p-5 text-white print:border print:border-black print:bg-white print:text-black">
        <p className="text-base">Adherencia total</p>
        <p className="text-5xl font-bold">{total.pct}%</p>
        <p className="text-base">
          {total.taken} de {total.expected} tomas confirmadas
        </p>
      </div>

      <table className="w-full border-collapse text-base">
        <thead>
          <tr className="border-b-2 border-ink text-left">
            <th className="py-2">Medicamento</th>
            <th className="py-2 text-right">Tomas</th>
            <th className="py-2 text-right">Adherencia</th>
          </tr>
        </thead>
        <tbody>
          {byMed.map((m) => {
            const pct = Math.round((m.taken / m.expected) * 100);
            return (
              <tr key={m.name} className="border-b border-line">
                <td className="py-3 font-bold">
                  {m.name} {m.dose}
                </td>
                <td className="py-3 text-right">
                  {m.taken}/{m.expected}
                </td>
                <td className={`py-3 text-right font-bold ${pct < 80 ? "text-danger" : "text-ok"}`}>{pct}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-4 text-sm text-muted">Una adherencia menor a 80% se marca en rojo para revisión médica.</p>

      <div className="mt-8">
        <PrintButton />
      </div>
    </div>
  );
}
