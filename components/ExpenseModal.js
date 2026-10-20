"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Camera, Plus, X } from "lucide-react";
import SubmitButton from "./SubmitButton";
import { addExpense } from "@/app/actions";

const CATEGORIES = ["Farmacia", "Citas", "Seguro", "Exámenes"];
const field = "mt-1 block w-full min-h-12 rounded-xl border-2 border-line bg-white px-3 text-base focus:border-navy-800";

export default function ExpenseModal({ members, defaultSplit }) {
  const dialog = useRef(null);
  const [category, setCategory] = useState("Farmacia");
  const [split, setSplit] = useState(defaultSplit);
  const [state, action] = useActionState(addExpense, null);

  useEffect(() => {
    if (state?.ok) dialog.current?.close();
  }, [state]);

  function open() {
    setCategory("Farmacia");
    setSplit(defaultSplit);
    dialog.current?.showModal();
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Registrar nuevo gasto"
        className="fixed right-[max(1rem,calc(50%-14rem+1rem))] bottom-24 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-navy-900 text-white shadow-lg"
      >
        <Plus aria-hidden size={32} />
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="expense-title"
        className="m-0 mt-auto w-full max-w-none bg-transparent p-0 backdrop:bg-navy-950/60 sm:m-auto sm:max-w-md"
      >
        <form action={action} className="mx-auto max-h-[92vh] max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-line" aria-hidden />
          <div className="mb-4 flex items-center justify-between">
            <h2 id="expense-title" className="text-xl font-bold text-navy-950">Registrar nuevo gasto</h2>
            <button type="button" onClick={() => dialog.current?.close()} aria-label="Cerrar" className="flex h-12 w-12 items-center justify-center rounded-full bg-surface">
              <X aria-hidden />
            </button>
          </div>

          <label className="mb-4 flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-navy-800 bg-navy-100 p-4 text-center text-navy-900">
            <Camera aria-hidden />
            <span className="text-base font-bold">Subir foto de boleta o recibo</span>
            <span className="text-sm">JPG, PNG o PDF</span>
            <input type="file" accept="image/*,application/pdf" className="sr-only" />
          </label>

          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="text-base font-bold">Monto del gasto</label>
              <div className="relative">
                <span className="absolute top-1/2 left-3 mt-0.5 -translate-y-1/2 font-bold text-muted">S/</span>
                <input id="amount" name="amount" inputMode="decimal" required placeholder="120.00" className={`${field} pl-10`} />
              </div>
            </div>
            <div>
              <label htmlFor="description" className="text-base font-bold">Descripción</label>
              <input id="description" name="description" required placeholder="Compra de pastillas para la presión" className={field} />
            </div>

            <fieldset>
              <legend className="text-base font-bold">Categoría</legend>
              <input type="hidden" name="category" value={category} />
              <div className="mt-2 flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={category === c}
                    onClick={() => setCategory(c)}
                    className={`min-h-12 rounded-full border-2 px-4 text-base font-bold ${
                      category === c ? "border-navy-900 bg-navy-900 text-white" : "border-line bg-white text-ink"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="paidBy" className="text-base font-bold">¿Quién pagó?</label>
              <select id="paidBy" name="paidBy" className={field} defaultValue={members[0]?.id}>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <fieldset>
              <legend className="text-base font-bold">Método de división</legend>
              <input type="hidden" name="split" value={split} />
              <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl bg-surface p-1">
                {[["iguales", "Partes iguales"], ["personalizado", "Porcentaje personalizado"]].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={split === id}
                    onClick={() => setSplit(id)}
                    className={`min-h-12 rounded-lg px-2 text-base font-bold ${split === id ? "bg-white text-navy-900 shadow" : "text-muted"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            {state?.error && <p role="alert" className="text-base font-bold text-danger">{state.error}</p>}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button type="button" onClick={() => dialog.current?.close()} className="min-h-12 rounded-xl border-2 border-line text-base font-bold">
                Cancelar
              </button>
              <SubmitButton className="bg-navy-900 text-white">Guardar gasto</SubmitButton>
            </div>
          </div>
        </form>
      </dialog>
    </>
  );
}
