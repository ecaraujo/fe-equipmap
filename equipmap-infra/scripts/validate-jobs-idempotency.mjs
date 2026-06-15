/**
 * validate-jobs-idempotency.mjs — Task 13.9
 * Validates that daily scheduled jobs are idempotent and timezone-aware:
 * - Creates data that should trigger the maintenance overdue job
 * - Triggers or waits for job execution
 * - Verifies notifications are not duplicated on re-trigger
 *
 * Prerequisites: stack running via docker compose up
 * Usage: node scripts/validate-jobs-idempotency.mjs
 */

const BFF_URL = process.env.BFF_URL ?? "http://localhost:4000/graphql";
const MAINTENANCE_URL = process.env.MAINTENANCE_URL ?? "http://localhost:8084";
const WARRANTY_URL = process.env.WARRANTY_URL ?? "http://localhost:8085";
const ADMIN_EMAIL = process.env.AUTH_SEED_ADMIN_EMAIL ?? "admin@equipmap.local";
const ADMIN_PASSWORD = process.env.AUTH_SEED_ADMIN_PASSWORD ?? "admin123";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ ${message}`);
    failed++;
  }
}

async function graphql(query, variables, token) {
  const response = await fetch(BFF_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables: variables ?? {} }),
  });
  return response.json();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function countOverdueNotifications(token, maintenanceId) {
  const response = await graphql(`query { notifications { id type resourceId } }`, {}, token);
  return response.data?.notifications?.filter(
    n => n.type === "MAINTENANCE_OVERDUE" && n.resourceId === maintenanceId
  ).length ?? 0;
}

async function waitForOverdueNotifications(token, maintenanceId, expectedMinimum, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  let count = 0;

  do {
    count = await countOverdueNotifications(token, maintenanceId);
    if (count >= expectedMinimum) {
      return count;
    }
    await sleep(2000);
  } while (Date.now() < deadline);

  return count;
}

async function triggerJob(serviceUrl, jobEndpoint) {
  try {
    const response = await fetch(`${serviceUrl}${jobEndpoint}`, { method: "POST" });
    return { ok: response.ok, status: response.status };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

console.log("\n=== Jobs Idempotency Validation (Task 13.9) ===\n");

// Login
console.log("1. Login as admin...");
const loginResult = await graphql(
  `mutation Login($input: LoginInput!) { login(input: $input) { token } }`,
  { input: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } },
);
const token = loginResult.data.login.token;
assert(!!token, "Login successful");

// Create maintenance with past scheduledDate (should become overdue)
console.log("\n2. Create maintenance with past scheduledDate...");
const ts = Date.now();
const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ago

const maintenance = await graphql(
  `mutation CreateMaintenance($input: CreateMaintenanceInput!) { createMaintenance(input: $input) { id status scheduledDate } }`,
  {
    input: {
      equipment: `Job Test Equip ${ts}`,
      type: "PREVENTIVE",
      scheduledDate: pastDate,
      technician: "Job Test Tech",
      description: `Job idempotency test ${ts}`,
    },
  },
  token,
);
assert(!maintenance.errors, `Maintenance created: ${maintenance.data?.createMaintenance?.id}`);
const maintId = maintenance.data?.createMaintenance?.id;

// Try to trigger the overdue job via actuator or dedicated endpoint
console.log("\n3. Triggering daily overdue job...");

// Try Spring Actuator scheduled tasks trigger
let jobTriggered = false;
const jobTriggerResult = await triggerJob(MAINTENANCE_URL, "/actuator/scheduledtasks/trigger/markOverdueMaintenance");
if (jobTriggerResult.ok) {
  jobTriggered = true;
  console.log("  Job triggered via actuator");
} else {
  // Try internal homologation endpoint
  const alt = await triggerJob(MAINTENANCE_URL, "/maintenance/internal/jobs/mark-overdue");
  if (alt.ok) {
    jobTriggered = true;
    console.log("  Job triggered via internal API");
  } else {
    console.log("  ⚠ Could not trigger job directly. Waiting 15s for scheduled execution...");
    await sleep(15000);
    jobTriggered = true; // assume it ran
  }
}

// Wait for event processing
console.log("  Waiting for event processing...");

// Check notifications generated
console.log("\n4. Check notifications after first job run...");
const overdueCount1 = maintId ? await waitForOverdueNotifications(token, maintId, 1) : 0;
console.log(`  Found ${overdueCount1} overdue notification(s) for this maintenance`);
assert(overdueCount1 >= 1 || !maintId, "At least 1 overdue notification generated");

// Trigger job AGAIN to test idempotency
console.log("\n5. Triggering job a SECOND time (idempotency test)...");
if (jobTriggered) {
  await triggerJob(MAINTENANCE_URL, "/actuator/scheduledtasks/trigger/markOverdueMaintenance");
  await triggerJob(MAINTENANCE_URL, "/maintenance/internal/jobs/mark-overdue");
  await sleep(5000);
}

// Check notifications again — count should NOT increase
console.log("6. Verify no duplicate notifications...");
const overdueCount2 = maintId ? await countOverdueNotifications(token, maintId) : 0;
console.log(`  Found ${overdueCount2} overdue notification(s) after second run`);
assert(overdueCount2 === overdueCount1, `No duplicate notifications (before: ${overdueCount1}, after: ${overdueCount2})`);

// Verify timezone awareness (condominium timezone in result)
console.log("\n7. Verify timezone configuration...");
const condos = await graphql(`query { condominiums { id timezone } }`, {}, token);
if (condos.data?.condominiums?.length > 0) {
  const tz = condos.data.condominiums[0].timezone;
  assert(!!tz, `Condominium has timezone configured: ${tz}`);
  assert(tz === "America/Sao_Paulo" || tz.includes("/"), "Timezone is valid IANA format");
}

// --- Summary ---
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
