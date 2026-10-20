-- SincroMedic: datos de ejemplo (fechas relativas a hoy, zona America/Lima)
INSERT INTO seniors (name, nickname, age, residence)
VALUES ('Carlos', 'Papá', 74, 'Av. Benavides 1234, Miraflores');

INSERT INTO family_members (name, color, share_pct) VALUES
  ('Carla', '#E8A33D', 40),
  ('Juan',  '#2E8B57', 40),
  ('Diego', '#1E40AF', 20);

INSERT INTO medications (senior_id, name, dose, frequency, schedule_time, description, instructions, stock_units, units_per_day) VALUES
  (1, 'Losartán', '50mg', '1 pastilla al día', '08:00', 'Para la presión arterial', 'No duplicar dosis en caso de olvido', 4, 1),
  (1, 'Atorvastatina', '20mg', '1 pastilla al día', '20:00', 'Para el colesterol', 'Tomar después de la cena', 4, 1),
  (1, 'Metformina', '850mg', '1 pastilla al día', '13:00', 'Para el azúcar en la sangre', 'Tomar con el almuerzo', 28, 1);

-- Dosis de días anteriores (para el reporte de adherencia)
INSERT INTO dose_logs (medication_id, taken_on, taken_at, confirmed_by)
SELECT m.id, d::date, (d::date + m.schedule_time + interval '10 minutes') AT TIME ZONE 'America/Lima', 'Papá'
FROM medications m, generate_series(CURRENT_DATE - 14, CURRENT_DATE - 1, interval '1 day') d
WHERE NOT (m.name = 'Atorvastatina' AND extract(dow FROM d) IN (0, 3));

INSERT INTO appointments (senior_id, specialty, doctor, clinic, starts_at, assigned_to) VALUES
  (1, 'Cardiología', 'Dr. Fernando Torres', 'Clínica Angloamericana',
   ((CURRENT_DATE + 5) + time '10:00') AT TIME ZONE 'America/Lima', 1),
  (1, 'Endocrinología', 'Dra. Lucía Paredes', 'Clínica San Felipe',
   ((CURRENT_DATE + 19) + time '09:30') AT TIME ZONE 'America/Lima', 2);

INSERT INTO appointment_steps (appointment_id, title, detail, position, done) VALUES
  (1, '3 días antes: Ayuno y medicamentos', 'Suspender aspirina; confirmar ayuno de 8 horas la noche anterior', 1, TRUE),
  (1, '1 día antes: Coordinar transporte', 'Carla confirma el taxi para las 9:15 AM con Papá', 2, FALSE),
  (1, 'Día de la cita: Llevar documentos', 'DNI, carnet del seguro y últimos análisis de sangre', 3, FALSE),
  (2, '1 semana antes: Análisis de sangre', 'Glucosa y hemoglobina glicosilada en ayunas', 1, FALSE);

INSERT INTO care_tasks (title, assigned_to, due_label, kind) VALUES
  ('Acompaña a citas: Carla', 1, 'Hoy, 4:00 PM · Imagen Control', 'cita'),
  ('Compra medicinas: Juan', 2, 'Pendiente antes del viernes', 'compra');

INSERT INTO feed_events (level, title, detail, created_at) VALUES
  ('ok', 'Carla confirmó toma 9am', 'Pastilla de la presión completada', now() - interval '1 day'),
  ('info', 'Juan registró un gasto', 'Farmacia — S/ 140', now() - interval '2 days');

INSERT INTO expenses (amount, description, category, paid_by, split_method, spent_on) VALUES
  (180, 'Medicina semanal', 'Farmacia', 1, 'personalizado', date_trunc('month', CURRENT_DATE)::date),
  (450, 'Mensualidad seguro EPS', 'Seguro', 1, 'personalizado', date_trunc('month', CURRENT_DATE)::date),
  (20,  'Vitaminas', 'Farmacia', 1, 'personalizado', date_trunc('month', CURRENT_DATE)::date),
  (140, 'Pastillas para la presión', 'Farmacia', 2, 'personalizado', date_trunc('month', CURRENT_DATE)::date),
  (210, 'Consulta cardiología', 'Citas', 2, 'personalizado', date_trunc('month', CURRENT_DATE)::date),
  (70,  'Taxi a la clínica', 'Citas', 3, 'personalizado', date_trunc('month', CURRENT_DATE)::date),
  (180, 'Medicina semanal', 'Farmacia', 3, 'personalizado', date_trunc('month', CURRENT_DATE)::date);

INSERT INTO nurse_logs (nurse, note, created_at) VALUES
  ('Enfermero Andrés', 'Control de presión estable (120/80). Carlos desayunó bien y realizó ejercicios leves.',
   (CURRENT_DATE + time '09:00') AT TIME ZONE 'America/Lima');

INSERT INTO services (title, description, icon, kind) VALUES
  ('Pedir transporte asistido', 'Vehículos adaptados para citas de rutina y paseos a parques.', 'car', 'transporte'),
  ('Delivery farmacia', 'Envíos express a domicilio con las recetas actualizadas y digitalizadas.', 'cart', 'farmacia');

INSERT INTO settings (key, value) VALUES ('split_mode', 'personalizado');
