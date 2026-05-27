import {
  AppNotificationType,
  BrigadierRole,
  CertificationStatus,
  EquipmentStatus,
  EquipmentType,
  MaintenanceStatus,
  MaintenanceType,
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationSeverity,
  ParkingSpotType,
  Role,
  WarrantyStatus,
  WarrantyType,
  type Apartment,
  type AppNotification,
  type Brigadier,
  type Condominium,
  type Equipment,
  type LotteryResult,
  type MaintenanceRecord,
  type NotificationLog,
  type ParkingSpot,
  type User,
  type Warranty,
  type DashboardSummaryQuery,
} from "./generated";

function formatDate(value?: string | null): string {
  if (!value) return "";
  if (/^\d{2}\/\d{2}\/\d{4}/.test(value)) return value;
  const apiDate = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (apiDate) return `${apiDate[3]}/${apiDate[2]}/${apiDate[1]}`;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

const roleMap: Record<Role, "admin" | "manager" | "viewer"> = {
  ADMIN: "admin",
  MANAGER: "manager",
  VIEWER: "viewer",
};

const equipmentTypeMap: Record<EquipmentType, import("./models").EquipmentType> = {
  CLIMATIZATION: "Climatização",
  TRANSPORT: "Transporte",
  ELECTRICAL: "Elétrica",
  HYDRAULIC: "Hidráulica",
  SECURITY: "Segurança",
  OTHER: "Outros",
};

const equipmentStatusMap: Record<EquipmentStatus, import("./models").EquipmentStatus> = {
  ACTIVE: "Ativo",
  MAINTENANCE: "Manutenção",
  ALERT: "Alerta",
  INACTIVE: "Inativo",
};

const maintenanceTypeMap: Record<MaintenanceType, import("./models").MaintenanceType> = {
  PREVENTIVE: "Preventiva",
  CORRECTIVE: "Corretiva",
  PREDICTIVE: "Preditiva",
};

const maintenanceStatusMap: Record<MaintenanceStatus, import("./models").MaintenanceStatus> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
  OVERDUE: "Atrasada",
  CANCELED: "Cancelada",
};

const warrantyTypeMap: Record<WarrantyType, import("./models").WarrantyType> = {
  MANUFACTURER: "Fabricante",
  SUPPLIER: "Fornecedor",
  EXTENDED: "Estendida",
  SERVICE: "Serviço",
};

const warrantyStatusMap: Record<WarrantyStatus, import("./models").WarrantyStatus> = {
  ACTIVE: "Vigente",
  EXPIRING: "Vencendo",
  EXPIRED: "Vencida",
};

const spotTypeMap: Record<ParkingSpotType, import("./models").ParkingSpotType> = {
  STANDARD: "Padrão",
  ACCESSIBLE: "Deficiente",
  MOTORCYCLE: "Moto",
  SPECIAL: "Especial",
};

const brigadierRoleMap: Record<BrigadierRole, import("./models").BrigadierRole> = {
  BRIGADIER: "Brigadista",
  CHIEF: "Brigadista Chefe",
  DEPUTY_CHIEF: "Sub-Chefe",
};

const notificationTypeMap: Record<AppNotificationType, import("./models").AppNotificationType> = {
  MAINTENANCE_OVERDUE: "maintenance_overdue",
  MAINTENANCE_PENDING: "maintenance_pending",
  WARRANTY_EXPIRING: "warranty_expiring",
  WARRANTY_EXPIRED: "warranty_expired",
};

const severityMap: Record<NotificationSeverity, import("./models").NotificationSeverity> = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

const channelMap: Record<NotificationChannel, import("./models").NotificationChannel> = {
  WHATSAPP: "whatsapp",
  SMS: "sms",
};

const deliveryStatusMap: Record<NotificationDeliveryStatus, import("./models").NotificationStatus> = {
  SENT: "sent",
  FAILED: "failed",
};

export function mapUser(user: Pick<User, "id" | "name" | "email" | "role" | "avatar" | "condominiumId" | "condominiumName"> & { condominiums?: Pick<Condominium, "id" | "name" | "cnpj" | "address" | "timezone" | "active">[] }): import("./models").User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: roleMap[user.role],
    avatar: user.avatar,
    condominiumId: user.condominiumId,
    condominiumName: user.condominiumName,
    condominiums: user.condominiums?.map((item) => ({ ...item })),
  };
}

export function mapEquipment(item: Pick<Equipment, "id" | "name" | "type" | "brand" | "model" | "serialNumber" | "patrimonyCode" | "location" | "status" | "acquisitionDate" | "warrantyExpiry" | "lastMaintenance" | "nextMaintenance" | "value" | "createdAt" | "updatedAt" | "createdBy">): import("./models").Equipment {
  return {
    ...item,
    type: equipmentTypeMap[item.type],
    status: equipmentStatusMap[item.status],
    acquisitionDate: formatDate(item.acquisitionDate),
    warrantyExpiry: formatDate(item.warrantyExpiry),
    lastMaintenance: formatDate(item.lastMaintenance),
    nextMaintenance: formatDate(item.nextMaintenance),
  };
}

