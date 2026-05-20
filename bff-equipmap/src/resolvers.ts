import { GraphQLScalarType, Kind } from "graphql";
import { signAccessToken } from "./auth.js";
import { badRequest, conflict, forbidden, notFound, unauthorized } from "./errors.js";
import type { GraphQLContext } from "./context.js";
import {
  apartments,
  brigadiers,
  calculateCertificationStatus,
  calculateWarrantyStatus,
  condominiumUsers,
  condominiums,
  createRecord,
  enumLabels,
  equipments,
  lotteryResults,
  lotterySessions,
  maintenances,
  notificationLogs,
  notifications,
  parkingSpots,
  updateRecord,
  users,
  warranties,
  type StoreRecord,
} from "./mock-data.js";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

function requireAuth(ctx: GraphQLContext) {
  if (!ctx.auth) {
    throw unauthorized("Missing or invalid Authorization header", ctx.traceId);
  }

  return ctx.auth;
}

function currentUser(ctx: GraphQLContext): StoreRecord {
  const auth = requireAuth(ctx);
  const user = users.find((item) => item.id === auth.userId);

  if (!user) {
    throw unauthorized("Authenticated user no longer exists", ctx.traceId);
  }

  return hydrateUser(user, auth.condominiumId);
}

function hydrateUser(user: StoreRecord, condominiumId = user.condominiumId): StoreRecord {
  const condominium = condominiums.find((item) => item.id === condominiumId) ?? condominiums[0];
  const userCondominiums = condominiums.filter((item) => user.condominiumIds.includes(item.id));

  return {
    ...user,
    condominiumId,
    condominiumName: condominium.name,
    condominiums: userCondominiums,
  };
}

function tenantFilter<T extends StoreRecord>(items: T[], ctx: GraphQLContext): T[] {
  const auth = requireAuth(ctx);
  return items.filter((item) => item.condominiumId === auth.condominiumId);
}

function findById<T extends StoreRecord>(items: T[], id: string, resource: string, ctx: GraphQLContext): T {
  const item = tenantFilter(items, ctx).find((candidate) => candidate.id === id);
  if (!item) {
    throw notFound(resource, ctx.traceId);
  }

  return item;
}

function paginate<T>(items: T[], pagination?: { page?: number; pageSize?: number }) {
  const page = Math.max(1, pagination?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, pagination?.pageSize ?? 20));
  const start = (page - 1) * pageSize;
  const data = items.slice(start, start + pageSize);

  return {
    data,
    pageInfo: {
      total: items.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
    },
  };
}

function matchesSearch(item: StoreRecord, search?: string): boolean {
  if (!search) {
    return true;
  }

  const needle = search.toLowerCase();
  return Object.values(item).some((value) => String(value ?? "").toLowerCase().includes(needle));
}

function nextPatrimonyCode(): string {
  const max = equipments
    .map((item) => Number(String(item.patrimonyCode).replace("EQ-", "")))
    .filter(Number.isFinite)
    .reduce((acc, value) => Math.max(acc, value), 0);

  return `EQ-${String(max + 1).padStart(4, "0")}`;
}

