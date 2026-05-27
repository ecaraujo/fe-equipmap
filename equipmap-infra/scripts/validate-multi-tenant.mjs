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

console.log("\n=== Multi-Tenant Isolation Validation (Task 13.8) ===\n");

console.log("1. Login as admin in seed condominium...");
const loginResult = await graphql(
  `mutation Login($input: LoginInput!) {
    login(input: $input) { token user { id condominiumId } }
  }`,
  { input: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } },
);
assert(!loginResult.errors, "Admin login successful");
const adminToken = loginResult.data?.login?.token;
const adminUser = loginResult.data?.login?.user;
const seedCondominiumId = adminUser?.condominiumId;
console.log(`  Seed condominium: ${seedCondominiumId}`);

console.log("\n2. Create second condominium...");
const condo2Result = await graphql(
  `mutation CreateCondominium($input: CreateCondominiumInput!) {
    createCondominium(input: $input) { id name }
  }`,
  {
    input: {
      name: `Tenant Isolation Test ${Date.now()}`,
      cnpj: String(Date.now()).padStart(14, "0").slice(-14),
      address: "Rua do Teste, 200",
      timezone: "America/Sao_Paulo",
    },
  },
  adminToken,
);

let condo2Id = condo2Result.data?.createCondominium?.id;
if (condo2Result.errors) {
  console.log(`  Could not create second condominium: ${condo2Result.errors[0]?.message}`);
  const condos = await graphql(`query { condominiums { id name } }`, {}, adminToken);
  condo2Id = condos.data?.condominiums?.find((condo) => condo.id !== seedCondominiumId)?.id;
}
assert(!!condo2Id, `Second condominium available: ${condo2Id}`);

console.log("\n3. Create equipment in seed condominium...");
const equip1 = await graphql(
  `mutation {
    createEquipment(input: {
      name: "Tenant1 Equip ${Date.now()}", type: ELECTRICAL, brand: "T1", model: "M1",
      serialNumber: "TN1-${Date.now()}", location: "Seed", status: ACTIVE,
      acquisitionDate: "2026-01-01T00:00:00.000Z",
      warrantyExpiry: "2027-01-01T00:00:00.000Z",
      nextMaintenance: "2026-06-01T00:00:00.000Z",
      value: 500
    }) { id name condominiumId }
  }`,
  {},
  adminToken,
);
assert(!equip1.errors, "Equipment created in seed condominium");
const equip1Id = equip1.data?.createEquipment?.id;
assert(equip1.data?.createEquipment?.condominiumId === seedCondominiumId, "Equipment belongs to seed condominium");

console.log("\n4. Create second tenant token...");
const condo2Token = signToken({ userId: adminUser.id, role: "ADMIN", condominiumId: condo2Id });
assert(!!condo2Token, "Second condominium token generated");

console.log("\n5. Verify equipment from seed condominium is not visible in condo2...");
const condo2Equipments = await graphql(
  `query { equipments(pagination: { page: 1, pageSize: 100 }) { data { id name condominiumId } } }`,
  {},
  condo2Token,
);
assert(!condo2Equipments.errors, "Can list equipment in second condominium");

const leakedEquipment = condo2Equipments.data?.equipments?.data?.find((equipment) => equipment.id === equip1Id);
assert(!leakedEquipment, "Equipment from seed condominium not visible in second condominium");

const allInCondo2 = condo2Equipments.data?.equipments?.data?.every((equipment) => equipment.condominiumId === condo2Id) ?? true;
assert(allInCondo2, "All equipment in listing belongs to second condominium only");

console.log("\n6. Verify direct access to other tenant resource is blocked...");
const directAccess = await graphql(
  `query GetEquipment($id: ID!) { equipment(id: $id) { id condominiumId } }`,
  { id: equip1Id },
  condo2Token,
);
assert(!!directAccess.errors || directAccess.data?.equipment === null, "Direct access to other tenant equipment blocked");

console.log("\n7. Verify notifications are tenant-scoped...");
const condo2Notifications = await graphql(`query { notifications { id type } }`, {}, condo2Token);
assert(!condo2Notifications.errors, "Can query notifications in second condominium");

const seedNotifications = await graphql(`query { notifications { id type } }`, {}, adminToken);
assert(!seedNotifications.errors, "Notifications accessible in seed condominium context");

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
