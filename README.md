# SincroMedic

App para que una familia coordine el cuidado de un adulto mayor: medicinas, citas, gastos compartidos y servicios.
Hecha con **Next.js 16 (App Router, Server Actions)**, **Tailwind CSS 4** y **PostgreSQL 17**.

## Cómo ejecutarla

```bash
docker compose up -d      # Postgres en localhost:5434 (crea tablas y datos de ejemplo)
cp .env.example .env.local
npm install
npm run dev               # http://localhost:3000
```

Para reiniciar la base con los datos de ejemplo: `docker compose down -v && docker compose up -d`.

## Pantallas (según el Figma)

| Ruta | Pantalla | Qué hace |
|---|---|---|
| `/` | Gestión Familiar | Próxima pastilla, confirmar toma, próxima cita, turnos y feed con alertas de escalamiento (>30 min sin confirmar) |
| `/pastillas` | Adherencia y Pastillas | Registrar receta (foto + datos), toma de hoy con switch, alertas de stock y reabastecer |
| `/reporte` | Reporte de adherencia | Últimos 14 días, listo para imprimir o guardar como PDF |
| `/citas` | Citas de Papá | Próxima consulta, preparación por etapas, exportar a calendario (`.ics`) |
| `/finanzas` | Gastos Compartidos | Total del mes, partes iguales / personalizado, saldos entre hermanos, registrar gasto |
| `/senior` | Vista Papá | Pantalla simple de alto contraste: un solo botón gigante "Ya la tomé" y lectura en voz alta |
| `/servicios` | Bienestar y Aliados | Bitácora del enfermero, ruta de caminata y pedir servicios |

## Accesibilidad para adultos mayores

- Tipografía **Atkinson Hyperlegible Next** (Braille Institute), diseñada para baja visión: letras que no se confunden (I/l/1, 0/O).
- Texto base de **18 px**, con control **A / A+ / A++** (20 px y 25 px) que se recuerda en una cookie.
- Colores con contraste alto (texto gris oscuro 8.9:1, azul marino 12.6:1).
- Botones y zonas táctiles de al menos 48 px, foco de teclado visible, etiquetas `aria` y respeto a `prefers-reduced-motion`.
- Vista del adulto mayor con una sola acción y botón para escuchar el mensaje en voz alta.

## Estructura

```
db/01_schema.sql, 02_seed.sql   Esquema y datos de ejemplo (se cargan al crear el contenedor)
lib/db.js                       Pool de pg
lib/data.js                     Consultas (incluye cálculo de saldos entre hermanos)
app/actions.js                  Server Actions (confirmar toma, gastos, saldar, etc.)
components/                     Shell, navegación inferior, modal de gasto, etc.
```
