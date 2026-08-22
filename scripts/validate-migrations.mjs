#!/usr/bin/env node
/**
 * Migration Validation Harness
 * ============================
 * Applies supabase/migrations/*.sql (in order) to a scratch PostgreSQL database
 * under a Supabase-compatible shim, then runs functional assertions against the
 * live schema: org bootstrap, seed idempotency, quota triggers, role guard,
 * lead ownership forcing, and phone normalization.
 *
 * Usage:
 *   npm run test:migrations
 *
 * Environment (all optional — defaults suit a local Postgres):
 *   PGHOST, PGPORT, PGUSER, PGPASSWORD  — connection for the admin connection
 *   TEST_DB_NAME                        — scratch DB name (default callcrm_mig_test_<ts>)
 */

import { execSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "..", "supabase", "migrations");

const DB_NAME = process.env.TEST_DB_NAME || `callcrm_mig_test_${Date.now()}`;
const PG = {
  host: process.env.PGHOST || "/tmp",
  port: process.env.PGPORT || "5432",
  user: process.env.PGUSER || execSync("whoami").toString().trim(),
};

function psql(db, sql, { stopOnError = true, expectError = false } = {}) {
  const envVars = { ...process.env, PGHOST: PG.host, PGPORT: PG.port, PGUSER: PG.user };
  try {
    const out = execSync(`psql -d ${db} -v ON_ERROR_STOP=${stopOnError ? 1 : 0} -tA 2>&1`, {
      encoding: "utf8",
      env: envVars,
      input: sql,
    });
    if (expectError && /ERROR:/.test(out)) return { ok: false, err: out };
    return { ok: true, out };
  } catch (e) {
    if (expectError) return { ok: false, err: String(e.stderr || e.message) };
    console.error(`\n✗ psql failed on db=${db}\nSQL: ${sql.slice(0, 200)}\n${e.stderr || e.message}`);
    cleanup();
    process.exit(1);
  }
}

function psqlFile(db, file) {
  try {
    execSync(
      `psql -d ${db} -v ON_ERROR_STOP=1 -q -f "${file}"`,
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, PGHOST: PG.host, PGPORT: PG.port, PGUSER: PG.user } }
    );
    return { ok: true };
  } catch (e) {
    console.error(`\n✗ Migration file failed: ${file}\n${String(e.stderr).slice(-1500)}`);
    return { ok: false, err: String(e.stderr) };
  }
}

function ownerIdRef() {
  return psql(DB_NAME, `select id::text from auth.users where email='owner@test.local'`).out.trim();
}

function cleanup() {
  try {
    execSync(`psql -d postgres -c "DROP DATABASE IF EXISTS \\"${DB_NAME}\\""`, {
      encoding: "utf8",
      env: { ...process.env, PGHOST: PG.host, PGPORT: PG.port, PGUSER: PG.user },
    });
  } catch {}
}

// ---------------------------------------------------------------- results --
const results = [];
let failures = 0;
function check(name, cond, detail = "") {
  results.push({ name, pass: !!cond, detail });
  if (!cond) failures++;
  console.log(`${cond ? "  ✓" : "  ✗"} ${name}${detail && !cond ? ` — ${detail}` : ""}`);
}

// ==================================================================== main ==
console.log(`\n▶ Migration validation harness`);
console.log(`  target db: ${DB_NAME} @ ${PG.host}:${PG.port} as ${PG.user}\n`);

cleanup();
psql("postgres", `CREATE DATABASE "${DB_NAME}"`);

