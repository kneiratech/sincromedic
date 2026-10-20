"use client";

import { useFormStatus } from "react-dom";

// Botón grande (mín. 48px) que muestra estado mientras se guarda
export default function SubmitButton({ children, pendingText = "Guardando…", className = "", ...props }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-base font-bold disabled:opacity-60 ${className}`}
      {...props}
    >
      {pending ? pendingText : children}
    </button>
  );
}
