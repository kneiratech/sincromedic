-- SincroMedic: esquema de base de datos
CREATE TABLE seniors (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  nickname    TEXT NOT NULL,           -- "Papá"
  age         INT NOT NULL,
  residence   TEXT NOT NULL
);

CREATE TABLE family_members (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL,           -- color para gráficos (hex)
  share_pct   NUMERIC(5,2) NOT NULL    -- % en modo "personalizado"
);

CREATE TABLE medications (
  id            SERIAL PRIMARY KEY,
  senior_id     INT NOT NULL REFERENCES seniors(id),
  name          TEXT NOT NULL,
  dose          TEXT NOT NULL,
  frequency     TEXT NOT NULL,
  schedule_time TIME NOT NULL,
  description   TEXT,
  instructions  TEXT,
  stock_units   INT NOT NULL DEFAULT 0, -- pastillas restantes
  units_per_day INT NOT NULL DEFAULT 1,
  active        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE dose_logs (
  id            SERIAL PRIMARY KEY,
  medication_id INT NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  taken_on      DATE NOT NULL DEFAULT CURRENT_DATE,
  taken_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_by  TEXT NOT NULL,
  UNIQUE (medication_id, taken_on)
);

CREATE TABLE appointments (
  id           SERIAL PRIMARY KEY,
  senior_id    INT NOT NULL REFERENCES seniors(id),
  specialty    TEXT NOT NULL,
  doctor       TEXT NOT NULL,
  clinic       TEXT NOT NULL,
  starts_at    TIMESTAMPTZ NOT NULL,
  assigned_to  INT REFERENCES family_members(id)
);

CREATE TABLE appointment_steps (
  id             SERIAL PRIMARY KEY,
  appointment_id INT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  detail         TEXT,
  position       INT NOT NULL,
  done           BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE care_tasks (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  assigned_to  INT REFERENCES family_members(id),
  due_label    TEXT NOT NULL,
  kind         TEXT NOT NULL,           -- 'cita' | 'compra'
  done         BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE feed_events (
  id          SERIAL PRIMARY KEY,
  level       TEXT NOT NULL,            -- 'alert' | 'ok' | 'info'
  title       TEXT NOT NULL,
  detail      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE expenses (
  id           SERIAL PRIMARY KEY,
  amount       NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  description  TEXT NOT NULL,
  category     TEXT NOT NULL,           -- 'Farmacia' | 'Citas' | 'Seguro' | 'Exámenes'
  paid_by      INT NOT NULL REFERENCES family_members(id),
  split_method TEXT NOT NULL DEFAULT 'iguales', -- 'iguales' | 'personalizado'
  spent_on     DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE settlements (
  id          SERIAL PRIMARY KEY,
  from_member INT NOT NULL REFERENCES family_members(id),
  to_member   INT NOT NULL REFERENCES family_members(id),
  amount      NUMERIC(10,2) NOT NULL,
  settled_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE nurse_logs (
  id          SERIAL PRIMARY KEY,
  nurse       TEXT NOT NULL,
  note        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE services (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL,
  kind        TEXT NOT NULL             -- 'transporte' | 'farmacia'
);

CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