export function mapMaintenance(item: Pick<MaintenanceRecord, "id" | "equipment" | "equipmentId" | "type" | "status" | "scheduledDate" | "completedDate" | "technician" | "provider" | "description" | "cost" | "observations" | "createdAt" | "updatedAt" | "createdBy">): import("./models").MaintenanceRecord {
  return {
    ...item,
    equipmentId: item.equipmentId,
    type: maintenanceTypeMap[item.type],
    status: maintenanceStatusMap[item.status],
    scheduledDate: formatDate(item.scheduledDate),
    completedDate: formatDate(item.completedDate),
  };
}

export function mapDashboardSummary(summary: DashboardSummaryQuery["dashboardSummary"]): import("./models").DashboardSummary {
  return {
    generatedAt: summary.generatedAt,
    condominiumId: summary.condominiumId,
    condominiumName: summary.condominiumName,
    equipmentTotal: summary.equipmentTotal,
    maintenancePendingTotal: summary.maintenancePendingTotal,
    maintenanceOverdueTotal: summary.maintenanceOverdueTotal,
    warrantyExpiringTotal: summary.warrantyExpiringTotal,
    unreadNotificationsTotal: summary.unreadNotificationsTotal,
    recentEquipment: summary.recentEquipment.map((item) => ({
      id: item.id,
      name: item.name,
      type: equipmentTypeMap[item.type],
      patrimonyCode: item.patrimonyCode,
      location: item.location,
      status: equipmentStatusMap[item.status],
      nextMaintenance: formatDate(item.nextMaintenance),
    })),
    upcomingMaintenances: summary.upcomingMaintenances.map((item) => ({
      id: item.id,
      equipment: item.equipment,
      equipmentId: item.equipmentId,
      type: maintenanceTypeMap[item.type],
      status: maintenanceStatusMap[item.status],
      scheduledDate: formatDate(item.scheduledDate),
      description: item.description,
    })),
    maintenanceChart: summary.maintenanceChart.map((item) => ({ ...item })),
  };
}

export function mapWarranty(item: Pick<Warranty, "id" | "equipment" | "equipmentId" | "brand" | "model" | "serialNumber" | "supplier" | "supplierContact" | "purchaseDate" | "warrantyStart" | "warrantyEnd" | "warrantyMonths" | "type" | "status" | "observations" | "documentUrl" | "createdAt" | "updatedAt" | "createdBy">): import("./models").Warranty {
  return {
    ...item,
    type: warrantyTypeMap[item.type],
    status: warrantyStatusMap[item.status],
    purchaseDate: formatDate(item.purchaseDate),
    warrantyStart: formatDate(item.warrantyStart),
    warrantyEnd: formatDate(item.warrantyEnd),
  };
}

export function mapApartment(item: Pick<Apartment, "id" | "unit" | "block" | "ownerName" | "phone" | "email" | "floor" | "hasVehicle" | "createdAt" | "updatedAt" | "createdBy">): import("./models").Apartment {
  return { ...item };
}

export function mapSpot(item: Pick<ParkingSpot, "id" | "number" | "type" | "covered" | "floor" | "assignedTo" | "createdAt" | "updatedAt" | "createdBy">): import("./models").ParkingSpot {
  return { ...item, type: spotTypeMap[item.type] };
}

export function mapLotteryResult(item: Pick<LotteryResult, "id" | "apartmentId" | "spotId" | "unit" | "block" | "ownerName" | "spotNumber" | "spotType" | "seed" | "drawnAt" | "createdAt" | "updatedAt" | "createdBy">): import("./models").LotteryResult {
  return { ...item, spotType: spotTypeMap[item.spotType], drawnAt: formatDate(item.drawnAt) };
}

export function mapBrigadier(item: Pick<Brigadier, "id" | "name" | "apartment" | "block" | "phone" | "role" | "certificationDate" | "certificationExpiry" | "certificationBody" | "active" | "observations" | "createdAt" | "updatedAt" | "createdBy">): import("./models").Brigadier {
  return {
    ...item,
    role: brigadierRoleMap[item.role],
    certificationDate: formatDate(item.certificationDate),
    certificationExpiry: formatDate(item.certificationExpiry),
  };
}

export function mapNotificationLog(item: Pick<NotificationLog, "id" | "channel" | "recipients" | "message" | "sentAt" | "status" | "createdAt" | "updatedAt" | "createdBy">): import("./models").NotificationLog {
  return { ...item, channel: channelMap[item.channel], status: deliveryStatusMap[item.status], sentAt: formatDate(item.sentAt) };
}

export function mapNotification(item: Pick<AppNotification, "id" | "type" | "title" | "description" | "severity" | "date" | "read">): import("./models").AppNotification {
  return {
    ...item,
    type: notificationTypeMap[item.type],
    severity: severityMap[item.severity],
    date: formatDate(item.date),
  };
}
