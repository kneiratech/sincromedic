"use client";

import { useActionState } from "react";
import { ChevronRight, CircleCheck } from "lucide-react";
import SubmitButton from "./SubmitButton";
import { requestService } from "@/app/actions";

export default function ServiceButton({ service, children }) {
  const [state, action] = useActionState(requestService, null);
  return (
    <form action={action}>
      <input type="hidden" name="serviceId" value={service.id} />
      <SubmitButton pendingText="Solicitando…" className="w-full justify-start border border-line bg-white py-4 text-left shadow-sm">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-100 text-navy-900">
          {children}
        </span>
        <span className="flex-1">
          <span className="block text-lg font-bold text-ink">{service.title}</span>
          <span className="block text-base font-normal text-muted">{service.description}</span>
        </span>
        <ChevronRight aria-hidden className="text-muted" />
      </SubmitButton>
      {state?.ok && (
        <p role="status" className="mt-2 flex items-center gap-2 text-base font-bold text-ok">
          <CircleCheck aria-hidden /> Solicitud enviada. El aliado te confirmará por WhatsApp.
        </p>
      )}
    </form>
  );
}
