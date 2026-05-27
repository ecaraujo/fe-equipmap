/**
 * run-homologation.mjs — Orchestrates all validation scripts for MVP homologation.
 *
 * Covers tasks: 12.14, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 13.10, 13.11
 *
 * Prerequisites:
 *   1. All services built (JARs ready)
 *   2. Run from equipmap-infra directory: docker compose up --build -d
 *   3. Wait for all services to be healthy: node scripts/check-health.mjs
 *   4. Then run: node scripts/run-homologation.mjs
 *
 * Usage: node scripts/run-homologation.mjs [--skip-destructive]
 *   --skip-destructive: skips RabbitMQ resilience test (stops/starts containers)
 */

import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const skipDestructive = process.argv.includes("--skip-destructive");

const steps = [
  { task: "4.3", name: "Runtime Mock Guard", script: "verify-runtime-mocks.mjs" },
  { task: "12.14 + 13.4 + 13.5", name: "E2E Smoke Test (BFF + real services)", script: "e2e-smoke.mjs" },
  { task: "13.6", name: "Brigadier Bulk Notification", script: "validate-brigadier-bulk.mjs" },
  { task: "13.7", name: "RBAC Validation", script: "validate-rbac.mjs" },
  { task: "13.8", name: "Multi-Tenant Isolation", script: "validate-multi-tenant.mjs" },
  { task: "13.9", name: "Jobs Idempotency", script: "validate-jobs-idempotency.mjs" },
  { task: "13.10", name: "RabbitMQ Resilience", script: "validate-rabbitmq-resilience.mjs", destructive: true },
  { task: "13.11", name: "Latency Benchmark (p95 ≤ 500ms)", script: "validate-latency.mjs" },
];

console.log("╔══════════════════════════════════════════════════════════╗");
console.log("║        EquipMap MVP — Homologation Suite                 ║");
console.log("╚══════════════════════════════════════════════════════════╝\n");

if (skipDestructive) {
  console.log("⚠ Running with --skip-destructive (RabbitMQ resilience test skipped)\n");
}

// Step 0: Health check
console.log("━━━ Pre-flight: Health Check ━━━\n");
try {
  execSync(`node ${join(__dirname, "check-health.mjs")}`, { stdio: "inherit" });
  console.log("\n✓ All services healthy\n");
} catch {
  console.error("\n✗ Health check failed. Ensure all services are running.");
  console.error("  Run: docker compose up --build -d && sleep 30 && node scripts/check-health.mjs");
  process.exit(1);
}

// Run each validation
const results = [];

for (const step of steps) {
  if (step.destructive && skipDestructive) {
    console.log(`\n━━━ [${step.task}] ${step.name} ━━━ SKIPPED (destructive)\n`);
    results.push({ ...step, status: "skipped" });
    continue;
  }

  console.log(`\n━━━ [${step.task}] ${step.name} ━━━\n`);

  try {
    execSync(`node ${join(__dirname, step.script)}`, {
      stdio: "inherit",
      env: { ...process.env },
      timeout: 120000, // 2 min max per step
    });
    results.push({ ...step, status: "passed" });
  } catch (e) {
    results.push({ ...step, status: "failed", error: e.message });
  }
}

// Summary
console.log("\n╔══════════════════════════════════════════════════════════╗");
console.log("║                  Homologation Summary                    ║");
console.log("╠══════════════════════════════════════════════════════════╣");

for (const r of results) {
  const icon = r.status === "passed" ? "✓" : r.status === "skipped" ? "⊘" : "✗";
  console.log(`║ ${icon} [${r.task.padEnd(16)}] ${r.name.padEnd(36)} ║`);
}

console.log("╚══════════════════════════════════════════════════════════╝");

const passedCount = results.filter(r => r.status === "passed").length;
const failedCount = results.filter(r => r.status === "failed").length;
const skippedCount = results.filter(r => r.status === "skipped").length;

console.log(`\n  Passed: ${passedCount} | Failed: ${failedCount} | Skipped: ${skippedCount}\n`);

if (failedCount > 0) {
  console.log("Failed steps:");
  for (const r of results.filter(r => r.status === "failed")) {
    console.log(`  - [${r.task}] ${r.name}`);
  }
  process.exit(1);
} else {
  console.log("🎉 All homologation checks passed! MVP is ready for approval.\n");
  process.exit(0);
}
