import http from "node:http";
import { ApolloServer } from "@apollo/server";
import type { GraphQLContext } from "./context.js";

process.env.AUTH_SERVICE_URL = "http://localhost:18081";
process.env.CONDOMINIUM_SERVICE_URL = "http://localhost:18082";
process.env.EQUIPMENT_SERVICE_URL = "http://localhost:18083";
process.env.MAINTENANCE_SERVICE_URL = "http://localhost:18084";
process.env.WARRANTY_SERVICE_URL = "http://localhost:18085";
process.env.PARKING_SERVICE_URL = "http://localhost:18086";
process.env.BRIGADIER_SERVICE_URL = "http://localhost:18087";
process.env.NOTIFICATION_SERVICE_URL = "http://localhost:18088";

type Handler = (req: http.IncomingMessage, body: string) => { status?: number; body?: unknown };

function startStub(port: number, routes: Record<string, Handler>): Promise<http.Server> {
  const server = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += String(chunk);
    });
    req.on("end", () => {
      const key = `${req.method ?? "GET"} ${req.url?.split("?")[0] ?? "/"}`;
      const route = routes[key];
      if (!route) {
        res.writeHead(404, { "content-type": "application/json" });
        res.end(JSON.stringify({ statusCode: 404, error: "NOT_FOUND", message: key }));
        return;
      }

      const result = route(req, raw);
      res.writeHead(result.status ?? 200, { "content-type": "application/json" });
      res.end(JSON.stringify(result.body ?? {}));
    });
  });

  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

function realContext(token?: string): GraphQLContext {
  const ctx: GraphQLContext = {
    auth: token
      ? {
          userId: "11111111-1111-1111-1111-111111111111",
          role: "ADMIN",
          condominiumId: "22222222-2222-2222-2222-222222222222",
          token,
        }
      : null,
    traceId: "contract-test",
  };
  return ctx;
}

const auth = await startStub(18081, {
  "GET /auth/me": () => ({
    body: {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Admin EquipMap",
      email: "admin@equipmap.local",
      role: "ADMIN",
      condominiumId: "22222222-2222-2222-2222-222222222222",
      condominiumName: "Residencial Contract",
      condominiums: [],
    },
  }),
  "POST /auth/login": () => ({
    body: {
      token: "contract-token",
      refreshToken: "contract-refresh",
      requiresCondominiumSelection: false,
      user: {
        id: "11111111-1111-1111-1111-111111111111",
        name: "Admin EquipMap",
        email: "admin@equipmap.local",
        role: "ADMIN",
        condominiumId: "22222222-2222-2222-2222-222222222222",
        condominiumName: "Residencial Contract",
        condominiums: [],
      },
    },
  }),
});

const condominium = await startStub(18082, {
  "GET /condominiums/22222222-2222-2222-2222-222222222222": () => ({
    body: {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Residencial Contract",
      cnpj: "00000000000100",
      address: "Rua Contract, 100",
      timezone: "America/Sao_Paulo",
      active: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      createdBy: "contract",
    },
  }),
});

const equipment = await startStub(18083, {
  "GET /equipment": (req) => {
    if (req.headers["x-trace-id"] !== "contract-test") {
      return { status: 400, body: { statusCode: 400, error: "BAD_REQUEST", message: "missing trace" } };
    }
    return {
      body: {
        data: [
          {
            id: "eq-001",
            condominiumId: "22222222-2222-2222-2222-222222222222",
            name: "Elevador Social",
            type: "TRANSPORT",
            brand: "Atlas",
            model: "A1",
            serialNumber: "SN-1",
            location: "Bloco A",
            status: "ACTIVE",
            acquisitionDate: "2026-01-01T00:00:00.000Z",
            warrantyExpiry: "2027-01-01T00:00:00.000Z",
            nextMaintenance: "2026-06-01T00:00:00.000Z",
            value: 1000,
            lastMaintenance: null,
            deletedAt: null,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
            createdBy: "contract",
          },
        ],
        pageInfo: { total: 1, page: 1, pageSize: 20, totalPages: 1 },
      },
    };
  },
});

