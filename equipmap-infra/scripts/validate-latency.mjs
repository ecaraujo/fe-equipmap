/**
 * validate-latency.mjs — Task 13.11
 * Validates that p95 response time for simple queries is ≤ 500ms.
 *
 * Runs N iterations of common GraphQL queries and measures latency percentiles.
 *
 * Prerequisites: stack running via docker compose up
 * Usage: node scripts/validate-latency.mjs
 */

const BFF_URL = process.env.BFF_URL ?? "http://localhost:4000/graphql";
const ADMIN_EMAIL = process.env.AUTH_SEED_ADMIN_EMAIL ?? "admin@equipmap.local";
const ADMIN_PASSWORD = process.env.AUTH_SEED_ADMIN_PASSWORD ?? "admin123";
const ITERATIONS = parseInt(process.env.LATENCY_ITERATIONS ?? "100", 10);
const P95_THRESHOLD_MS = parseInt(process.env.P95_THRESHOLD_MS ?? "500", 10);

async function graphql(query, variables = {}, token) {
  const start = performance.now();
  const response = await fetch(BFF_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  await response.json();
  return performance.now() - start;
}

function percentile(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil(sorted.length * p / 100) - 1;
  return sorted[Math.max(0, idx)];
}

function stats(arr) {
  return {
    min: Math.min(...arr).toFixed(1),
    max: Math.max(...arr).toFixed(1),
    avg: (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1),
    p50: percentile(arr, 50).toFixed(1),
    p95: percentile(arr, 95).toFixed(1),
    p99: percentile(arr, 99).toFixed(1),
  };
}

console.log("\n=== Latency Benchmark (Task 13.11) ===\n");
console.log(`Config: ${ITERATIONS} iterations, p95 threshold: ${P95_THRESHOLD_MS}ms`);
console.log(`Target: ${BFF_URL}\n`);

// Login first
console.log("1. Authenticating...");
const loginStart = performance.now();
const loginResponse = await fetch(BFF_URL, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    query: `mutation Login($input: LoginInput!) { login(input: $input) { token } }`,
    variables: { input: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } },
  }),
});
const loginBody = await loginResponse.json();
const loginLatency = performance.now() - loginStart;
const token = loginBody.data?.login?.token;

if (!token) {
  console.error("Login failed. Cannot proceed with benchmark.");
  process.exit(1);
}
console.log(`  Login latency: ${loginLatency.toFixed(1)}ms\n`);

// Define queries to benchmark
const queries = [
  {
    name: "equipments (list)",
    query: `query { equipments(page: 1, pageSize: 10) { items { id name status type } totalCount } }`,
  },
  {
    name: "condominiums (list)",
    query: `query { condominiums { id name timezone } }`,
  },
  {
    name: "notifications (list)",
    query: `query { notifications { id type severity read createdAt } }`,
  },
  {
    name: "me (user profile)",
    query: `query { me { id email role condominiumId condominiumName } }`,
  },
  {
    name: "maintenances (list)",
    query: `query { maintenances(page: 1, pageSize: 10) { items { id status type scheduledDate } totalCount } }`,
  },
];

// Warmup
console.log("2. Warmup (5 requests per query)...");
for (const q of queries) {
  for (let i = 0; i < 5; i++) {
    await graphql(q.query, {}, token);
  }
}
console.log("  Done.\n");

// Benchmark
console.log(`3. Running benchmark (${ITERATIONS} iterations per query)...\n`);

let allLatencies = [];
let allPassed = true;

for (const q of queries) {
  const latencies = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const ms = await graphql(q.query, {}, token);
    latencies.push(ms);
  }

  const s = stats(latencies);
  const p95Pass = parseFloat(s.p95) <= P95_THRESHOLD_MS;
  const icon = p95Pass ? "✓" : "✗";

  console.log(`  ${icon} ${q.name}`);
  console.log(`    min: ${s.min}ms | avg: ${s.avg}ms | p50: ${s.p50}ms | p95: ${s.p95}ms | p99: ${s.p99}ms | max: ${s.max}ms`);

  if (!p95Pass) allPassed = false;
  allLatencies.push(...latencies);
}

// Overall
const overall = stats(allLatencies);
console.log(`\n  ─── Overall (${allLatencies.length} requests) ───`);
console.log(`  min: ${overall.min}ms | avg: ${overall.avg}ms | p50: ${overall.p50}ms | p95: ${overall.p95}ms | p99: ${overall.p99}ms | max: ${overall.max}ms`);

const overallP95 = parseFloat(overall.p95);
console.log(`\n=== Result: p95 = ${overall.p95}ms ${overallP95 <= P95_THRESHOLD_MS ? "≤" : ">"} ${P95_THRESHOLD_MS}ms → ${overallP95 <= P95_THRESHOLD_MS ? "PASS ✓" : "FAIL ✗"} ===\n`);

process.exit(allPassed && overallP95 <= P95_THRESHOLD_MS ? 0 : 1);
