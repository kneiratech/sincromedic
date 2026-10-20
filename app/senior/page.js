import { Check, CircleCheck, Bell } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import TextSizeControl from "@/components/TextSizeControl";
import SpeakButton from "@/components/SpeakButton";
import { Logo, getTextSize } from "@/components/Shell";
import { getSenior, getMedicationsToday } from "@/lib/data";
import { confirmDose } from "../actions";
import { hour12, timeOf } from "@/lib/format";

export const metadata = { title: "Vista de Papá — SincroMedic" };

// Pantalla simple de alto contraste para el adulto mayor: una sola acción gigante
export default async function SeniorPage() {
  const [senior, meds, textSize] = await Promise.all([getSenior(), getMedicationsToday(), getTextSize()]);
  const pending = meds.find((m) => !m.taken_at);
  const lastTaken = meds.filter((m) => m.taken_at).sort((a, b) => new Date(b.taken_at) - new Date(a.taken_at))[0];

  const message = pending
    ? `Hola ${senior.name}, es momento de tomar tu ${pending.name} de las ${hour12(pending.time)}. ${pending.instructions ?? ""}`
    : `Muy bien ${senior.name}. Ya tomaste todas tus pastillas de hoy.`;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-navy-950 pb-28 text-white">
      <header className="flex items-center justify-between gap-2 px-4 pt-4">
        <Logo dark />
        <TextSizeControl initial={textSize} dark />
      </header>
      <div className="flex items-center justify-between px-4 pt-3">
        <p className="text-base font-bold">Modo: Pantalla simple</p>
        <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-bold">Alta visibilidad</span>
      </div>

      <main className="flex flex-1 flex-col items-center gap-6 px-5 pt-4">
        <section className="w-full rounded-3xl bg-white p-5 text-center text-ink shadow-lg">
          <SpeakButton text={message} />
          {pending ? (
            <>
              <h1 className="mt-4 text-3xl leading-tight font-bold text-navy-950">
                Toca tu pastilla: {pending.name}
              </h1>
              <p className="mt-2 text-xl">{message}</p>
            </>
          ) : (
            <>
              <h1 className="mt-4 text-3xl leading-tight font-bold text-ok">¡Todo listo por hoy!</h1>
              <p className="mt-2 text-xl">{message}</p>
            </>
          )}
        </section>

        {pending ? (
          <form action={confirmDose}>
            <input type="hidden" name="medicationId" value={pending.id} />
            <input type="hidden" name="by" value={senior.nickname} />
            <button
              type="submit"
              className="flex h-56 w-56 flex-col items-center justify-center gap-3 rounded-full border-8 border-white/25 bg-teal text-white shadow-2xl active:scale-95"
            >
              <Check aria-hidden size={72} strokeWidth={3} />
              <span className="text-4xl font-bold">Ya la tomé</span>
            </button>
          </form>
        ) : (
          <CircleCheck aria-hidden size={160} className="text-teal" />
        )}

        {lastTaken && (
          <p className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-lg font-bold" role="status">
            <Bell aria-hidden size={20} /> Aviso enviado a la familia · {lastTaken.name} {timeOf(lastTaken.taken_at)}
          </p>
        )}
      </main>
      <BottomNav dark />
    </div>
  );
}
