"use client";

import { useEffect, useRef, useState } from "react";

const SIZES = [
  { id: "md", label: "A", title: "Letra normal" },
  { id: "lg", label: "A+", title: "Letra grande" },
  { id: "xl", label: "A++", title: "Letra muy grande" },
];

// Permite agrandar toda la interfaz (se recuerda con una cookie)
export default function TextSizeControl({ initial = "md", dark = false }) {
  const [size, setSize] = useState(initial);
  const changed = useRef(false);

  useEffect(() => {
    if (!changed.current) return;
    const root = document.documentElement;
    if (size === "md") delete root.dataset.text;
    else root.dataset.text = size;
    document.cookie = `text-size=${size}; path=/; max-age=31536000; samesite=lax`;
  }, [size]);

  function choose(id) {
    changed.current = true;
    setSize(id);
  }

  return (
    <div role="group" aria-label="Tamaño de letra" className="flex gap-1">
      {SIZES.map((s) => (
        <button
          key={s.id}
          type="button"
          title={s.title}
          aria-pressed={size === s.id}
          onClick={() => choose(s.id)}
          className={`min-h-10 min-w-10 rounded-lg px-2 text-sm font-bold ${
            size === s.id
              ? dark ? "bg-white text-navy-950" : "bg-navy-900 text-white"
              : dark ? "bg-white/10 text-white" : "bg-navy-100 text-navy-900"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
