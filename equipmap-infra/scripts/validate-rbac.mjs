import { createHmac } from "crypto";

const BFF_URL = process.env.BFF_URL ?? "http://localhost:4000/graphql";
const ADMIN_EMAIL = process.env.AUTH_SEED_ADMIN_EMAIL ?? "admin@equipmap.local";
const ADMIN_PASSWORD = process.env.AUTH_SEED_ADMIN_PASSWORD ?? "admin123";
const JWT_SECRET = process.env.AUTH_JWT_SECRET ?? "dev-only-change-me-dev-only-change-me-dev-only-change-me";
const JWT_ISSUER = process.env.AUTH_JWT_ISSUER ?? "equipmap-auth-service";

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

function base64url(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signToken(claims) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url({ alg: "HS256", typ: "JWT" });
  const payload = base64url({
    ...claims,
    iss: JWT_ISSUER,
    iat: now,
    exp: now + 15 * 60,
  });
  const data = `${header}.${payload}`;
  const signature = createHmac("sha256", JWT_SECRET).update(data).digest("base64url");
  return `${data}.${signature}`;
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

console.log("\n=== RBAC Validation (Task 13.7) ===\n");

console.log("1. Login as admin...");
const loginResult = await graphql(
  `mutation Login($input: LoginInput!) {
    login(input: $input) { token user { id role condominiumId } }
  }`,
  { input: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } },
);
const adminToken = loginResult.data?.login?.token;
const adminUser = loginResult.data?.login?.user;
assert(!!adminToken, "Admin login successful");

const condominiumId = adminUser?.condominiumId;
const viewerToken = signToken({ userId: "00000000-0000-0000-0000-000000000701", role: "VIEWER", condominiumId });
const managerToken = signToken({ userId: "00000000-0000-0000-0000-000000000702", role: "MANAGER", condominiumId });

console.log("\n2. Testing viewer cannot write...");
const viewerCreate = await graphql(
  `mutation {
    createEquipment(input: {
      name: "Viewer RBAC Test", type: ELECTRICAL, brand: "Test", model: "T1",
      serialNumber: "RBAC-VIEW-${Date.now()}", location: "Test", status: ACTIVE,
      acquisitionDate: "2026-01-01T00:00:00.000Z",
      warrantyExpiry: "2027-01-01T00:00:00.000Z",
      nextMaintenance: "2026-06-01T00:00:00.000Z",
      value: 100
    }) { id }
  }`,
  {},
  viewerToken,
);
assert(!!viewerCreate.errors, "Viewer blocked from creating equipment");

const viewerRead = await graphql(
  `query { equipments(pagination: { page: 1, pageSize: 1 }) { data { id } } }`,
  {},
  viewerToken,
);
assert(!viewerRead.errors, "Viewer can read equipment list");

console.log("\n3. Testing admin has full access...");
const adminRead = await graphql(
  `query { equipments(pagination: { page: 1, pageSize: 1 }) { data { id } } }`,
  {},
  adminToken,
);
assert(!adminRead.errors, "Admin can read equipment list");

const adminCreate = await graphql(
  `mutation {
    createEquipment(input: {
      name: "Admin RBAC Test ${Date.now()}", type: ELECTRICAL, brand: "Test", model: "T1",
      serialNumber: "RBAC-ADM-${Date.now()}", location: "Test", status: ACTIVE,
      acquisitionDate: "2026-01-01T00:00:00.000Z",
      warrantyExpiry: "2027-01-01T00:00:00.000Z",
      nextMaintenance: "2026-06-01T00:00:00.000Z",
      value: 100
    }) { id }
  }`,
  {},
  adminToken,
);
assert(!adminCreate.errors, "Admin can create equipment");

console.log("\n4. Testing manager permissions...");
const managerCreate = await graphql(
  `mutation {
    createEquipment(input: {
      name: "Manager RBAC Test ${Date.now()}", type: ELECTRICAL, brand: "Test", model: "T1",
      serialNumber: "RBAC-MGR-${Date.now()}", location: "Test", status: ACTIVE,
      acquisitionDate: "2026-01-01T00:00:00.000Z",
      warrantyExpiry: "2027-01-01T00:00:00.000Z",
      nextMaintenance: "2026-06-01T00:00:00.000Z",
      value: 100
    }) { id }
  }`,
  {},
  managerToken,
);
assert(!managerCreate.errors, "Manager can create equipment");

const managerCondo = await graphql(
  `mutation {
    createCondominium(input: {
      name: "Manager Condo ${Date.now()}",
      cnpj: "${String(Date.now()).padStart(14, "0").slice(-14)}",
      address: "Test",
      timezone: "America/Sao_Paulo"
    }) { id }
  }`,
  {},
  managerToken,
);
assert(!!managerCondo.errors, "Manager blocked from creating condominium");

const managerReset = await graphql(`mutation { resetLottery }`, {}, managerToken);
assert(!!managerReset.errors, "Manager blocked from resetting lottery");

console.log("\n5. Testing unauthenticated access blocked...");
const unauth = await graphql(`query { equipments(pagination: { page: 1, pageSize: 1 }) { data { id } } }`);
assert(!!unauth.errors, "Unauthenticated request is blocked");

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
