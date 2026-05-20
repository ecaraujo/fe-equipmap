import { fakerPT_BR as faker } from "@faker-js/faker";
import { v4 as uuid } from "uuid";

export type StoreRecord = Record<string, any>;

const now = "2026-05-20T12:00:00.000Z";
const defaultCondominiumId = "cond-001";
const secondaryCondominiumId = "cond-002";

faker.seed(20260520);

function audit(createdBy = "Seed"): StoreRecord {
  return {
    createdAt: now,
    updatedAt: now,
    createdBy,
  };
}

function future(days: number): string {
  const date = new Date("2026-05-20T12:00:00.000Z");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function past(days: number): string {
  return future(-days);
}

export const enumLabels = {
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
    ACCESSIBLE: "Deficiente",
    MOTORCYCLE: "Moto",
    SPECIAL: "Especial",
  },
  brigadierRole: {
    BRIGADIER: "Brigadista",
    CHIEF: "Brigadista Chefe",
    DEPUTY_CHIEF: "Sub-Chefe",
  },
} as const;

export const users: StoreRecord[] = [
  {
    id: "user-001",
    name: "Ana Martins",
    email: "admin@equipmap.local",
    role: "ADMIN",
    avatar: null,
    condominiumId: defaultCondominiumId,
    condominiumName: "Residencial Horizonte",
    condominiumIds: [defaultCondominiumId, secondaryCondominiumId],
  },
  {
    id: "user-002",
    name: "Carlos Souza",
    email: "manager@equipmap.local",
    role: "MANAGER",
    avatar: null,
    condominiumId: defaultCondominiumId,
    condominiumName: "Residencial Horizonte",
    condominiumIds: [defaultCondominiumId],
  },
];

export const condominiums: StoreRecord[] = [
  {
    id: defaultCondominiumId,
    name: "Residencial Horizonte",
    cnpj: "12.345.678/0001-90",
    address: "Rua das Palmeiras, 1200 - Sao Paulo/SP",
    timezone: "America/Sao_Paulo",
    active: true,
    ...audit(),
  },
  {
    id: secondaryCondominiumId,
    name: "Edificio Jardim Sul",
    cnpj: "98.765.432/0001-10",
    address: "Av. Central, 450 - Sao Paulo/SP",
    timezone: "America/Sao_Paulo",
    active: true,
    ...audit(),
  },
];

export const condominiumUsers: StoreRecord[] = [
  {
    id: "cu-001",
    userId: "user-001",
    condominiumId: defaultCondominiumId,
    name: "Ana Martins",
    email: "admin@equipmap.local",
    role: "ADMIN",
    ...audit(),
  },
  {
    id: "cu-002",
    userId: "user-001",
    condominiumId: secondaryCondominiumId,
    name: "Ana Martins",
    email: "admin@equipmap.local",
    role: "ADMIN",
    ...audit(),
  },
  {
    id: "cu-003",
    userId: "user-002",
    condominiumId: defaultCondominiumId,
    name: "Carlos Souza",
    email: "manager@equipmap.local",
    role: "MANAGER",
    ...audit(),
  },
];

export const equipments: StoreRecord[] = [
  {
    id: "eq-001",
    condominiumId: defaultCondominiumId,
    name: "Elevador Social",
    type: "TRANSPORT",
    brand: "Atlas",
    model: "Schindler 3300",
    serialNumber: "ELV-2021-001",
    patrimonyCode: "EQ-0001",
    location: "Torre A",
    status: "ALERT",
    acquisitionDate: past(1300),
    warrantyExpiry: past(120),
    lastMaintenance: past(90),
    nextMaintenance: past(18),
    value: 185000,
    deletedAt: null,
    ...audit(),
  },
  {
    id: "eq-002",
    condominiumId: defaultCondominiumId,
    name: "Bomba Piscina",
    type: "HYDRAULIC",
    brand: "Dancor",
    model: "PF-22",
    serialNumber: "BMB-8842",
    patrimonyCode: "EQ-0002",
    location: "Casa de maquinas",
    status: "MAINTENANCE",
    acquisitionDate: past(800),
    warrantyExpiry: future(30),
    lastMaintenance: past(70),
    nextMaintenance: future(12),
    value: 7400,
    deletedAt: null,
    ...audit(),
  },
  {
    id: "eq-003",
    condominiumId: defaultCondominiumId,
    name: "CFTV - Camera 03",
    type: "SECURITY",
    brand: "Intelbras",
    model: "VIP 3230",
    serialNumber: "CAM-0303",
    patrimonyCode: "EQ-0003",
    location: "Garagem G1",
    status: "ACTIVE",
    acquisitionDate: past(420),
    warrantyExpiry: future(220),
    lastMaintenance: past(20),
    nextMaintenance: future(60),
    value: 980,
    deletedAt: null,
    ...audit(),
  },
];

