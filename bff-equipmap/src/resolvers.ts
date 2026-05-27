import { GraphQLScalarType, Kind } from "graphql";
import type { GraphQLContext } from "./context.js";
import type { BffDataSources, JsonRecord } from "./data-sources.js";
import { unauthorized } from "./errors.js";

type StoreRecord = JsonRecord;

function real(ctx: GraphQLContext): BffDataSources {
  if (!ctx.dataSources) {
    throw new Error("BFF data sources are not configured");
  }
  return ctx.dataSources;
}

function paginationQuery(pagination?: StoreRecord): StoreRecord {
  return {
    page: pagination?.page,
    pageSize: pagination?.pageSize,
  };
}

function filteredQuery(filters?: StoreRecord, pagination?: StoreRecord): StoreRecord {
  return {
    ...paginationQuery(pagination),
    ...(filters ?? {}),
  };
}

function warrantyMonthsBetween(start?: unknown, end?: unknown): number | undefined {
  if (typeof start !== "string" || typeof end !== "string") return undefined;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return undefined;
  let months = (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12;
  months += endDate.getUTCMonth() - startDate.getUTCMonth();
  if (endDate.getUTCDate() < startDate.getUTCDate()) months -= 1;
  return Math.max(1, months);
}

function createWarrantyBody(input: StoreRecord): StoreRecord {
  return {
    ...input,
    purchaseDate: input.purchaseDate ?? input.warrantyStart,
    warrantyMonths: input.warrantyMonths ?? warrantyMonthsBetween(input.warrantyStart, input.warrantyEnd),
  };
}

function requireAuth(ctx: GraphQLContext) {
  if (!ctx.auth) {
    throw unauthorized("Missing or invalid Authorization header", ctx.traceId);
  }

  return ctx.auth;
}

function requireRealAuth(ctx: GraphQLContext) {
  requireAuth(ctx);
  return real(ctx).requestOptions();
}

async function pageResponse(ctx: GraphQLContext, promise: Promise<unknown>) {
  return real(ctx).page(await promise);
}

function parseUndrawnApartments(value: unknown): StoreRecord[] {
  if (Array.isArray(value)) return value as StoreRecord[];
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as StoreRecord[]) : [];
  } catch {
    return [];
  }
}

function toLocalDate(value: unknown): unknown {
  return typeof value === "string" ? value.slice(0, 10) : value;
}

function toBrigadierServiceRole(role: unknown): unknown {
  const roleMap: Record<string, string> = {
    BRIGADIER: "MEMBER",
    CHIEF: "CHIEF",
    DEPUTY_CHIEF: "SUBSTITUTE",
  };
  return typeof role === "string" ? (roleMap[role] ?? role) : role;
}

function fromBrigadierServiceRole(role: unknown): unknown {
  const roleMap: Record<string, string> = {
    MEMBER: "BRIGADIER",
    CHIEF: "CHIEF",
    SUBSTITUTE: "DEPUTY_CHIEF",
  };
  return typeof role === "string" ? (roleMap[role] ?? role) : role;
}

function brigadierBody(input: StoreRecord): StoreRecord {
  return {
    name: input.name,
    role: toBrigadierServiceRole(input.role),
    phone: input.phone,
    active: input.active,
    certificationDate: toLocalDate(input.certificationDate),
    certificationExpiry: toLocalDate(input.certificationExpiry),
    notes: input.observations ?? input.notes,
  };
}

function notifyBrigadiersBody(input: StoreRecord): StoreRecord {
  return {
    message: input.message,
    channel: input.channel,
    brigadierIds: input.recipientIds ?? input.brigadierIds ?? [],
  };
}

