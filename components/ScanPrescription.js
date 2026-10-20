"use client";

import { useActionState, useState } from "react";
import { Camera, X } from "lucide-react";
import SubmitButton from "./SubmitButton";
import { addMedication } from "@/app/actions";

const input = "mt-1 block w-full min-h-12 rounded-xl border-2 border-line bg-white px-3 text-base focus:border-navy-800";
const label = "block text-base font-bold text-ink";

// Foto de la receta + confirmación manual de los datos detectados
export default function ScanPrescription() {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [state, action] = useActionState(async (_prev, fd) => {
    const r = await addMedication(fd);
    if (r?.ok) {
      setOpen(false);
      setPreview(null);
    }
    return r;
  }, null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full flex-col items-center gap-2 rounded-2xl bg-navy-900 px-4 py-6 text-center text-white shadow"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
          <Camera aria-hidden size={28} />
        </span>
        <span className="text-lg font-bold">Escanear receta médica</span>
        <span className="text-base text-white/90">Toma una foto para registrar las dosis automáticamente</span>
      </button>
    );
  }

  return (
    <section className="rounded-2xl border-2 border-navy-800 bg-white p-4" aria-labelledby="scan-title">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="scan-title" className="text-lg font-bold text-navy-900">Nueva receta</h2>
        <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar" className="flex h-12 w-12 items-center justify-center rounded-full bg-surface">
          <X aria-hidden />
        </button>
      </div>
      <form action={action} className="space-y-4">
        <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-navy-800 bg-navy-100 p-4 text-center text-navy-900">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Foto de la receta" className="max-h-40 rounded-lg" />
          ) : (
            <>
              <Camera aria-hidden />
              <span className="text-base font-bold">Tomar o subir foto de la receta</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPreview(URL.createObjectURL(f));
            }}
          />
        </label>
        <p className="text-sm text-muted">Revisa y confirma los datos de la receta:</p>
        <div>
          <label htmlFor="med-name" className={label}>Medicamento</label>
          <input id="med-name" name="name" required placeholder="Ej. Enalapril" className={input} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="med-dose" className={label}>Dosis</label>
            <input id="med-dose" name="dose" required placeholder="10mg" className={input} />
          </div>
          <div>
            <label htmlFor="med-time" className={label}>Hora</label>
            <input id="med-time" name="time" type="time" defaultValue="08:00" required className={input} />
          </div>
        </div>
        <div>
          <label htmlFor="med-desc" className={label}>¿Para qué sirve?</label>
          <input id="med-desc" name="description" placeholder="Para la presión" className={input} />
        </div>
        <div>
          <label htmlFor="med-inst" className={label}>Instrucciones</label>
          <input id="med-inst" name="instructions" placeholder="Tomar con agua" className={input} />
        </div>
        {state?.error && <p role="alert" className="font-bold text-danger">{state.error}</p>}
        <SubmitButton className="w-full bg-navy-900 text-white">Guardar medicamento</SubmitButton>
      </form>
    </section>
  );
}