const maintenance = await startStub(18084, {
  "GET /maintenance": (req) => {
    const url = new URL(req.url ?? "/maintenance", "http://localhost");
    const status = url.searchParams.get("status");
    const dataByStatus: Record<string, unknown[]> = {
      PENDING: [
        {
          id: "mnt-001",
          equipment: "Elevador Social",
          equipmentId: "eq-001",
          type: "PREVENTIVE",
          status: "PENDING",
          scheduledDate: "2026-06-01T00:00:00.000Z",
          description: "Preventive maintenance",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          createdBy: "contract",
        },
      ],
      OVERDUE: [],
      COMPLETED: [
        {
          id: "mnt-002",
          equipment: "Bomba",
          equipmentId: "eq-002",
          type: "CORRECTIVE",
          status: "COMPLETED",
          scheduledDate: "2026-05-01T00:00:00.000Z",
          completedDate: "2026-05-02T00:00:00.000Z",
          description: "Corrective maintenance",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          createdBy: "contract",
        },
      ],
    };
    const data = dataByStatus[status ?? ""] ?? [];
    return {
      body: {
        data,
        pageInfo: { total: data.length, page: 1, pageSize: Number(url.searchParams.get("pageSize") ?? 20), totalPages: 1 },
      },
    };
  },
});

const warranty = await startStub(18085, {
  "GET /warranties": (req) => {
    const url = new URL(req.url ?? "/warranties", "http://localhost");
    const status = url.searchParams.get("status");
    const total = status === "EXPIRING" ? 2 : 0;
    return {
      body: {
        data: [],
        pageInfo: { total, page: 1, pageSize: Number(url.searchParams.get("pageSize") ?? 20), totalPages: total > 0 ? 1 : 0 },
      },
    };
  },
});

const notification = await startStub(18088, {
  "GET /notifications": () => ({
    body: [
      {
        id: "not-001",
        condominiumId: "22222222-2222-2222-2222-222222222222",
        userId: "11111111-1111-1111-1111-111111111111",
        type: "MAINTENANCE_PENDING",
        title: "Maintenance pending",
        description: "Maintenance pending",
        severity: "MEDIUM",
        date: "2026-01-01T00:00:00.000Z",
        read: false,
      },
      {
        id: "not-002",
        condominiumId: "22222222-2222-2222-2222-222222222222",
        userId: "11111111-1111-1111-1111-111111111111",
        type: "WARRANTY_EXPIRING",
        title: "Warranty expiring",
        description: "Warranty expiring",
        severity: "LOW",
        date: "2026-01-01T00:00:00.000Z",
        read: true,
      },
    ],
  }),
});