const labels = {
  equipmentType: {
    CLIMATIZATION: "Climatizacao",
    TRANSPORT: "Transporte",
    ELECTRICAL: "Eletrica",
    HYDRAULIC: "Hidraulica",
    SECURITY: "Seguranca",
    OTHER: "Outros",
  },
  equipmentStatus: {
    ACTIVE: "Ativo",
    MAINTENANCE: "Manutencao",
    ALERT: "Alerta",
    INACTIVE: "Inativo",
  },
  maintenanceType: {
    PREVENTIVE: "Preventiva",
    CORRECTIVE: "Corretiva",
    PREDICTIVE: "Preditiva",
  },
  maintenanceStatus: {
    PENDING: "Pendente",
    IN_PROGRESS: "Em andamento",
    COMPLETED: "Concluida",
    OVERDUE: "Atrasada",
    CANCELED: "Cancelada",
  },
  warrantyType: {
    MANUFACTURER: "Fabricante",
    SUPPLIER: "Fornecedor",
    EXTENDED: "Estendida",
    SERVICE: "Servico",
  },
  warrantyStatus: {
    ACTIVE: "Vigente",
    EXPIRING: "Vencendo",
    EXPIRED: "Vencida",
  },
  spotType: {
    STANDARD: "Padrao",
    CAR: "Padrao",
    ACCESSIBLE: "Deficiente",
    MOTORCYCLE: "Moto",
    SPECIAL: "Especial",
    VISITOR: "Especial",
  },
  brigadierRole: {
    BRIGADIER: "Brigadista",
    CHIEF: "Brigadista Chefe",
    DEPUTY_CHIEF: "Sub-Chefe",
  },
};

function labelFor(map: Record<string, string>, key: unknown): string {
  return typeof key === "string" ? (map[key] ?? key) : "";
}

function totalFromPage(page: { pageInfo: JsonRecord }): number {
  const total = page.pageInfo.total;
  return typeof total === "number" ? total : Number(total ?? 0);
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date): string {
  const labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return labels[date.getUTCMonth()] ?? monthKey(date);
}

function lastMonthBuckets(referenceDate: Date, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() - (count - 1 - index), 1));
    return {
      month: monthKey(date),
      label: monthLabel(date),
      completed: 0,
      pending: 0,
    };
  });
}

function buildMaintenanceChart(referenceDate: Date, completed: StoreRecord[], pending: StoreRecord[]) {
  const buckets = lastMonthBuckets(referenceDate, 6);
  const byMonth = new Map(buckets.map((bucket) => [bucket.month, bucket]));

  completed.forEach((record) => {
    const date = parseDate(record.completedDate) ?? parseDate(record.scheduledDate);
    if (!date) return;
    const bucket = byMonth.get(monthKey(date));
    if (bucket) bucket.completed += 1;
  });

  pending.forEach((record) => {
    const date = parseDate(record.scheduledDate);
    if (!date) return;
    const bucket = byMonth.get(monthKey(date));
    if (bucket) bucket.pending += 1;
  });

  return buckets;
}

function byDateField(field: string) {
  return (left: StoreRecord, right: StoreRecord): number => {
    const leftDate = parseDate(left[field])?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const rightDate = parseDate(right[field])?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return leftDate - rightDate;
  };
}