function assertWriteAllowed(ctx: GraphQLContext): void {
  const auth = requireAuth(ctx);
  if (auth.role === "VIEWER") {
    throw forbidden("Viewer role cannot execute write operations", ctx.traceId);
  }
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], seed: number): T[] {
  const random = seededRandom(seed);
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function buildAuthResponse(user: StoreRecord, condominiumId: string) {
  const hydrated = hydrateUser(user, condominiumId);
  return {
    user: hydrated,
    token: signAccessToken({
      userId: user.id,
      role: user.role,
      condominiumId,
    }),
    refreshToken: "mock-refresh-token",
    requiresCondominiumSelection: user.condominiumIds.length > 1 && !condominiumId,
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
      if ("ownerName" in value && "hasVehicle" in value) return "Apartment";
      if ("number" in value && "covered" in value) return "ParkingSpot";
      if ("drawnAt" in value && "results" in value) return "LotterySession";
      if ("spotNumber" in value) return "LotteryResult";
      if ("certificationExpiry" in value) return "Brigadier";
      if ("sentAt" in value) return "NotificationLog";
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
      return condominiums.filter((item) => parent.condominiumIds.includes(item.id));
    },
  },

  CondominiumUser: {
    condominium(parent: StoreRecord) {
      return condominiums.find((item) => item.id === parent.condominiumId);
    },
  },

  Equipment: {
    typeLabel(parent: StoreRecord) {
      return enumLabels.equipmentType[parent.type as keyof typeof enumLabels.equipmentType];
    },
    statusLabel(parent: StoreRecord) {
      return enumLabels.equipmentStatus[parent.status as keyof typeof enumLabels.equipmentStatus];
    },
  },

  MaintenanceRecord: {
    typeLabel(parent: StoreRecord) {
      return enumLabels.maintenanceType[parent.type as keyof typeof enumLabels.maintenanceType];
    },
    statusLabel(parent: StoreRecord) {
      return enumLabels.maintenanceStatus[parent.status as keyof typeof enumLabels.maintenanceStatus];
    },
  },

  Warranty: {
    status(parent: StoreRecord) {
      return calculateWarrantyStatus(parent.warrantyEnd);
    },
    typeLabel(parent: StoreRecord) {
      return enumLabels.warrantyType[parent.type as keyof typeof enumLabels.warrantyType];
    },
    statusLabel(parent: StoreRecord) {
      const status = calculateWarrantyStatus(parent.warrantyEnd);
      return enumLabels.warrantyStatus[status as keyof typeof enumLabels.warrantyStatus];
    },
  },

  ParkingSpot: {
    typeLabel(parent: StoreRecord) {
      return enumLabels.spotType[parent.type as keyof typeof enumLabels.spotType];
    },
  },

  LotteryResult: {
    spotTypeLabel(parent: StoreRecord) {
      return enumLabels.spotType[parent.spotType as keyof typeof enumLabels.spotType];
    },
  },

  Brigadier: {
    roleLabel(parent: StoreRecord) {
      return enumLabels.brigadierRole[parent.role as keyof typeof enumLabels.brigadierRole];
    },
    certificationStatus(parent: StoreRecord) {
      return calculateCertificationStatus(parent.certificationExpiry);
    },
  },

  Query: {
    me(_: unknown, __: unknown, ctx: GraphQLContext) {
      return currentUser(ctx);
    },
    condominiums(_: unknown, __: unknown, ctx: GraphQLContext) {
      const user = currentUser(ctx);
      return condominiums.filter((item) => user.condominiumIds.includes(item.id));
    },
    condominium(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      currentUser(ctx);
      return condominiums.find((item) => item.id === args.id) ?? null;
    },
    condominiumUsers(_: unknown, args: { condominiumId: string }, ctx: GraphQLContext) {
      currentUser(ctx);
      return condominiumUsers.filter((item) => item.condominiumId === args.condominiumId);
    },
    equipments(_: unknown, args: { filters?: StoreRecord; pagination?: StoreRecord }, ctx: GraphQLContext) {
      const filtered = tenantFilter(equipments, ctx)
        .filter((item) => args.filters?.includeDeleted || !item.deletedAt)
        .filter((item) => matchesSearch(item, args.filters?.search))
        .filter((item) => !args.filters?.type || item.type === args.filters.type)
        .filter((item) => !args.filters?.status || item.status === args.filters.status);
      return paginate(filtered, args.pagination);
    },
    equipment(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      return findById(equipments, args.id, "Equipment", ctx);
    },
    maintenances(_: unknown, args: { filters?: StoreRecord; pagination?: StoreRecord }, ctx: GraphQLContext) {
      const filtered = tenantFilter(maintenances, ctx)
        .filter((item) => matchesSearch(item, args.filters?.search))
        .filter((item) => !args.filters?.type || item.type === args.filters.type)
        .filter((item) => !args.filters?.status || item.status === args.filters.status);
      return paginate(filtered, args.pagination);
    },
    maintenance(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      return findById(maintenances, args.id, "Maintenance", ctx);
    },
    warranties(_: unknown, args: { filters?: StoreRecord; pagination?: StoreRecord }, ctx: GraphQLContext) {
      const filtered = tenantFilter(warranties, ctx)
        .filter((item) => matchesSearch(item, args.filters?.search))
        .filter((item) => !args.filters?.type || item.type === args.filters.type)
        .filter((item) => !args.filters?.status || calculateWarrantyStatus(item.warrantyEnd) === args.filters.status);
      return paginate(filtered, args.pagination);
    },
    warranty(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      return findById(warranties, args.id, "Warranty", ctx);
    },
    parkingApartments(_: unknown, __: unknown, ctx: GraphQLContext) {
      return tenantFilter(apartments, ctx);
    },
    parkingSpots(_: unknown, __: unknown, ctx: GraphQLContext) {
      return tenantFilter(parkingSpots, ctx);
    },
    parkingResults(_: unknown, __: unknown, ctx: GraphQLContext) {
      return tenantFilter(lotteryResults, ctx);
    },
    lotterySessions(_: unknown, __: unknown, ctx: GraphQLContext) {
      return tenantFilter(lotterySessions, ctx);
    },
    brigadiers(_: unknown, args: { filters?: StoreRecord }, ctx: GraphQLContext) {
      return tenantFilter(brigadiers, ctx)
        .filter((item) => matchesSearch(item, args.filters?.search))
        .filter((item) => !args.filters?.role || item.role === args.filters.role)
        .filter(
          (item) =>
            !args.filters?.status || calculateCertificationStatus(item.certificationExpiry) === args.filters.status,
        )
        .filter((item) => args.filters?.active === undefined || item.active === args.filters.active);
    },
    brigadier(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      return findById(brigadiers, args.id, "Brigadier", ctx);
    },
    notificationLogs(_: unknown, __: unknown, ctx: GraphQLContext) {
      return tenantFilter(notificationLogs, ctx);
    },
    notifications(_: unknown, __: unknown, ctx: GraphQLContext) {
      const auth = requireAuth(ctx);
      return notifications.filter(
        (item) => item.condominiumId === auth.condominiumId && item.userId === auth.userId,
      );
    },
  },

  Mutation: {
    login(_: unknown, args: { input: { email: string; password: string } }, ctx: GraphQLContext) {
      const user = users.find((item) => item.email.toLowerCase() === args.input.email.toLowerCase());
      if (!user || args.input.password !== "admin123") {
        throw unauthorized("Invalid credentials", ctx.traceId);
      }

      return buildAuthResponse(user, user.condominiumId);
    },
    socialLogin(_: unknown, args: { input: { provider: string } }) {
      const user = users[0];
      return {
        ...buildAuthResponse(user, user.condominiumId),
        refreshToken: `mock-${args.input.provider.toLowerCase()}-refresh-token`,
      };
    },
    refresh(_: unknown, __: unknown, ctx: GraphQLContext) {
      const user = ctx.auth ? currentUser(ctx) : users[0];
      return buildAuthResponse(user, user.condominiumId);
    },
    logout() {
      return true;
    },
    switchCondominium(_: unknown, args: { condominiumId: string }, ctx: GraphQLContext) {
      const user = currentUser(ctx);
      if (!user.condominiumIds.includes(args.condominiumId)) {
        throw forbidden("User does not belong to requested condominium", ctx.traceId);
      }

      return buildAuthResponse(user, args.condominiumId);
    },
    createCondominium(_: unknown, args: { input: StoreRecord }, ctx: GraphQLContext) {
      assertWriteAllowed(ctx);
      if (condominiums.some((item) => item.cnpj === args.input.cnpj)) {
        throw conflict("CNPJ already exists", ctx.traceId);
      }

      const created = createRecord({ ...args.input, active: true });
      condominiums.push(created);
      return created;
    },
    updateCondominium(_: unknown, args: { id: string; input: StoreRecord }, ctx: GraphQLContext) {
      assertWriteAllowed(ctx);
      const item = condominiums.find((candidate) => candidate.id === args.id);
      if (!item) throw notFound("Condominium", ctx.traceId);
      return updateRecord(item, args.input);
    },
    deleteCondominium(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      assertWriteAllowed(ctx);
      const index = condominiums.findIndex((item) => item.id === args.id);
      if (index < 0) throw notFound("Condominium", ctx.traceId);
      condominiums.splice(index, 1);
      return true;
    },
    addCondominiumUser(_: unknown, args: { condominiumId: string; input: StoreRecord }, ctx: GraphQLContext) {
      assertWriteAllowed(ctx);
      if (
        condominiumUsers.some(
          (item) => item.condominiumId === args.condominiumId && item.userId === args.input.userId,
        )
      ) {
        throw conflict("User already associated with condominium", ctx.traceId);
      }

      const created = createRecord({ ...args.input, condominiumId: args.condominiumId });
      condominiumUsers.push(created);
      return created;
    },
    removeCondominiumUser(_: unknown, args: { condominiumId: string; userId: string }, ctx: GraphQLContext) {
      assertWriteAllowed(ctx);
      const index = condominiumUsers.findIndex(
        (item) => item.condominiumId === args.condominiumId && item.userId === args.userId,
      );
      if (index < 0) throw notFound("Condominium user", ctx.traceId);
      condominiumUsers.splice(index, 1);
      return true;
    },
    createEquipment(_: unknown, args: { input: StoreRecord }, ctx: GraphQLContext) {
      const auth = requireAuth(ctx);
      assertWriteAllowed(ctx);
      if (args.input.value < 0) {
        throw badRequest("Equipment value must be greater than or equal to zero", [], ctx.traceId);
      }

      const created = createRecord({
        ...args.input,
        condominiumId: auth.condominiumId,
        patrimonyCode: nextPatrimonyCode(),
        lastMaintenance: null,
        deletedAt: null,
      });
      equipments.unshift(created);
      return created;
    },
    updateEquipment(_: unknown, args: { id: string; input: StoreRecord }, ctx: GraphQLContext) {
      assertWriteAllowed(ctx);
      return updateRecord(findById(equipments, args.id, "Equipment", ctx), args.input);
    },
    deleteEquipment(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      assertWriteAllowed(ctx);
      updateRecord(findById(equipments, args.id, "Equipment", ctx), { deletedAt: new Date().toISOString() });
      return true;
    },
    createMaintenance(_: unknown, args: { input: StoreRecord }, ctx: GraphQLContext) {
      const auth = requireAuth(ctx);
      assertWriteAllowed(ctx);
      const created = createRecord({
        ...args.input,
        condominiumId: auth.condominiumId,
        status: "PENDING",
        completedDate: null,
        cost: null,
        observations: null,
      });
      maintenances.unshift(created);
      return created;
    },
    updateMaintenance(_: unknown, args: { id: string; input: StoreRecord }, ctx: GraphQLContext) {
      assertWriteAllowed(ctx);
      return updateRecord(findById(maintenances, args.id, "Maintenance", ctx), args.input);
    },
    completeMaintenance(_: unknown, args: { id: string; input: StoreRecord }, ctx: GraphQLContext) {
      assertWriteAllowed(ctx);
      const record = findById(maintenances, args.id, "Maintenance", ctx);
      return updateRecord(record, { ...args.input, status: "COMPLETED" });
    },
    deleteMaintenance(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      assertWriteAllowed(ctx);
      const index = maintenances.findIndex((item) => item.id === args.id);
      if (index < 0) throw notFound("Maintenance", ctx.traceId);
      maintenances.splice(index, 1);
      return true;
    },
    createWarranty(_: unknown, args: { input: StoreRecord }, ctx: GraphQLContext) {
      const auth = requireAuth(ctx);
      assertWriteAllowed(ctx);
      if (new Date(args.input.warrantyEnd) < new Date(args.input.warrantyStart)) {
        throw badRequest("Warranty end must be after warranty start", [], ctx.traceId);
      }

      const created = createRecord({
        ...args.input,
        condominiumId: auth.condominiumId,
        warrantyMonths: args.input.warrantyMonths ?? 12,
        status: calculateWarrantyStatus(args.input.warrantyEnd),
        documentUrl: null,
      });
      warranties.unshift(created);
      return created;
    },
    updateWarranty(_: unknown, args: { id: string; input: StoreRecord }, ctx: GraphQLContext) {
      assertWriteAllowed(ctx);
      return updateRecord(findById(warranties, args.id, "Warranty", ctx), args.input);
    },
    deleteWarranty(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      assertWriteAllowed(ctx);
      const index = warranties.findIndex((item) => item.id === args.id);
      if (index < 0) throw notFound("Warranty", ctx.traceId);
      warranties.splice(index, 1);
      return true;
    },
    warrantyUploadUrl(_: unknown, args: { warrantyId: string; input: StoreRecord }, ctx: GraphQLContext) {
      assertWriteAllowed(ctx);
      findById(warranties, args.warrantyId, "Warranty", ctx);
      if (args.input.size > MAX_UPLOAD_BYTES) {
        throw badRequest("File exceeds max size", [{ field: "size", message: "Max size is 10MB" }], ctx.traceId);
      }
      if (!ACCEPTED_MIME_TYPES.includes(args.input.contentType)) {
        throw badRequest(
          "Invalid file type",
          [{ field: "contentType", message: ACCEPTED_MIME_TYPES.join(", ") }],
          ctx.traceId,
        );
      }

      return {
        uploadUrl: `https://storage.local/upload/${args.warrantyId}/${encodeURIComponent(args.input.fileName)}`,
        documentUrl: `https://storage.local/warranties/${args.warrantyId}/${encodeURIComponent(args.input.fileName)}`,
        expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
        maxBytes: MAX_UPLOAD_BYTES,
        acceptedMimeTypes: ACCEPTED_MIME_TYPES,
      };
    },
    confirmWarrantyUpload(_: unknown, args: { warrantyId: string; documentUrl: string }, ctx: GraphQLContext) {
      assertWriteAllowed(ctx);
      return updateRecord(findById(warranties, args.warrantyId, "Warranty", ctx), {
        documentUrl: args.documentUrl,
      });
    },
    createParkingApartment(_: unknown, args: { input: StoreRecord }, ctx: GraphQLContext) {
      const auth = requireAuth(ctx);
      assertWriteAllowed(ctx);
      const created = createRecord({ ...args.input, condominiumId: auth.condominiumId });
      apartments.push(created);
      return created;
    },
    updateParkingApartment(_: unknown, args: { id: string; input: StoreRecord }, ctx: GraphQLContext) {
      assertWriteAllowed(ctx);
      return updateRecord(findById(apartments, args.id, "Apartment", ctx), args.input);
    },
    deleteParkingApartment(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      assertWriteAllowed(ctx);
      const index = apartments.findIndex((item) => item.id === args.id);
      if (index < 0) throw notFound("Apartment", ctx.traceId);
      apartments.splice(index, 1);
      return true;
    },
    createParkingSpot(_: unknown, args: { input: StoreRecord }, ctx: GraphQLContext) {
      const auth = requireAuth(ctx);
      assertWriteAllowed(ctx);
      const created = createRecord({ ...args.input, condominiumId: auth.condominiumId, assignedTo: null });
      parkingSpots.push(created);
      return created;
    },
    updateParkingSpot(_: unknown, args: { id: string; input: StoreRecord }, ctx: GraphQLContext) {
      assertWriteAllowed(ctx);
      return updateRecord(findById(parkingSpots, args.id, "Parking spot", ctx), args.input);
    },
    deleteParkingSpot(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      assertWriteAllowed(ctx);
      const index = parkingSpots.findIndex((item) => item.id === args.id);
      if (index < 0) throw notFound("Parking spot", ctx.traceId);
      parkingSpots.splice(index, 1);
      return true;
    },
    executeLottery(_: unknown, args: { input?: { seed?: number } }, ctx: GraphQLContext) {
      const auth = requireAuth(ctx);
      assertWriteAllowed(ctx);
      const seed = args.input?.seed ?? 20260520;
      const availableApartments = tenantFilter(apartments, ctx).filter((item) => item.hasVehicle);
      const availableSpots = tenantFilter(parkingSpots, ctx);

      if (availableApartments.length === 0 || availableSpots.length === 0) {
        throw badRequest("Lottery requires eligible apartments and parking spots", [], ctx.traceId);
      }

      lotteryResults.splice(0, lotteryResults.length, ...[]);
      const shuffledApartments = shuffle(availableApartments, seed);
      const shuffledSpots = shuffle(availableSpots, seed + 1);
      const drawnCount = Math.min(shuffledApartments.length, shuffledSpots.length);
      const drawnAt = new Date().toISOString();
      const results = Array.from({ length: drawnCount }, (_item, index) => {
        const apartment = shuffledApartments[index];
        const spot = shuffledSpots[index];
        return createRecord({
          condominiumId: auth.condominiumId,
          apartmentId: apartment.id,
          spotId: spot.id,
          unit: apartment.unit,
          block: apartment.block,
          ownerName: apartment.ownerName,
          spotNumber: spot.number,
          spotType: spot.type,
          seed,
          drawnAt,
        });
      });

      lotteryResults.push(...results);
      const session = createRecord({
        condominiumId: auth.condominiumId,
        seed,
        drawnAt,
        results,
        undrawnApartments: shuffledApartments.slice(drawnCount),
      });
      lotterySessions.unshift(session);
      return session;
    },
    resetLottery(_: unknown, __: unknown, ctx: GraphQLContext) {
      assertWriteAllowed(ctx);
      lotteryResults.splice(0, lotteryResults.length);
      lotterySessions.splice(0, lotterySessions.length);
      return true;
    },
    createBrigadier(_: unknown, args: { input: StoreRecord }, ctx: GraphQLContext) {
      const auth = requireAuth(ctx);
      assertWriteAllowed(ctx);
      const created = createRecord({ ...args.input, condominiumId: auth.condominiumId });
      brigadiers.push(created);
      return created;
    },
    updateBrigadier(_: unknown, args: { id: string; input: StoreRecord }, ctx: GraphQLContext) {
      assertWriteAllowed(ctx);
      return updateRecord(findById(brigadiers, args.id, "Brigadier", ctx), args.input);
    },
    deleteBrigadier(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      assertWriteAllowed(ctx);
      const index = brigadiers.findIndex((item) => item.id === args.id);
      if (index < 0) throw notFound("Brigadier", ctx.traceId);
      brigadiers.splice(index, 1);
      return true;
    },
    notifyBrigadiers(_: unknown, args: { input: StoreRecord }, ctx: GraphQLContext) {
      const auth = requireAuth(ctx);
      assertWriteAllowed(ctx);
      if (!String(args.input.message).trim()) {
        throw badRequest("Message cannot be empty", [], ctx.traceId);
      }
      const recipients = tenantFilter(brigadiers, ctx).filter(
        (item) => args.input.recipientIds.includes(item.id) && item.active,
      );
      if (recipients.length === 0) {
        throw badRequest("At least one active recipient is required", [], ctx.traceId);
      }

      const created = createRecord({
        condominiumId: auth.condominiumId,
        channel: args.input.channel,
        recipients: recipients.map((item) => item.name),
        message: args.input.message,
        sentAt: new Date().toISOString(),
        status: "SENT",
      });
      notificationLogs.unshift(created);
      return created;
    },
    markNotificationRead(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      const auth = requireAuth(ctx);
      const notification = notifications.find(
        (item) => item.id === args.id && item.userId === auth.userId && item.condominiumId === auth.condominiumId,
      );
      if (!notification) throw notFound("Notification", ctx.traceId);
      notification.read = true;
      return notification;
    },
    markAllNotificationsRead(_: unknown, __: unknown, ctx: GraphQLContext) {
      const auth = requireAuth(ctx);
      const userNotifications = notifications.filter(
        (item) => item.userId === auth.userId && item.condominiumId === auth.condominiumId,
      );
      userNotifications.forEach((item) => {
        item.read = true;
      });
      return userNotifications;
    },
    deleteNotification(_: unknown, args: { id: string }, ctx: GraphQLContext) {
      const auth = requireAuth(ctx);
      const index = notifications.findIndex(
        (item) => item.id === args.id && item.userId === auth.userId && item.condominiumId === auth.condominiumId,
      );
      if (index < 0) throw notFound("Notification", ctx.traceId);
      notifications.splice(index, 1);
      return true;
    },
  },
};
