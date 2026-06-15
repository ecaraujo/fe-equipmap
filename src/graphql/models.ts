export type Role = "admin" | "manager" | "viewer";
export type SocialProvider = "google" | "microsoft";

export interface Condominium {
  id: string;
  name: string;
  cnpj?: string;
  address?: string;
  timezone?: string;
  active?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  condominiumId?: string | null;
  condominiumName?: string | null;
  condominiums?: Condominium[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string | null;
  requiresCondominiumSelection?: boolean;
}

export interface AsyncState<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
}

export interface BaseFilters {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditFields {
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | null;
}

export type EquipmentStatus = "Ativo" | "Manutenção" | "Alerta" | "Inativo";
export type EquipmentType = "Climatização" | "Transporte" | "Elétrica" | "Hidráulica" | "Segurança" | "Outros";

export interface Equipment extends AuditFields {
  id: string;
  name: string;
  type: EquipmentType;
  brand: string;
  model: string;
  serialNumber: string;
  patrimonyCode: string;
  location: string;
  status: EquipmentStatus;
  acquisitionDate: string;
  warrantyExpiry: string;
  lastMaintenance?: string | null;
  nextMaintenance: string;
  value: number;
}

export interface DashboardEquipment {
  id: string;
  name: string;
  type: EquipmentType;
  patrimonyCode: string;
  location: string;
  status: EquipmentStatus;
  nextMaintenance: string;
}

export type CreateEquipmentDto = Omit<Equipment, "id" | "patrimonyCode" | "lastMaintenance" | keyof AuditFields>;
export type UpdateEquipmentDto = Partial<CreateEquipmentDto>;
export interface EquipmentFilters extends BaseFilters {
  type?: EquipmentType | "all";
  status?: EquipmentStatus | "all";
}
export const EQUIPMENT_TYPES: EquipmentType[] = ["Climatização", "Transporte", "Elétrica", "Hidráulica", "Segurança", "Outros"];

export type MaintenanceType = "Preventiva" | "Corretiva" | "Preditiva";
export type MaintenanceStatus = "Pendente" | "Em andamento" | "Concluída" | "Atrasada" | "Cancelada";

export interface MaintenanceRecord extends AuditFields {
  id: string;
  equipment: string;
  equipmentId?: string | null;
  type: MaintenanceType;
  status: MaintenanceStatus;
  scheduledDate: string;
  completedDate?: string | null;
  technician?: string | null;
  provider?: string | null;
  description: string;
  cost?: number | null;
  observations?: string | null;
}

export interface DashboardMaintenance {
  id: string;
  equipment: string;
  equipmentId?: string | null;
  type: MaintenanceType;
  status: MaintenanceStatus;
  scheduledDate: string;
  description: string;
}

export interface DashboardMaintenanceBucket {
  month: string;
  label: string;
  completed: number;
  pending: number;
}

export interface DashboardSummary {
  generatedAt: string;
  condominiumId?: string | null;
  condominiumName?: string | null;
  equipmentTotal: number;
  maintenancePendingTotal: number;
  maintenanceOverdueTotal: number;
  warrantyExpiringTotal: number;
  unreadNotificationsTotal: number;
  recentEquipment: DashboardEquipment[];
  upcomingMaintenances: DashboardMaintenance[];
  maintenanceChart: DashboardMaintenanceBucket[];
}

export interface CreateMaintenanceDto {
  equipment: string;
  equipmentId?: string;
  type: MaintenanceType;
  scheduledDate: string;
  technician?: string;
  provider?: string;
  description: string;
}
export type UpdateMaintenanceDto = Partial<CreateMaintenanceDto>;
export interface CompleteMaintenanceDto {
  completedDate: string;
  cost?: number;
  observations?: string;
}
export interface MaintenanceFilters extends BaseFilters {
  status?: MaintenanceStatus | "all";
  type?: MaintenanceType | "all";
}

export type WarrantyType = "Fabricante" | "Fornecedor" | "Estendida" | "Serviço";
export type WarrantyStatus = "Vigente" | "Vencendo" | "Vencida";

export interface Warranty extends AuditFields {
  id: string;
  equipment: string;
  equipmentId?: string | null;
  brand: string;
  model: string;
  serialNumber?: string | null;
  supplier: string;
  supplierContact?: string | null;
  purchaseDate: string;
  warrantyStart: string;
  warrantyEnd: string;
  warrantyMonths: number;
  type: WarrantyType;
  status: WarrantyStatus;
  observations?: string | null;
  documentUrl?: string | null;
}

export interface CreateWarrantyDto {
  equipment: string;
  equipmentId?: string;
  brand: string;
  model: string;
  serialNumber?: string;
  supplier: string;
  supplierContact?: string;
  purchaseDate: string;
  warrantyStart: string;
  warrantyEnd: string;
  warrantyMonths?: number;
  type: WarrantyType;
  observations?: string;
}
export type UpdateWarrantyDto = Partial<CreateWarrantyDto>;
export interface WarrantyFilters extends BaseFilters {
  status?: WarrantyStatus | "all";
  type?: WarrantyType | "all";
}

export type ParkingSpotType = "Padrão" | "Deficiente" | "Moto" | "Especial";
export interface Apartment extends AuditFields {
  id: string;
  unit: string;
  block: string;
  floor?: number | null;
  ownerName: string;
  ownerDocument?: string | null;
  ownerPhone?: string | null;
  ownerEmail?: string | null;
  isRented: boolean;
  tenantName?: string | null;
  tenantDocument?: string | null;
  tenantPhone?: string | null;
  tenantEmail?: string | null;
  rentalStart?: string | null;
  rentalEnd?: string | null;
  hasVehicle: boolean;
  observations?: string | null;
}
export interface ParkingSpot extends AuditFields {
  id: string;
  number: string;
  type: ParkingSpotType;
  covered: boolean;
  floor: string;
  assignedTo?: string | null;
}
export interface LotteryResult extends AuditFields {
  id: string;
  apartmentId: string;
  spotId: string;
  unit: string;
  block: string;
  ownerName: string;
  spotNumber: string;
  spotType: ParkingSpotType;
  seed?: number;
  drawnAt: string;
}
export interface LotterySession extends AuditFields {
  id: string;
  seed: number;
  drawnAt: string;
  results: LotteryResult[];
  undrawnApartments: Apartment[];
}
export type CreateApartmentDto = Omit<Apartment, "id" | keyof AuditFields>;
export type UpdateApartmentDto = Partial<CreateApartmentDto>;
export type CreateSpotDto = Omit<ParkingSpot, "id" | "assignedTo" | keyof AuditFields>;
export type UpdateSpotDto = Partial<CreateSpotDto>;

export type BrigadierRole = "Brigadista" | "Brigadista Chefe" | "Sub-Chefe";
export type NotificationChannel = "whatsapp" | "sms";
export type NotificationStatus = "queued" | "sent" | "failed";
export type CertificationStatus = "valid" | "expiring" | "expired";

export interface Brigadier extends AuditFields {
  id: string;
  name: string;
  apartment: string;
  block: string;
  phone: string;
  role: BrigadierRole;
  certificationDate: string;
  certificationExpiry: string;
  certificationBody: string;
  active: boolean;
  observations?: string | null;
}
export interface NotificationLog extends AuditFields {
  id: string;
  channel: NotificationChannel;
  recipients: string[];
  message: string;
  sentAt: string;
  status: NotificationStatus;
}
export type CreateBrigadierDto = Omit<Brigadier, "id" | keyof AuditFields>;
export type UpdateBrigadierDto = Partial<CreateBrigadierDto>;
export interface SendNotificationDto {
  channel: NotificationChannel;
  recipientIds: string[];
  message: string;
}

export type AppNotificationType = "maintenance_overdue" | "maintenance_pending" | "warranty_expiring" | "warranty_expired";
export type NotificationSeverity = "high" | "medium" | "low";
export interface AppNotification {
  id: string;
  type: AppNotificationType;
  title: string;
  description: string;
  severity: NotificationSeverity;
  date?: string | null;
  read?: boolean;
}