async function dashboardSummary(ctx: GraphQLContext) {
  const dataSources = real(ctx);
  const authOptions = requireRealAuth(ctx);
  const now = new Date();

  const [
    user,
    condominium,
    equipmentPage,
    pendingMaintenancePage,
    overdueMaintenancePage,
    completedMaintenancePage,
    warrantyExpiringPage,
    notifications,
  ] = await Promise.all([
    dataSources.auth.get<StoreRecord>("/auth/me", authOptions),
    ctx.auth?.condominiumId
      ? dataSources.condominium.get<StoreRecord>(`/condominiums/${ctx.auth.condominiumId}`, authOptions)
      : Promise.resolve(null),
    pageResponse(ctx, dataSources.equipment.get("/equipment", {
      ...authOptions,
      query: { page: 1, pageSize: 5 },
    })),
    pageResponse(ctx, dataSources.maintenance.get("/maintenance", {
      ...authOptions,
      query: { status: "PENDING", page: 1, pageSize: 100 },
    })),
    pageResponse(ctx, dataSources.maintenance.get("/maintenance", {
      ...authOptions,
      query: { status: "OVERDUE", page: 1, pageSize: 1 },
    })),
    pageResponse(ctx, dataSources.maintenance.get("/maintenance", {
      ...authOptions,
      query: { status: "COMPLETED", page: 1, pageSize: 100 },
    })),
    pageResponse(ctx, dataSources.warranty.get("/warranties", {
      ...authOptions,
      query: { status: "EXPIRING", page: 1, pageSize: 1 },
    })),
    dataSources.notification.get<StoreRecord[]>("/notifications", authOptions),
  ]);

  const pendingRecords = pendingMaintenancePage.data;

  return {
    generatedAt: now.toISOString(),
    condominiumId: user.condominiumId ?? ctx.auth?.condominiumId ?? null,
    condominiumName: user.condominiumName ?? condominium?.name ?? null,
    equipmentTotal: totalFromPage(equipmentPage),
    maintenancePendingTotal: totalFromPage(pendingMaintenancePage),
    maintenanceOverdueTotal: totalFromPage(overdueMaintenancePage),
    warrantyExpiringTotal: totalFromPage(warrantyExpiringPage),
    unreadNotificationsTotal: notifications.filter((notification) => notification.read !== true).length,
    recentEquipment: equipmentPage.data,
    upcomingMaintenances: [...pendingRecords].sort(byDateField("scheduledDate")).slice(0, 5),
    maintenanceChart: buildMaintenanceChart(now, completedMaintenancePage.data, pendingRecords),
  };
}

