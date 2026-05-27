import { readdirSync, readFileSync, statSync } from "fs";
import { dirname, extname, join, relative, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..", "..");
const scriptPath = fileURLToPath(import.meta.url);

const runtimeRoots = [
  "src",
  "bff-equipmap/src",
  "bff-equipmap/schema.graphql",
];

const ignoredDirs = new Set([
  ".git",
  ".gradle",
  ".gradle-home",
  ".tmp",
  ".tools",
  ".vscode",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "openspec",
]);

const ignoredPathParts = [
  "/docs/",
  "/archive/",
  "/test/",
  "/tests/",
  "/__tests__/",
  "/fixtures/",
  "/seed/",
];

const ignoredExtensions = new Set([
  ".class",
  ".ico",
  ".jar",
  ".jpeg",
  ".jpg",
  ".lock",
  ".md",
  ".pdf",
  ".png",
  ".zip",
]);

const patterns = [
  { name: "useMock runtime switch", regex: /\buseMock\b/ },
  { name: "MOCK_MODE runtime switch", regex: /\bMOCK_MODE\b/ },
  { name: "generic Mock*Provider", regex: /\bMock[A-Za-z0-9_]*Provider\b/ },
  { name: "runtime appData usage", regex: /\bappData\b|app\/data\/appData|app\\data\\appData/ },
  { name: "faker in runtime", regex: /\bfaker\b|@faker-js\/faker/ },
  { name: "Dashboard maintenanceData demo array", regex: /\b(?:const|let|var)\s+maintenanceData\b/ },
  { name: "Dashboard recentEquipment demo array", regex: /\b(?:const|let|var)\s+recentEquipment\b/ },
  { name: "Dashboard upcomingMaintenance demo array", regex: /\b(?:const|let|var)\s+upcomingMaintenance\b/ },
  { name: "Dashboard EQ-001 demo equipment", regex: /\bEQ-001\b/ },
  { name: "hardcoded Residencial Park label", regex: /\bResidencial Park\b/ },
  { name: "login/marketing 2.4k+ demo value", regex: /\b2\.4k\+/ },
  { name: "login/marketing 180+ demo value", regex: /\b180\+/ },
  { name: "login/marketing 98% demo value", regex: /\b98%/ },
  { name: "hardcoded inventory badge", regex: /\bbadge\s*:\s*248\b/ },
  { name: "hardcoded maintenance badge", regex: /\bbadge\s*:\s*18\b/ },
  { name: "social admin email fallback", regex: /\badmin@equipmap\.local\b/ },
  { name: "social admin password fallback", regex: /\badmin123\b/ },
  { name: "frontend-only window.open delivery", regex: /\bwindow\.open\s*\(/ },
  { name: "frontend-only WhatsApp delivery", regex: /\bwa\.me\b|https:\/\/wa\.me/ },
  { name: "frontend-only SMS delivery", regex: /["'`]sms:/ },
  { name: "generic reachable PlaceholderPage", regex: /\bPlaceholderPage\b/ },
];

function normalizePath(path) {
  return path.split(/[\\/]+/).join("/");
}

function hasIgnoredExtension(file) {
  return ignoredExtensions.has(extname(file).toLowerCase());
}

function isTestFile(file) {
  const normalized = normalizePath(file).toLowerCase();
  const name = normalized.split("/").pop() ?? "";
  return /(^|[-.])(test|spec)\.[cm]?[jt]sx?$/.test(name) || name === "contract-test.ts";
}

function shouldIgnorePath(path) {
  const normalized = `/${normalizePath(relative(repoRoot, path))}`;
  return ignoredPathParts.some((part) => normalized.includes(part)) || isTestFile(path);
}

function isRuntimePath(path) {
  const normalized = normalizePath(relative(repoRoot, path));
  return runtimeRoots.some((root) => {
    const normalizedRoot = normalizePath(root);
    return normalized === normalizedRoot || normalized.startsWith(`${normalizedRoot}/`);
  });
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (ignoredDirs.has(entry)) {
      continue;
    }

    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      yield* walk(fullPath);
      continue;
    }

    if (
      stats.isFile() &&
      fullPath !== scriptPath &&
      isRuntimePath(fullPath) &&
      !hasIgnoredExtension(fullPath) &&
      !shouldIgnorePath(fullPath)
    ) {
      yield fullPath;
    }
  }
}

const findings = [];

for (const file of walk(repoRoot)) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }

  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const pattern of patterns) {
      if (pattern.regex.test(line)) {
        findings.push({
          file: normalizePath(relative(repoRoot, file)),
          line: index + 1,
          pattern: pattern.name,
          text: line.trim(),
        });
      }
    }
  });
}

if (findings.length > 0) {
  console.error("\nRuntime mock guard failed. Remove forbidden mock/demo patterns from runtime frontend/BFF paths:\n");
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} [${finding.pattern}] ${finding.text}`);
  }
  console.error("\nDocs, tests, OpenSpec artifacts, seed/fixture paths, and validation scripts are intentionally outside this runtime guard.\n");
  process.exit(1);
}

console.log("OK no forbidden runtime mock/demo patterns found in runtime frontend/BFF paths.");
