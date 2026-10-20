"use client";

import { FileDown } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 text-base font-bold text-white print:hidden"
    >
      <FileDown aria-hidden /> Guardar como PDF / Imprimir
    </button>
  );
}