export const resolvers = {
  DateTime: new GraphQLScalarType({
    name: "DateTime",
    serialize(value) {
      return value instanceof Date ? value.toISOString() : String(value);
    },
    parseValue(value) {
      return String(value);
    },
    parseLiteral(ast) {
      return ast.kind === Kind.STRING ? ast.value : null;
    },
  }),

  Node: {
    __resolveType(value: StoreRecord) {
      if ("cnpj" in value) return "Condominium";
      if ("patrimonyCode" in value) return "Equipment";
      if ("scheduledDate" in value) return "MaintenanceRecord";
      if ("warrantyEnd" in value) return "Warranty";
      if (("ownerName" in value || "owner" in value) && "hasVehicle" in value) return "Apartment";
      if ("number" in value && "covered" in value) return "ParkingSpot";
      if ("drawnAt" in value && "results" in value) return "LotterySession";
      if ("spotNumber" in value) return "LotteryResult";
      if ("certificationExpiry" in value) return "Brigadier";
      if ("sentAt" in value || "recipientName" in value) return "NotificationLog";
      return null;
    },
  },

  Auditable: {
    __resolveType(value: StoreRecord) {
      return resolvers.Node.__resolveType(value);
    },
  },

  User: {
    condominiums(parent: StoreRecord) {
      return parent.condominiums ?? [];
    },
  },

  CondominiumUser: {
    condominium(parent: StoreRecord, _: unknown, ctx: GraphQLContext) {
      if (parent.condominium) return parent.condominium;
      if (!parent.condominiumId) return null;
      return ctx.loaders?.condominiumById.load(String(parent.condominiumId));
    },
  },

  Equipment: {
    typeLabel(parent: StoreRecord) {
      return parent.typeLabel ?? labelFor(labels.equipmentType, parent.type);
    },
    statusLabel(parent: StoreRecord) {
      return parent.statusLabel ?? labelFor(labels.equipmentStatus, parent.status);
    },
  },

  MaintenanceRecord: {
    typeLabel(parent: StoreRecord) {
      return parent.typeLabel ?? labelFor(labels.maintenanceType, parent.type);
    },
    statusLabel(parent: StoreRecord) {
      return parent.statusLabel ?? labelFor(labels.maintenanceStatus, parent.status);
    },
  },

  Warranty: {
    typeLabel(parent: StoreRecord) {
      return parent.typeLabel ?? labelFor(labels.warrantyType, parent.type);
    },
    statusLabel(parent: StoreRecord) {
      return parent.statusLabel ?? labelFor(labels.warrantyStatus, parent.status);
    },
  },

  ParkingSpot: {
    type(parent: StoreRecord) {
      const reverseMap: Record<string, string> = { CAR: "STANDARD", ACCESSIBLE: "ACCESSIBLE", MOTORCYCLE: "MOTORCYCLE", VISITOR: "SPECIAL" };
      return typeof parent.type === "string" ? (reverseMap[parent.type] ?? parent.type) : parent.type;
    },
    typeLabel(parent: StoreRecord) {
      return parent.typeLabel ?? labelFor(labels.spotType, parent.type);
    },
  },

  Apartment: {
    ownerName(parent: StoreRecord) {
      return parent.ownerName ?? parent.owner;
    },
  },

  LotteryResult: {
    spotType(parent: StoreRecord) {
      const reverseMap: Record<string, string> = { CAR: "STANDARD", ACCESSIBLE: "ACCESSIBLE", MOTORCYCLE: "MOTORCYCLE", VISITOR: "SPECIAL" };
      return typeof parent.spotType === "string" ? (reverseMap[parent.spotType] ?? parent.spotType) : parent.spotType;
    },
    spotTypeLabel(parent: StoreRecord) {
      return parent.spotTypeLabel ?? labelFor(labels.spotType, parent.spotType);
    },
  },

  LotterySession: {
    undrawnApartments(parent: StoreRecord) {
      return parseUndrawnApartments(parent.undrawnApartments);
    },
  },

  Brigadier: {
    role(parent: StoreRecord) {
      return fromBrigadierServiceRole(parent.role);
    },
    apartment(parent: StoreRecord) {
      return parent.apartment ?? "";
    },
    block(parent: StoreRecord) {
      return parent.block ?? "";
    },
    certificationBody(parent: StoreRecord) {
      return parent.certificationBody ?? "N/A";
    },
    observations(parent: StoreRecord) {
      return parent.observations ?? parent.notes;
    },
    roleLabel(parent: StoreRecord) {
      const role = fromBrigadierServiceRole(parent.role);
      return parent.roleLabel ?? labelFor(labels.brigadierRole, role);
    },
  },

  NotificationLog: {
    recipients(parent: StoreRecord) {
      if (Array.isArray(parent.recipients)) return parent.recipients;
      return [parent.recipientName ?? parent.destination].filter(Boolean);
    },
    sentAt(parent: StoreRecord) {
      return parent.sentAt ?? parent.createdAt;
    },
  },

  AppNotification: {
    description(parent: StoreRecord) {
      return parent.description ?? parent.message ?? parent.title;
    },
    date(parent: StoreRecord) {
      return parent.date ?? parent.createdAt;
    },
  },

  Query: {
    me(_: unknown, __: unknown, ctx: GraphQLContext) {
      return real(ctx).auth.get("/auth/me", requireRealAuth(ctx));
    },
    dashboardSummary(_: unknown, __: unknown, ctx: GraphQLContext) {
      return dashboardSummary(ctx);
    },
    condominiums(_: unknown, __: unknown, ctx: GraphQLContext) {
      return real(ctx).condominium.get("/condominiums", requireRealAuth(ctx));
    },
    condominium(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      return ctx.loaders?.condominiumById.load(args.id) ?? real(ctx).condominium.get(`/condominiums/${args.id}`, requireRealAuth(ctx));
    },
    condominiumUsers(_: unknown, args: { condominiumId: string }, ctx: GraphQLContext) {
      return real(ctx).condominium.get(`/condominiums/${args.condominiumId}/users`, requireRealAuth(ctx));
    },
    equipments(_: unknown, args: { filters?: StoreRecord; pagination?: StoreRecord }, ctx: GraphQLContext) {
      return pageResponse(ctx, real(ctx).equipment.get("/equipment", {
        ...requireRealAuth(ctx),
        query: filteredQuery(args.filters, args.pagination),
      }));
    },
    equipment(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      return ctx.loaders?.equipmentById.load(args.id) ?? real(ctx).equipment.get(`/equipment/${args.id}`, requireRealAuth(ctx));
    },
    maintenances(_: unknown, args: { filters?: StoreRecord; pagination?: StoreRecord }, ctx: GraphQLContext) {
      return pageResponse(ctx, real(ctx).maintenance.get("/maintenance", {
        ...requireRealAuth(ctx),
        query: filteredQuery(args.filters, args.pagination),
      }));
    },
    maintenance(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      return real(ctx).maintenance.get(`/maintenance/${args.id}`, requireRealAuth(ctx));
    },
    warranties(_: unknown, args: { filters?: StoreRecord; pagination?: StoreRecord }, ctx: GraphQLContext) {
      return pageResponse(ctx, real(ctx).warranty.get("/warranties", {
        ...requireRealAuth(ctx),
        query: filteredQuery(args.filters, args.pagination),
      }));
    },
    warranty(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      return real(ctx).warranty.get(`/warranties/${args.id}`, requireRealAuth(ctx));
    },
    parkingApartments(_: unknown, __: unknown, ctx: GraphQLContext) {
      return real(ctx).parking.get("/parking/apartments", requireRealAuth(ctx));
    },
    parkingSpots(_: unknown, __: unknown, ctx: GraphQLContext) {
      return real(ctx).parking.get("/parking/spots", requireRealAuth(ctx));
    },
    parkingResults(_: unknown, __: unknown, ctx: GraphQLContext) {
      return real(ctx).parking.get("/parking/lottery", requireRealAuth(ctx)).then((sessions) =>
        (sessions as StoreRecord[]).flatMap((session) => session.results ?? []),
      );
    },
    lotterySessions(_: unknown, __: unknown, ctx: GraphQLContext) {
      return real(ctx).parking.get("/parking/lottery", requireRealAuth(ctx));
    },
    brigadiers(_: unknown, args: { filters?: StoreRecord }, ctx: GraphQLContext) {
      return real(ctx).brigadier.get("/brigadiers", {
        ...requireRealAuth(ctx),
        query: {
          name: args.filters?.search,
          role: toBrigadierServiceRole(args.filters?.role),
          status: args.filters?.status,
        },
      });
    },
    brigadier(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      return real(ctx).brigadier.get(`/brigadiers/${args.id}`, requireRealAuth(ctx));
    },
    notificationLogs(_: unknown, __: unknown, ctx: GraphQLContext) {
      return real(ctx).brigadier.get("/brigadiers/notify/logs", requireRealAuth(ctx));
    },
    notifications(_: unknown, __: unknown, ctx: GraphQLContext) {
      return real(ctx).notification.get("/notifications", requireRealAuth(ctx));
    },
  },

  Mutation: {
    login(_: unknown, args: { input: StoreRecord }, ctx: GraphQLContext) {
      return real(ctx).auth.post("/auth/login", real(ctx).requestOptions({ body: args.input }));
    },
    socialLogin(_: unknown, args: { input: { provider: string } }, ctx: GraphQLContext) {
      const provider = args.input.provider.toLowerCase();
      return real(ctx).auth.post(`/auth/social/${provider}`, real(ctx).requestOptions({ body: args.input }));
    },
    refresh(_: unknown, __: unknown, ctx: GraphQLContext) {
      return real(ctx).auth.post("/auth/refresh", real(ctx).requestOptions());
    },
    logout(_: unknown, __: unknown, ctx: GraphQLContext) {
      return real(ctx).auth.post("/auth/logout", real(ctx).requestOptions()).then(() => true);
    },
    switchCondominium(_: unknown, args: { condominiumId: string }, ctx: GraphQLContext) {
      return real(ctx).auth.post("/auth/switch-condominium", real(ctx).requestOptions({ body: args }));
    },
    createCondominium(_: unknown, args: { input: StoreRecord }, ctx: GraphQLContext) {
      return real(ctx).condominium.post("/condominiums", { ...requireRealAuth(ctx), body: args.input });
    },
    updateCondominium(_: unknown, args: { id: string; input: StoreRecord }, ctx: GraphQLContext) {
      return real(ctx).condominium.put(`/condominiums/${args.id}`, { ...requireRealAuth(ctx), body: args.input });
    },
    deleteCondominium(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      return real(ctx).condominium.delete(`/condominiums/${args.id}`, requireRealAuth(ctx));
    },
    addCondominiumUser(_: unknown, args: { condominiumId: string; input: StoreRecord }, ctx: GraphQLContext) {
      return real(ctx).condominium.post(`/condominiums/${args.condominiumId}/users`, {
        ...requireRealAuth(ctx),
        body: args.input,
      });
    },
    removeCondominiumUser(_: unknown, args: { condominiumId: string; userId: string }, ctx: GraphQLContext) {
      return real(ctx).condominium.delete(`/condominiums/${args.condominiumId}/users/${args.userId}`, requireRealAuth(ctx));
    },
    createEquipment(_: unknown, args: { input: StoreRecord }, ctx: GraphQLContext) {
      return real(ctx).equipment.post("/equipment", { ...requireRealAuth(ctx), body: args.input });
    },
    updateEquipment(_: unknown, args: { id: string; input: StoreRecord }, ctx: GraphQLContext) {
      return real(ctx).equipment.put(`/equipment/${args.id}`, { ...requireRealAuth(ctx), body: args.input });
    },
    deleteEquipment(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      return real(ctx).equipment.delete(`/equipment/${args.id}`, requireRealAuth(ctx));
    },
    createMaintenance(_: unknown, args: { input: StoreRecord }, ctx: GraphQLContext) {
      return real(ctx).maintenance.post("/maintenance", { ...requireRealAuth(ctx), body: args.input });
    },
    updateMaintenance(_: unknown, args: { id: string; input: StoreRecord }, ctx: GraphQLContext) {
      return real(ctx).maintenance.put(`/maintenance/${args.id}`, { ...requireRealAuth(ctx), body: args.input });
    },
    completeMaintenance(_: unknown, args: { id: string; input: StoreRecord }, ctx: GraphQLContext) {
      return real(ctx).maintenance.patch(`/maintenance/${args.id}/complete`, { ...requireRealAuth(ctx), body: args.input });
    },
    deleteMaintenance(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      return real(ctx).maintenance.delete(`/maintenance/${args.id}`, requireRealAuth(ctx));
    },
    createWarranty(_: unknown, args: { input: StoreRecord }, ctx: GraphQLContext) {
      return real(ctx).warranty.post("/warranties", { ...requireRealAuth(ctx), body: createWarrantyBody(args.input) });
    },
    updateWarranty(_: unknown, args: { id: string; input: StoreRecord }, ctx: GraphQLContext) {
      return real(ctx).warranty.put(`/warranties/${args.id}`, { ...requireRealAuth(ctx), body: args.input });
    },
    deleteWarranty(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      return real(ctx).warranty.delete(`/warranties/${args.id}`, requireRealAuth(ctx));
    },
    warrantyUploadUrl(_: unknown, args: { warrantyId: string; input: StoreRecord }, ctx: GraphQLContext) {
      return real(ctx).warranty.post(`/warranties/${args.warrantyId}/upload-url`, {
        ...requireRealAuth(ctx),
        body: args.input,
      });
    },
    confirmWarrantyUpload(_: unknown, args: { warrantyId: string; documentUrl: string }, ctx: GraphQLContext) {
      return real(ctx).warranty.post(`/warranties/${args.warrantyId}/confirm-upload`, {
        ...requireRealAuth(ctx),
        body: { documentUrl: args.documentUrl },
      });
    },
    createParkingApartment(_: unknown, args: { input: StoreRecord }, ctx: GraphQLContext) {
      const { ownerName, phone: _phone, email: _email, floor: _floor, ...rest } = args.input as Record<string, unknown>;
      const body = { ...rest, owner: ownerName };
      return real(ctx).parking.post("/parking/apartments", { ...requireRealAuth(ctx), body });
    },
    updateParkingApartment(_: unknown, args: { id: string; input: StoreRecord }, ctx: GraphQLContext) {
      const { ownerName, phone: _phone, email: _email, floor: _floor, ...rest } = args.input as Record<string, unknown>;
      const body = ownerName !== undefined ? { ...rest, owner: ownerName } : rest;
      return real(ctx).parking.put(`/parking/apartments/${args.id}`, { ...requireRealAuth(ctx), body });
    },
    deleteParkingApartment(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      return real(ctx).parking.delete(`/parking/apartments/${args.id}`, requireRealAuth(ctx));
    },
    createParkingSpot(_: unknown, args: { input: StoreRecord }, ctx: GraphQLContext) {
      const spotTypeMap: Record<string, string> = { STANDARD: "CAR", ACCESSIBLE: "ACCESSIBLE", MOTORCYCLE: "MOTORCYCLE", SPECIAL: "VISITOR" };
      const { type, number } = args.input as Record<string, unknown>;
      const body = { number, type: spotTypeMap[type as string] ?? type };
      return real(ctx).parking.post("/parking/spots", { ...requireRealAuth(ctx), body });
    },
    updateParkingSpot(_: unknown, args: { id: string; input: StoreRecord }, ctx: GraphQLContext) {
      return real(ctx).parking.put(`/parking/spots/${args.id}`, { ...requireRealAuth(ctx), body: args.input });
    },
    deleteParkingSpot(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      return real(ctx).parking.delete(`/parking/spots/${args.id}`, requireRealAuth(ctx));
    },
    executeLottery(_: unknown, args: { input?: StoreRecord }, ctx: GraphQLContext) {
      return real(ctx).parking.post("/parking/lottery", { ...requireRealAuth(ctx), body: args.input ?? null });
    },
    resetLottery(_: unknown, __: unknown, ctx: GraphQLContext) {
      return real(ctx).parking.delete("/parking/lottery", requireRealAuth(ctx));
    },
    createBrigadier(_: unknown, args: { input: StoreRecord }, ctx: GraphQLContext) {
      return real(ctx).brigadier.post("/brigadiers", { ...requireRealAuth(ctx), body: brigadierBody(args.input) });
    },
    updateBrigadier(_: unknown, args: { id: string; input: StoreRecord }, ctx: GraphQLContext) {
      return real(ctx).brigadier.put(`/brigadiers/${args.id}`, { ...requireRealAuth(ctx), body: brigadierBody(args.input) });
    },
    deleteBrigadier(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      return real(ctx).brigadier.delete(`/brigadiers/${args.id}`, requireRealAuth(ctx));
    },
    notifyBrigadiers(_: unknown, args: { input: StoreRecord }, ctx: GraphQLContext) {
      return real(ctx).brigadier
        .post("/brigadiers/notify", { ...requireRealAuth(ctx), body: notifyBrigadiersBody(args.input) })
        .then(() => real(ctx).brigadier.get<StoreRecord[]>("/brigadiers/notify/logs", requireRealAuth(ctx)))
        .then((logs) => logs.find((log) => log.message === args.input.message) ?? logs[0]);
    },
    markNotificationRead(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      return real(ctx).notification.patch(`/notifications/${args.id}/read`, requireRealAuth(ctx));
    },
    markAllNotificationsRead(_: unknown, __: unknown, ctx: GraphQLContext) {
      return real(ctx).notification.patch<{ updatedCount: number }>("/notifications/read-all", requireRealAuth(ctx)).then(() =>
        real(ctx).notification.get("/notifications", requireRealAuth(ctx)),
      );
    },
    deleteNotification(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      return real(ctx).notification.delete(`/notifications/${args.id}`, requireRealAuth(ctx));
    },
  },
};
