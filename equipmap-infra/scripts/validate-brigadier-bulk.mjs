const BFF_URL = process.env.BFF_URL ?? "http://localhost:4000/graphql";
const ADMIN_EMAIL = process.env.AUTH_SEED_ADMIN_EMAIL ?? "admin@equipmap.local";
const ADMIN_PASSWORD = process.env.AUTH_SEED_ADMIN_PASSWORD ?? "admin123";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  OK ${message}`);
    passed++;
  } else {
    console.error(`  FAIL ${message}`);
    failed++;
  }
}

async function graphql(query, variables = {}, token) {
  const response = await fetch(BFF_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log("\n=== Brigadier Bulk Notification Validation (Task 3.5) ===\n");

console.log("1. Login as admin...");
const loginResult = await graphql(
  `mutation Login($input: LoginInput!) { login(input: $input) { token } }`,
  { input: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } },
);
const token = loginResult.data?.login?.token;
assert(!!token, "Login successful");

console.log("\n2. Create brigadiers (2 active + 1 inactive)...");
const ts = Date.now();

async function createBrigadier(input) {
  return graphql(
    `mutation CreateBrigadier($input: CreateBrigadierInput!) {
      createBrigadier(input: $input) { id name active }
    }`,
    { input },
    token,
  );
}

const brig1 = await createBrigadier({
  name: `Brig Active 1 ${ts}`,
  apartment: "101",
  block: "A",
  phone: "+5511900000001",
  role: "BRIGADIER",
  certificationDate: "2026-01-01T00:00:00.000Z",
  certificationExpiry: "2027-06-01T00:00:00.000Z",
  certificationBody: "CBM",
  active: true,
});
assert(!brig1.errors, `Created active brigadier 1: ${brig1.data?.createBrigadier?.id}`);

const brig2 = await createBrigadier({
  name: `Brig Active 2 ${ts}`,
  apartment: "102",
  block: "A",
  phone: "+5511900000002",
  role: "CHIEF",
  certificationDate: "2026-01-01T00:00:00.000Z",
  certificationExpiry: "2027-06-01T00:00:00.000Z",
  certificationBody: "CBM",
  active: true,
});
assert(!brig2.errors, `Created active brigadier 2: ${brig2.data?.createBrigadier?.id}`);

const brig3 = await createBrigadier({
  name: `Brig Inactive ${ts}`,
  apartment: "103",
  block: "A",
  phone: "+5511900000003",
  role: "BRIGADIER",
  certificationDate: "2025-01-01T00:00:00.000Z",
  certificationExpiry: "2025-06-01T00:00:00.000Z",
  certificationBody: "CBM",
  active: false,
});
assert(!brig3.errors, `Created inactive brigadier: ${brig3.data?.createBrigadier?.id}`);

console.log("\n3. Send bulk notification...");
const recipientIds = [
  brig1.data?.createBrigadier?.id,
  brig2.data?.createBrigadier?.id,
  brig3.data?.createBrigadier?.id,
].filter(Boolean);

const message = `Teste de envio em massa ${ts}`;
const notifyResult = await graphql(
  `mutation NotifyBrigadiers($input: NotifyBrigadiersInput!) {
    notifyBrigadiers(input: $input) { id recipients message status }
  }`,
  { input: { recipientIds, message, channel: "WHATSAPP" } },
  token,
);
assert(!notifyResult.errors, notifyResult.errors?.[0]?.message ?? "Bulk notification sent successfully");
assert(notifyResult.data?.notifyBrigadiers?.message === message, "Returned notification log belongs to this batch");

console.log("\n4. Waiting for async processing (3s)...");
await sleep(3000);

console.log("5. Verify NotificationLog entries...");
const logs = await graphql(
  `query { notificationLogs { id recipients status channel message } }`,
  {},
  token,
);
assert(!logs.errors, logs.errors?.[0]?.message ?? "Notification logs endpoint accessible");

const relevantLogs = logs.data?.notificationLogs?.filter((log) => log.message === message) ?? [];
assert(relevantLogs.length >= 2, `Found ${relevantLogs.length} log entries for this batch (expected >=2)`);

const inactiveLogs = relevantLogs.filter((log) =>
  log.recipients?.some((recipient) => String(recipient).includes("Brig Inactive")),
);
assert(inactiveLogs.length === 0, "No log entry for inactive brigadier (silently excluded)");

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