export const maintenances: StoreRecord[] = [
  {
    id: "mnt-001",
    condominiumId: defaultCondominiumId,
    equipment: "Elevador Social",
    equipmentId: "eq-001",
    type: "PREVENTIVE",
    status: "OVERDUE",
    scheduledDate: past(18),
    completedDate: null,
    technician: "Joao Pereira",
    provider: "Vertical Elevadores",
    description: "Inspecao mensal e lubrificacao de cabos.",
    cost: null,
    observations: null,
    ...audit(),
  },
  {
    id: "mnt-002",
    condominiumId: defaultCondominiumId,
    equipment: "Bomba Piscina",
    equipmentId: "eq-002",
    type: "CORRECTIVE",
    status: "IN_PROGRESS",
    scheduledDate: future(2),
    completedDate: null,
    technician: "Marina Lopes",
    provider: "AquaTech",
    description: "Troca de selo mecanico.",
    cost: null,
    observations: null,
    ...audit(),
  },
  {
    id: "mnt-003",
    condominiumId: defaultCondominiumId,
    equipment: "CFTV - Camera 03",
    equipmentId: "eq-003",
    type: "PREDICTIVE",
    status: "PENDING",
    scheduledDate: future(15),
    completedDate: null,
    technician: null,
    provider: "Secure Vision",
    description: "Analise preventiva de qualidade de imagem.",
    cost: null,
    observations: null,
    ...audit(),
  },
];

export const warranties: StoreRecord[] = [
  {
    id: "war-001",
    condominiumId: defaultCondominiumId,
    equipment: "Bomba Piscina",
    equipmentId: "eq-002",
    brand: "Dancor",
    model: "PF-22",
    serialNumber: "BMB-8842",
    supplier: "Casa das Bombas",
    supplierContact: "suporte@bombas.local",
    purchaseDate: past(800),
    warrantyStart: past(800),
    warrantyEnd: future(30),
    warrantyMonths: 24,
    type: "MANUFACTURER",
    status: "EXPIRING",
    observations: "Garantia do motor principal.",
    documentUrl: "https://storage.local/warranties/war-001.pdf",
    ...audit(),
  },
  {
    id: "war-002",
    condominiumId: defaultCondominiumId,
    equipment: "Elevador Social",
    equipmentId: "eq-001",
    brand: "Atlas",
    model: "Schindler 3300",
    serialNumber: "ELV-2021-001",
    supplier: "Vertical Elevadores",
    supplierContact: "contratos@vertical.local",
    purchaseDate: past(1300),
    warrantyStart: past(1300),
    warrantyEnd: past(120),
    warrantyMonths: 36,
    type: "SUPPLIER",
    status: "EXPIRED",
    observations: null,
    documentUrl: null,
    ...audit(),
  },
];

export const apartments: StoreRecord[] = Array.from({ length: 12 }, (_, index) => {
  const unit = String(101 + index);
  return {
    id: `apt-${String(index + 1).padStart(3, "0")}`,
    condominiumId: defaultCondominiumId,
    unit,
    block: index < 6 ? "A" : "B",
    ownerName: faker.person.fullName(),
    phone: faker.phone.number({ style: "national" }),
    email: faker.internet.email().toLowerCase(),
    floor: Math.floor(index / 2) + 1,
    hasVehicle: index !== 4,
    ...audit(),
  };
});

