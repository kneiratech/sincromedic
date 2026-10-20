"use client";

import { Volume2 } from "lucide-react";

// Lee el mensaje en voz alta (útil para personas con baja visión)
export default function SpeakButton({ text }) {
  function speak() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-PE";
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }
  return (
    <button
      type="button"
      onClick={speak}
      aria-label="Escuchar el mensaje en voz alta"
      className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy-100 text-navy-900"
    >
      <Volume2 aria-hidden size={32} />
    </button>
  );
}
