const TZ = "America/Lima";

export const soles = (n, decimals = 0) =>
  `S/ ${Number(n).toLocaleString("es-PE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

// "08:00" -> "8:00 AM"
export function hour12(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h < 12 ? "AM" : "PM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${suffix}`;
}

export const timeOf = (date) =>
  hour12(new Date(date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }));

export const longDate = (date) =>
  new Date(date).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });

export const shortDate = (date) =>
  new Date(date).toLocaleDateString("es-PE", { day: "numeric", month: "short", timeZone: TZ });

export const monthName = () =>
  new Date().toLocaleDateString("es-PE", { month: "long", timeZone: TZ });

export function relativeTime(date) {
  const min = Math.round((Date.now() - new Date(date).getTime()) / 60000);
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `Hace ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? "Ayer" : `Hace ${d} días`;
}

export const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