export const parkingSpots: StoreRecord[] = Array.from({ length: 10 }, (_, index) => ({
  id: `spot-${String(index + 1).padStart(3, "0")}`,
  condominiumId: defaultCondominiumId,
  number: `G1-${String(index + 1).padStart(2, "0")}`,
  type: index === 0 ? "ACCESSIBLE" : index === 1 ? "MOTORCYCLE" : "STANDARD",
  covered: index < 7,
  floor: "G1",
  assignedTo: null,
  ...audit(),
}));

export const lotterySessions: StoreRecord[] = [];
export const lotteryResults: StoreRecord[] = [];

export const brigadiers: StoreRecord[] = [
  {
    id: "brig-001",
    condominiumId: defaultCondominiumId,
    name: "Roberto Lima",
    apartment: "101",
    block: "A",
    phone: "+55 11 99999-0001",
    role: "CHIEF",
    certificationDate: past(200),
    certificationExpiry: future(40),
    certificationBody: "Corpo de Bombeiros SP",
    active: true,
    observations: "Lider do turno noturno.",
    ...audit(),
  },
  {
    id: "brig-002",
    condominiumId: defaultCondominiumId,
    name: "Fernanda Reis",
    apartment: "204",
    block: "B",
    phone: "+55 11 99999-0002",
    role: "BRIGADIER",
    certificationDate: past(120),
    certificationExpiry: future(200),
    certificationBody: "Corpo de Bombeiros SP",
    active: true,
    observations: null,
    ...audit(),
  },
  {
    id: "brig-003",
    condominiumId: defaultCondominiumId,
    name: "Paulo Nunes",
    apartment: "305",
    block: "B",
    phone: "+55 11 99999-0003",
    role: "DEPUTY_CHIEF",
    certificationDate: past(500),
    certificationExpiry: past(20),
    certificationBody: "Corpo de Bombeiros SP",
    active: false,
    observations: "Afastado temporariamente.",
    ...audit(),
  },
];

export const notificationLogs: StoreRecord[] = [
  {
    id: "log-001",
    condominiumId: defaultCondominiumId,
    channel: "WHATSAPP",
    recipients: ["Roberto Lima", "Fernanda Reis"],
    message: "Simulado de evacuacao hoje as 18h.",
    sentAt: past(3),
    status: "SENT",
    ...audit(),
  },
];

export const notifications: StoreRecord[] = [
  {
    id: "not-001",
    condominiumId: defaultCondominiumId,
    userId: "user-001",
    type: "MAINTENANCE_OVERDUE",
    title: "Elevador Social",
    description: "Manutencao atrasada desde 2026-05-02",
    severity: "HIGH",
    date: past(18),
    read: false,
  },
  {
    id: "not-002",
    condominiumId: defaultCondominiumId,
    userId: "user-001",
    type: "WARRANTY_EXPIRING",
    title: "Bomba Piscina",
    description: "Garantia vence em 30 dias.",
    severity: "MEDIUM",
    date: now,
    read: false,
  },
];

export function createRecord<T extends StoreRecord>(input: T): T {
  return {
    id: uuid(),
    ...input,
    ...audit("Mock API"),
  };
}

export function updateRecord<T extends StoreRecord>(record: T, input: StoreRecord): T {
  Object.assign(record, input, { updatedAt: new Date().toISOString() });
  return record;
}

export function calculateCertificationStatus(expiry: string): string {
  const today = new Date("2026-05-20T00:00:00.000Z").getTime();
  const expires = new Date(expiry).getTime();
  const days = Math.ceil((expires - today) / 86_400_000);

  if (days < 0) {
    return "EXPIRED";
  }

  return days <= 90 ? "EXPIRING" : "VALID";
}

export function calculateWarrantyStatus(warrantyEnd: string): string {
  const today = new Date("2026-05-20T00:00:00.000Z").getTime();
  const expires = new Date(warrantyEnd).getTime();
  const days = Math.ceil((expires - today) / 86_400_000);

  if (days < 0) {
    return "EXPIRED";
  }

  return days <= 90 ? "EXPIRING" : "ACTIVE";
}
