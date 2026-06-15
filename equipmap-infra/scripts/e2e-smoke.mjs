const BFF_URL = process.env.BFF_URL ?? "http://localhost:4000/graphql";
const ADMIN_EMAIL = process.env.AUTH_SEED_ADMIN_EMAIL ?? "admin@equipmap.local";
const ADMIN_PASSWORD = process.env.AUTH_SEED_ADMIN_PASSWORD ?? "admin123";

async function graphql(query, variables, token) {
  const response = await fetch(BFF_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-trace-id": "equipmap-infra-smoke",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables: variables ?? {} }),
  });

  const body = await response.json();
  if (!response.ok || body.errors?.length) {
    throw new Error(JSON.stringify(body, null, 2));
  }
  return body.data;
}

const loginData = await graphql(
  `mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user { id email role condominiumId condominiumName }
    }
  }`,
  { input: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } },
);

const token = loginData.login.token;
if (!token) throw new Error("Login did not return a token");

const condominiums = await graphql(`query { condominiums { id name timezone } }`, {}, token);
if (condominiums.condominiums.length < 1) throw new Error("No condominiums returned");

const equipment = await graphql(
  `mutation CreateEquipment($input: CreateEquipmentInput!) {
    createEquipment(input: $input) {
      id
      name
      status
      condominiumId
    }
  }`,
  {
    input: {
      name: `Smoke Equip ${Date.now()}`,
      type: "ELECTRICAL",
      brand: "EquipMap",
      model: "SMK-1",
      serialNumber: `SMK-${Date.now()}`,
      location: "Casa de maquinas",
      status: "ACTIVE",
      acquisitionDate: "2026-01-01T00:00:00.000Z",
      warrantyExpiry: "2027-01-01T00:00:00.000Z",
      nextMaintenance: "2026-06-01T00:00:00.000Z",
      value: 1000,
    },
  },
  token,
);

await graphql(
  `mutation CreateMaintenance($input: CreateMaintenanceInput!) {
    createMaintenance(input: $input) { id status equipmentId }
  }`,
  {
    input: {
      equipment: equipment.createEquipment.name,
      equipmentId: equipment.createEquipment.id,
      type: "PREVENTIVE",
      scheduledDate: "2026-06-01T00:00:00.000Z",
      technician: "Tecnico Smoke",
      provider: "Equipe interna",
      description: "Smoke preventivo",
    },
  },
  token,
);

await graphql(
  `mutation CreateWarranty($input: CreateWarrantyInput!) {
    createWarranty(input: $input) { id status equipmentId }
  }`,
  {
    input: {
      equipment: equipment.createEquipment.name,
      equipmentId: equipment.createEquipment.id,
      brand: "EquipMap",
      model: "SMK-1",
      supplier: "Fornecedor Smoke",
      purchaseDate: "2026-01-01T00:00:00.000Z",
      warrantyStart: "2026-01-01T00:00:00.000Z",
      warrantyEnd: "2027-01-01T00:00:00.000Z",
      warrantyMonths: 12,
      type: "MANUFACTURER",
    },
  },
  token,
);

const apartment = await graphql(
  `mutation CreateApartment($input: CreateApartmentInput!) {
    createParkingApartment(input: $input) { id unit hasVehicle }
  }`,
  {
    input: {
      unit: `S${Date.now()}`,
      block: "A",
      ownerName: "Morador Smoke",
      phone: "+5511999999999",
      email: "smoke@example.com",
      floor: 1,
      hasVehicle: true,
    },
  },
  token,
);

await graphql(
  `mutation CreateSpot($input: CreateParkingSpotInput!) {
    createParkingSpot(input: $input) { id number type }
  }`,
  {
    input: {
      number: `V${Date.now()}`,
      type: "STANDARD",
      covered: true,
      floor: "G1",
    },
  },
  token,
);

const lottery = await graphql(
  `mutation ExecuteLottery($input: ExecuteLotteryInput) {
    executeLottery(input: $input) {
      id
      seed
      results { id unit spotNumber }
      undrawnApartments { id unit }
    }
  }`,
  { input: { seed: 20260522 } },
  token,
);

await graphql(
  `mutation CreateBrigadier($input: CreateBrigadierInput!) {
    createBrigadier(input: $input) { id name certificationStatus }
  }`,
  {
    input: {
      name: "Brigadista Smoke",
      apartment: apartment.createParkingApartment.unit,
      block: "A",
      phone: "+5511888888888",
      role: "BRIGADIER",
      certificationDate: "2026-01-01T00:00:00.000Z",
      certificationExpiry: "2027-01-01T00:00:00.000Z",
      certificationBody: "Corpo de Bombeiros",
      active: true,
      observations: "Smoke",
    },
  },
  token,
);

const notifications = await graphql(`query { notifications { id type severity read } }`, {}, token);

console.log(JSON.stringify({
  login: loginData.login.user.email,
  condominiums: condominiums.condominiums.length,
  equipmentId: equipment.createEquipment.id,
  lotteryResults: lottery.executeLottery.results.length,
  notifications: notifications.notifications.length,
}, null, 2));