const parking = await startStub(18086, {
  "GET /parking/apartments": () => ({
    body: [
      {
        id: "apt-001",
        condominiumId: "22222222-2222-2222-2222-222222222222",
        unit: "101",
        block: "A",
        floor: 1,
        ownerName: "Maria Silva",
        ownerDocument: "12345678900",
        ownerPhone: "11999998888",
        ownerEmail: "maria@example.com",
        isRented: true,
        tenantName: "Joao Santos",
        tenantDocument: "98765432100",
        tenantPhone: "11977776666",
        tenantEmail: "joao@example.com",
        rentalStart: "2026-01-01",
        rentalEnd: "2026-12-31",
        hasVehicle: true,
        observations: "Unit with balcony",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  }),
  "POST /parking/apartments": (_req, raw) => {
    const input = JSON.parse(raw) as Record<string, unknown>;
    return {
      status: 201,
      body: {
        id: "apt-new",
        condominiumId: "22222222-2222-2222-2222-222222222222",
        ...input,
        createdAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:00.000Z",
      },
    };
  },
  "PUT /parking/apartments/apt-001": (_req, raw) => {
    const input = JSON.parse(raw) as Record<string, unknown>;
    return {
      body: {
        id: "apt-001",
        condominiumId: "22222222-2222-2222-2222-222222222222",
        unit: "101",
        block: "A",
        floor: 1,
        ownerName: "Maria Silva",
        ownerDocument: "12345678900",
        ownerPhone: "11999998888",
        ownerEmail: "maria@example.com",
        isRented: true,
        tenantName: "Joao Santos",
        tenantDocument: "98765432100",
        tenantPhone: "11977776666",
        tenantEmail: "joao@example.com",
        rentalStart: "2026-01-01",
        rentalEnd: "2026-12-31",
        hasVehicle: true,
        observations: "Unit with balcony",
        ...input,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:00.000Z",
      },
    };
  },
  "DELETE /parking/apartments/apt-001": () => ({ status: 204, body: null }),
});

try {
  const { resolvers } = await import("./resolvers.js");
  const { typeDefs } = await import("./schema.js");
  const { createDataSources } = await import("./data-sources.js");
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  const withDataSources = (ctx: GraphQLContext): GraphQLContext => {
    ctx.dataSources = createDataSources(ctx);
    return ctx;
  };

  const login = await server.executeOperation(
    {
      query: `#graphql
        mutation login($input: LoginInput!) {
          login(input: $input) {
            token
            user { id email role condominiumId }
          }
        }
      `,
      variables: { input: { email: "admin@equipmap.local", password: "admin123" } },
    },
    { contextValue: withDataSources(realContext()) },
  );

  if (login.body.kind !== "single" || login.body.singleResult.errors?.length) {
    throw new Error(`Auth contract failed: ${JSON.stringify(login.body)}`);
  }

  const token = (login.body.singleResult.data?.login as { token: string }).token;
  const equipments = await server.executeOperation(
    {
      query: `#graphql
        query equipments($pagination: PaginationInput) {
          equipments(pagination: $pagination) {
            pageInfo { total page pageSize totalPages }
            data { id name type status typeLabel statusLabel }
          }
        }
      `,
      variables: { pagination: { page: 1, pageSize: 20 } },
    },
    { contextValue: withDataSources(realContext(token)) },
  );

  if (equipments.body.kind !== "single" || equipments.body.singleResult.errors?.length) {
    throw new Error(`Equipment contract failed: ${JSON.stringify(equipments.body)}`);
  }

  const dashboard = await server.executeOperation(
    {
      query: `#graphql
        query dashboardSummary {
          dashboardSummary {
            condominiumName
            equipmentTotal
            maintenancePendingTotal
            maintenanceOverdueTotal
            warrantyExpiringTotal
            unreadNotificationsTotal
            recentEquipment { id name }
            upcomingMaintenances { id equipment status }
            maintenanceChart { month label completed pending }
          }
        }
      `,
    },
    { contextValue: withDataSources(realContext(token)) },
  );

  if (dashboard.body.kind !== "single" || dashboard.body.singleResult.errors?.length) {
    throw new Error(`Dashboard contract failed: ${JSON.stringify(dashboard.body)}`);
  }

  const summary = dashboard.body.singleResult.data?.dashboardSummary as {
    equipmentTotal: number;
    maintenancePendingTotal: number;
    warrantyExpiringTotal: number;
    unreadNotificationsTotal: number;
    recentEquipment: unknown[];
    upcomingMaintenances: unknown[];
    maintenanceChart: unknown[];
  };

  if (
    summary.equipmentTotal !== 1 ||
    summary.maintenancePendingTotal !== 1 ||
    summary.warrantyExpiringTotal !== 2 ||
    summary.unreadNotificationsTotal !== 1 ||
    summary.recentEquipment.length !== 1 ||
    summary.upcomingMaintenances.length !== 1 ||
    summary.maintenanceChart.length !== 6
  ) {
    throw new Error(`Dashboard summary values are incorrect: ${JSON.stringify(summary)}`);
  }

  // Apartment contract: parkingApartments query (backward compat)
  const parkingApartments = await server.executeOperation(
    {
      query: `#graphql
        query parkingApartments {
          parkingApartments {
            id unit block floor ownerName ownerDocument ownerPhone ownerEmail
            isRented tenantName tenantDocument tenantPhone tenantEmail
            rentalStart rentalEnd hasVehicle observations createdAt updatedAt
          }
        }
      `,
    },
    { contextValue: withDataSources(realContext(token)) },
  );

  if (parkingApartments.body.kind !== "single" || parkingApartments.body.singleResult.errors?.length) {
    throw new Error(`parkingApartments contract failed: ${JSON.stringify(parkingApartments.body)}`);
  }

  const aptList = (parkingApartments.body.singleResult.data?.parkingApartments as Record<string, unknown>[]);
  if (aptList.length !== 1 || aptList[0].ownerName !== "Maria Silva" || aptList[0].isRented !== true
      || aptList[0].tenantName !== "Joao Santos" || aptList[0].hasVehicle !== true
      || aptList[0].ownerPhone !== "11999998888" || aptList[0].observations !== "Unit with balcony") {
    throw new Error(`parkingApartments data mismatch: ${JSON.stringify(aptList)}`);
  }

  // Apartment contract: semantic apartments query alias
  const apartments = await server.executeOperation(
    {
      query: `#graphql
        query apartments {
          apartments {
            id unit block ownerName isRented hasVehicle
          }
        }
      `,
    },
    { contextValue: withDataSources(realContext(token)) },
  );

  if (apartments.body.kind !== "single" || apartments.body.singleResult.errors?.length) {
    throw new Error(`apartments alias contract failed: ${JSON.stringify(apartments.body)}`);
  }

  // Apartment contract: createApartment mutation
  const createApt = await server.executeOperation(
    {
      query: `#graphql
        mutation createApartment($input: CreateApartmentInput!) {
          createApartment(input: $input) {
            id unit block ownerName ownerPhone isRented hasVehicle observations
          }
        }
      `,
      variables: {
        input: {
          unit: "202",
          block: "B",
          floor: 2,
          ownerName: "Carlos Souza",
          ownerPhone: "11988887777",
          ownerEmail: "carlos@example.com",
          isRented: false,
          hasVehicle: true,
          observations: "New unit",
        },
      },
    },
    { contextValue: withDataSources(realContext(token)) },
  );

  if (createApt.body.kind !== "single" || createApt.body.singleResult.errors?.length) {
    throw new Error(`createApartment contract failed: ${JSON.stringify(createApt.body)}`);
  }

  const createdApt = createApt.body.singleResult.data?.createApartment as Record<string, unknown>;
  if (createdApt.ownerName !== "Carlos Souza" || createdApt.unit !== "202" || createdApt.block !== "B") {
    throw new Error(`createApartment response mismatch: ${JSON.stringify(createdApt)}`);
  }

  // Apartment contract: updateApartment mutation
  const updateApt = await server.executeOperation(
    {
      query: `#graphql
        mutation updateApartment($id: ID!, $input: UpdateApartmentInput!) {
          updateApartment(id: $id, input: $input) {
            id unit block ownerName observations
          }
        }
      `,
      variables: {
        id: "apt-001",
        input: { observations: "Updated observations" },
      },
    },
    { contextValue: withDataSources(realContext(token)) },
  );

  if (updateApt.body.kind !== "single" || updateApt.body.singleResult.errors?.length) {
    throw new Error(`updateApartment contract failed: ${JSON.stringify(updateApt.body)}`);
  }

  // Apartment contract: deleteApartment mutation
  const deleteApt = await server.executeOperation(
    {
      query: `#graphql
        mutation deleteApartment($id: ID!) {
          deleteApartment(id: $id)
        }
      `,
      variables: { id: "apt-001" },
    },
    { contextValue: withDataSources(realContext(token)) },
  );

  if (deleteApt.body.kind !== "single" || deleteApt.body.singleResult.errors?.length) {
    throw new Error(`deleteApartment contract failed: ${JSON.stringify(deleteApt.body)}`);
  }

  // Apartment contract: createParkingApartment backward compat mutation
  const createParkingApt = await server.executeOperation(
    {
      query: `#graphql
        mutation createParkingApartment($input: CreateApartmentInput!) {
          createParkingApartment(input: $input) {
            id unit block ownerName hasVehicle
          }
        }
      `,
      variables: {
        input: {
          unit: "303",
          block: "C",
          ownerName: "Legacy User",
          ownerPhone: "11966665555",
          hasVehicle: false,
        },
      },
    },
    { contextValue: withDataSources(realContext(token)) },
  );

  if (createParkingApt.body.kind !== "single" || createParkingApt.body.singleResult.errors?.length) {
    throw new Error(`createParkingApartment compat failed: ${JSON.stringify(createParkingApt.body)}`);
  }

  await server.stop();
  console.log("BFF real-mode contract test passed.");
} finally {
  auth.close();
  condominium.close();
  equipment.close();
  maintenance.close();
  warranty.close();
  notification.close();
  parking.close();
}
