// Esqueleto mientras se cargan los datos de la base de datos
export default function Loading() {
  return (
    <div className="mx-auto min-h-screen max-w-md space-y-5 p-4" aria-busy="true" aria-label="Cargando">
      <div className="h-16 animate-pulse rounded-2xl bg-white" />
      <div className="h-32 animate-pulse rounded-2xl bg-navy-100" />
      <div className="h-40 animate-pulse rounded-2xl bg-white" />
      <div className="h-40 animate-pulse rounded-2xl bg-white" />
    </div>
  );
}
