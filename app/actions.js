"use server";

import { revalidatePath } from "next/cache";
import { exec, tx } from "@/lib/db";
import { timeOf } from "@/lib/format";

const CATEGORIES = ["Farmacia", "Citas", "Seguro", "Exámenes"];
const SPLITS = ["iguales", "personalizado"];

function refreshAll() {
  revalidatePath("/", "layout");
}

// Confirma la toma de hoy (desde la familia o desde la vista de Papá)
export async function confirmDose(formData) {
  const medicationId = Number(formData.get("medicationId"));
  const by = String(formData.get("by") || "Familia").slice(0, 40);
  if (!Number.isInteger(medicationId)) throw new Error("Medicamento inválido");

  await tx(async (c) => {
    const { rows } = await c.query(
      `INSERT INTO dose_logs (medication_id, confirmed_by) VALUES ($1, $2)
       ON CONFLICT (medication_id, taken_on) DO NOTHING RETURNING id`,
      [medicationId, by]
    );
    if (!rows.length) return;
    const { rows: [m] } = await c.query(
      `UPDATE medications SET stock_units = GREATEST(stock_units - units_per_day, 0)
       WHERE id = $1 RETURNING name, dose`,
      [medicationId]
    );
    await c.query(
      `INSERT INTO feed_events (level, title, detail) VALUES ('ok', $1, $2)`,
      [`${by} confirmó toma de ${m.name}`, `${m.name} ${m.dose} completada a las ${timeOf(new Date())}`]
    );
  });
  refreshAll();
}

// Desmarca una toma confirmada por error
export async function undoDose(formData) {
  const medicationId = Number(formData.get("medicationId"));
  await tx(async (c) => {
    const { rowCount } = await c.query(
      "DELETE FROM dose_logs WHERE medication_id = $1 AND taken_on = CURRENT_DATE",
      [medicationId]
    );
    if (rowCount) {
      await c.query(
        "UPDATE medications SET stock_units = stock_units + units_per_day WHERE id = $1",
        [medicationId]
      );
    }
  });
  refreshAll();
}

export async function restock(formData) {
  const medicationId = Number(formData.get("medicationId"));
  await exec("UPDATE medications SET stock_units = stock_units + 30 WHERE id = $1", [medicationId]);
  await exec(
    `INSERT INTO feed_events (level, title, detail)
     SELECT 'info', 'Reabastecimiento solicitado', name || ' ' || dose || ' — 30 unidades' FROM medications WHERE id = $1`,
    [medicationId]
  );
  refreshAll();
}

// Simula el escaneo OCR de una receta: registra un medicamento nuevo
export async function addMedication(formData) {
  const name = String(formData.get("name") || "").trim();
  const dose = String(formData.get("dose") || "").trim();
  const time = String(formData.get("time") || "08:00");
  if (!name || !dose || !/^\d{2}:\d{2}$/.test(time)) return { error: "Completa nombre, dosis y hora." };
  await exec(
    `INSERT INTO medications (senior_id, name, dose, frequency, schedule_time, description, instructions, stock_units)
     VALUES (1, $1, $2, '1 pastilla al día', $3, $4, $5, 30)`,
    [name, dose, time, formData.get("description") || null, formData.get("instructions") || null]
  );
  refreshAll();
  return { ok: true };
}

export async function toggleStep(formData) {
  await exec("UPDATE appointment_steps SET done = NOT done WHERE id = $1", [Number(formData.get("stepId"))]);
  refreshAll();
}

export async function toggleTask(formData) {
  await exec("UPDATE care_tasks SET done = NOT done WHERE id = $1", [Number(formData.get("taskId"))]);
  refreshAll();
}

export async function addExpense(_prev, formData) {
  const amount = Number(String(formData.get("amount")).replace(",", "."));
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category"));
  const paidBy = Number(formData.get("paidBy"));
  const split = String(formData.get("split"));

  if (!(amount > 0)) return { error: "Ingresa un monto mayor a 0." };
  if (!description) return { error: "Escribe una descripción." };
  if (!CATEGORIES.includes(category)) return { error: "Elige una categoría." };
  if (!SPLITS.includes(split)) return { error: "Elige un método de división." };

  await tx(async (c) => {
    const { rows } = await c.query("SELECT name FROM family_members WHERE id = $1", [paidBy]);
    if (!rows.length) throw new Error("Familiar inválido");
    await c.query(
      `INSERT INTO expenses (amount, description, category, paid_by, split_method) VALUES ($1, $2, $3, $4, $5)`,
      [amount, description, category, paidBy, split]
    );
    await c.query(
      `INSERT INTO feed_events (level, title, detail) VALUES ('info', $1, $2)`,
      [`${rows[0].name} registró un gasto`, `${category} — S/ ${amount.toFixed(2)}`]
    );
  });
  refreshAll();
  return { ok: true };
}

// Cambia el método de división y lo aplica a los gastos del mes
export async function setSplitMode(formData) {
  const mode = String(formData.get("mode"));
  if (!SPLITS.includes(mode)) return;
  await tx(async (c) => {
    await c.query("UPDATE settings SET value = $1 WHERE key = 'split_mode'", [mode]);
    await c.query(
      "UPDATE expenses SET split_method = $1 WHERE spent_on >= date_trunc('month', CURRENT_DATE)",
      [mode]
    );
  });
  refreshAll();
}

export async function settleDebt(formData) {
  const from = Number(formData.get("from"));
  const to = Number(formData.get("to"));
  const amount = Number(formData.get("amount"));
  if (!(amount > 0)) return;
  await tx(async (c) => {
    await c.query("INSERT INTO settlements (from_member, to_member, amount) VALUES ($1, $2, $3)", [from, to, amount]);
    await c.query(
      `INSERT INTO feed_events (level, title, detail)
       SELECT 'ok', a.name || ' saldó su deuda', 'Transfirió S/ ' || $3 || ' a ' || b.name
       FROM family_members a, family_members b WHERE a.id = $1 AND b.id = $2`,
      [from, to, amount]
    );
  });
  refreshAll();
}

export async function requestService(_prev, formData) {
  await exec(
    `INSERT INTO feed_events (level, title, detail)
     SELECT 'info', 'Servicio solicitado: ' || title, 'El aliado confirmará por WhatsApp en minutos' FROM services WHERE id = $1`,
    [Number(formData.get("serviceId"))]
  );
  refreshAll();
  return { ok: true };
}
