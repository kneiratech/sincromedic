import { query } from "./db";

export async function getSenior() {
  const [s] = await query("SELECT * FROM seniors ORDER BY id LIMIT 1");
  return s;
}

export async function getMembers() {
  return query("SELECT id, name, color, share_pct::float AS share_pct FROM family_members ORDER BY id");
}

// Medicamentos con estado de hoy y minutos de retraso
export async function getMedicationsToday() {
  return query(`
    SELECT m.*,
           to_char(m.schedule_time, 'HH24:MI') AS time,
           (m.stock_units / GREATEST(m.units_per_day, 1)) AS stock_days,
           d.taken_at, d.confirmed_by,
           GREATEST(0, floor(extract(epoch FROM (localtime - m.schedule_time)) / 60))::int AS minutes_late
    FROM medications m
    LEFT JOIN dose_logs d ON d.medication_id = m.id AND d.taken_on = CURRENT_DATE
    WHERE m.active
    ORDER BY m.schedule_time`);
}

// La próxima pastilla pendiente de hoy (la más atrasada primero)
export async function getNextPendingDose() {
  const meds = await getMedicationsToday();
  return meds.find((m) => !m.taken_at) ?? null;
}

export async function getAdherence(days = 14) {
  const [row] = await query(
    `SELECT count(*)::int AS taken,
            (SELECT count(*) FROM medications WHERE active)::int * $1 AS expected
     FROM dose_logs WHERE taken_on >= CURRENT_DATE - $1::int AND taken_on < CURRENT_DATE`,
    [days]
  );
  const pct = row.expected ? Math.round((row.taken / row.expected) * 100) : 100;
  return { ...row, pct };
}

export async function getAdherenceByMedication(days = 14) {
  return query(
    `SELECT m.name, m.dose, count(d.id)::int AS taken, $1::int AS expected
     FROM medications m
     LEFT JOIN dose_logs d ON d.medication_id = m.id
       AND d.taken_on >= CURRENT_DATE - $1::int AND d.taken_on < CURRENT_DATE
     WHERE m.active GROUP BY m.id ORDER BY m.schedule_time`,
    [days]
  );
}

export async function getAppointments() {
  const appts = await query(`
    SELECT a.*, f.name AS assigned_name,
           (a.starts_at::date - CURRENT_DATE) AS days_left
    FROM appointments a
    LEFT JOIN family_members f ON f.id = a.assigned_to
    WHERE a.starts_at >= CURRENT_DATE
    ORDER BY a.starts_at`);
  const steps = await query("SELECT * FROM appointment_steps ORDER BY appointment_id, position");
  return appts.map((a) => ({ ...a, steps: steps.filter((s) => s.appointment_id === a.id) }));
}

export async function getCareTasks() {
  return query(`
    SELECT t.*, f.name AS member_name FROM care_tasks t
    LEFT JOIN family_members f ON f.id = t.assigned_to
    ORDER BY t.done, t.id`);
}

export async function getFeed() {
  const events = await query("SELECT * FROM feed_events ORDER BY created_at DESC LIMIT 6");
  // Alertas de escalamiento calculadas: pastillas con más de 30 min de retraso
  const meds = await getMedicationsToday();
  const alerts = meds
    .filter((m) => !m.taken_at && m.minutes_late >= 30)
    .map((m) => ({
      id: `alert-${m.id}`,
      level: "alert",
      title: `Alerta escalamiento: ${formatMinutes(m.minutes_late)} sin confirmar ${m.name}`,
      detail: "Llamando a Carla de respaldo según protocolo de cuidado.",
      created_at: new Date(),
    }));
  return [...alerts, ...events];
}

export async function getSplitMode() {
  const [r] = await query("SELECT value FROM settings WHERE key = 'split_mode'");
  return r?.value ?? "iguales";
}

export async function getMonthExpenses() {
  return query(`
    SELECT e.*, e.amount::float AS amount, f.name AS paid_by_name,
           to_char(e.spent_on, 'YYYY-MM-DD"T"12:00:00-05:00') AS spent_on
    FROM expenses e JOIN family_members f ON f.id = e.paid_by
    WHERE e.spent_on >= date_trunc('month', CURRENT_DATE)
    ORDER BY e.spent_on DESC, e.id DESC`);
}

// Calcula cuánto le corresponde a cada hermano, cuánto pagó y quién le debe a quién
export async function getFinanceSummary() {
  const [members, expenses, settlements] = await Promise.all([
    getMembers(),
    getMonthExpenses(),
    query(`SELECT from_member, to_member, amount::float AS amount FROM settlements
           WHERE settled_at >= date_trunc('month', CURRENT_DATE)`),
  ]);
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byMember = Object.fromEntries(members.map((m) => [m.id, { ...m, share: 0, paid: 0 }]));

  for (const e of expenses) {
    byMember[e.paid_by].paid += e.amount;
    for (const m of members) {
      const pct = e.split_method === "personalizado" ? m.share_pct / 100 : 1 / members.length;
      byMember[m.id].share += e.amount * pct;
    }
  }
  for (const s of settlements) {
    byMember[s.from_member].paid += s.amount;
    byMember[s.to_member].paid -= s.amount;
  }

  const rows = Object.values(byMember).map((m) => ({
    ...m,
    pct: total ? Math.round((m.share / total) * 100) : 0,
    net: Math.round((m.paid - m.share) * 100) / 100,
  }));

  // Liquidación greedy: deudores pagan a acreedores
  const debtors = rows.filter((r) => r.net < -0.5).map((r) => ({ ...r, left: -r.net }));
  const creditors = rows.filter((r) => r.net > 0.5).map((r) => ({ ...r, left: r.net }));
  const transfers = [];
  for (const d of debtors) {
    for (const c of creditors) {
      if (d.left < 0.5) break;
      const amt = Math.min(d.left, c.left);
      if (amt < 0.5) continue;
      transfers.push({ from: d, to: c, amount: Math.round(amt) });
      d.left -= amt;
      c.left -= amt;
    }
  }

  const categories = ["Farmacia", "Seguro", "Citas", "Exámenes"].map((name) => ({
    name,
    total: expenses.filter((e) => e.category === name).reduce((s, e) => s + e.amount, 0),
  }));

  return { total, members: rows, transfers, categories, expenses };
}

export async function getNurseLogs() {
  return query("SELECT * FROM nurse_logs ORDER BY created_at DESC LIMIT 3");
}

export async function getServices() {
  return query("SELECT * FROM services ORDER BY id");
}

export function formatMinutes(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