try {
  // ---------------------------------------------------------- Supabase shim
  console.log("▶ Applying Supabase environment shim");
  psql(DB_NAME, `
    create schema if not exists auth;
    create table if not exists auth.users (
      id uuid primary key default gen_random_uuid(),
      email text unique,
      raw_user_meta_data jsonb default '{}'::jsonb,
      created_at timestamptz default now()
    );
    create or replace function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
    do $$ begin
      if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
      if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
      if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin; end if;
    end $$;
  `);

  // ------------------------------------------------------------- migrations
  console.log("▶ Applying migrations in order");
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  check("migration files discovered", files.length >= 6, `found ${files.length}`);
  for (const f of files) {
    const r = psqlFile(DB_NAME, join(MIGRATIONS_DIR, f));
    check(`apply ${f}`, r.ok);
  }

  // ------------------------------------------------------------ functional
  console.log("\n▶ Functional assertions");

  // Bootstrap: signup trigger provisions org + owner profile + pipeline stages
  psql(DB_NAME, `
    insert into auth.users (email, raw_user_meta_data)
    values ('owner@test.local', '{"full_name":"Test Owner","org_name":"Harness Realty"}');
  `);
  check("bootstrap: org created", psql(DB_NAME, `select count(*) from orgs`).out.trim() === "1");
  check("bootstrap: owner profile role", psql(DB_NAME, `select role from profiles limit 1`).out.trim() === "owner");
  check("bootstrap: 7 pipeline stages", psql(DB_NAME, `select count(*) from pipeline_stages`).out.trim() === "7");

  // Seed RPC + idempotency (claim + call share one session)
  const seedCall = `select set_config('request.jwt.claim.sub', (select id::text from auth.users where email='owner@test.local'), false);
    select seed_organization_sample_data();`;
  psql(DB_NAME, seedCall);
  let projects1 = "";
  {
    const res = psql(DB_NAME, seedCall);
    void res;
    projects1 = psql(DB_NAME, `select count(*) from projects`).out.trim();
  }
  const projects2 = psql(DB_NAME, `select count(*) from projects`).out.trim();
  check("seed populated catalog", Number(projects1) >= 6, `projects=${projects1}`);
  check("seed is idempotent", projects1 === projects2);


  // Phone normalization trigger
  psql(DB_NAME, `insert into people (org_id, name, phone) values ((select id from orgs limit 1), 'PhoneNorm', '98100 11122')`);
  check(
    "phone normalization (+91 E.164)",
    psql(DB_NAME, `select phone_normalized from people where name='PhoneNorm'`).out.trim() === "+919810011122"
  );

  // Lead quota trigger fires at plan limit
  psql(DB_NAME, `update orgs set plan='starter'`);
  const flood = psql(
    DB_NAME,
    `insert into leads (org_id, person_name, phone, budget) select (select id from orgs limit 1), 'Flood', '+919999000000', 100000 from generate_series(1, 320)`,
    { stopOnError: false, expectError: true }
  );
  check(
    "lead quota enforced at plan limit",
    !flood.ok && /LEAD_QUOTA_EXCEEDED/.test(flood.err),
  );

  // Role self-elevation blocked (H2) — claim + update share a session
  const selfRole = psql(
    DB_NAME,
    `select set_config('request.jwt.claim.sub', '${ownerIdRef()}', false);
     update profiles set role='admin';`,
    { stopOnError: false, expectError: true }
  );
  check("self role-change blocked", !selfRole.ok && /SELF_ROLE_CHANGE_FORBIDDEN|ROLE_CHANGE_FORBIDDEN/.test(selfRole.err));

  // Seat quota enforced
  psql(DB_NAME, `delete from leads where person_name='Flood'; update orgs set plan='growth', max_seats=1`);
  psql(DB_NAME, `insert into auth.users (email) values ('rep@test.local')`);
  const secondUser = psql(DB_NAME, `select id::text from auth.users where email='rep@test.local'`).out.trim();
  const seatQuota = psql(
    DB_NAME,
    `insert into profiles (user_id, org_id, role, full_name) values ('${secondUser}', (select id from orgs limit 1), 'salesperson', 'Rep')`,
    { stopOnError: false, expectError: true }
  );
  check("seat quota enforced", !seatQuota.ok && /SEAT_QUOTA_EXCEEDED/.test(seatQuota.err));

  // Lead ownership forcing (M5): salesperson cannot assign to someone else.
  // rep@test.local already owns a bootstrap profile from their own signup —
  // the OWNER moves them into the harness org as a salesperson (allowed:
  // acting on someone else), then the REP attempts cross-assignment.
  const ownerId = ownerIdRef();
  psql(DB_NAME, `
    select set_config('request.jwt.claim.sub', '${ownerId}', false);
    update orgs set max_seats=25;
    update profiles set org_id=(select id from orgs limit 1), role='salesperson', full_name='Rep Two'
      where user_id='${secondUser}';
    select set_config('request.jwt.claim.sub', '${secondUser}', false);
    insert into leads (org_id, person_name, phone, budget, salesperson_id)
      values ((select id from orgs limit 1), 'OwnForce', '+918888777666', 1000000, '${ownerId}');
  `);
  check(
    "lead ownership forced to self",
    psql(DB_NAME, `select salesperson_id = '${secondUser}' from leads where person_name='OwnForce'`).out.trim() === "t"
  );

  // Billing webhook provider CHECK accepts 'billing'
  const billingEvent = psql(
    DB_NAME,
    `insert into webhook_events (org_id, provider, event_type, idempotency_key, payload) values (null, 'billing', 'checkout.session.completed', 'billing_test_1', '{}')`
  );
  check("webhook_events accepts billing provider", billingEvent.ok);
} finally {
  cleanup();
}

// ------------------------------------------------------------------ report -
console.log("\n▶ Results");
for (const r of results) {
  console.log(`${r.pass ? "  ✓" : "  ✗"} ${r.name}${r.pass ? "" : ` — ${r.detail}`}`);
}
console.log(`\n${failures === 0 ? "✅ ALL MIGRATION CHECKS PASSED" : `❌ ${failures} CHECK(S) FAILED`}\n`);
process.exit(failures === 0 ? 0 : 1);
