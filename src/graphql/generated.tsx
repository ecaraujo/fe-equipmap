/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client/react';
const defaultOptions = {} as const;
export type AppNotificationType =
  | 'MAINTENANCE_OVERDUE'
  | 'MAINTENANCE_PENDING'
  | 'WARRANTY_EXPIRED'
  | 'WARRANTY_EXPIRING';

export type BrigadierFilters = {
  active?: boolean | null | undefined;
  role?: BrigadierRole | null | undefined;
  search?: string | null | undefined;
  status?: CertificationStatus | null | undefined;
};

export type BrigadierRole =
  | 'BRIGADIER'
  | 'CHIEF'
  | 'DEPUTY_CHIEF';

export type CertificationStatus =
  | 'EXPIRED'
  | 'EXPIRING'
  | 'VALID';

export type CompleteMaintenanceInput = {
  completedDate: string;
  cost?: number | null | undefined;
  observations?: string | null | undefined;
};

export type CreateApartmentInput = {
  block: string;
  floor?: number | null | undefined;
  hasVehicle: boolean;
  isRented?: boolean | null | undefined;
  observations?: string | null | undefined;
  ownerDocument?: string | null | undefined;
  ownerEmail?: string | null | undefined;
  ownerName: string;
  ownerPhone?: string | null | undefined;
  rentalEnd?: string | null | undefined;
  rentalStart?: string | null | undefined;
  tenantDocument?: string | null | undefined;
  tenantEmail?: string | null | undefined;
  tenantName?: string | null | undefined;
  tenantPhone?: string | null | undefined;
  unit: string;
};

export type CreateBrigadierInput = {
  active: boolean;
  apartment: string;
  block: string;
  certificationBody: string;
  certificationDate: string;
  certificationExpiry: string;
  name: string;
  observations?: string | null | undefined;
  phone: string;
  role: BrigadierRole;
};

export type CreateEquipmentInput = {
  acquisitionDate: string;
  brand: string;
  location: string;
  model: string;
  name: string;
  nextMaintenance: string;
  serialNumber: string;
  status?: EquipmentStatus | null | undefined;
  type: EquipmentType;
  value: number;
  warrantyExpiry: string;
};

export type CreateMaintenanceInput = {
  description: string;
  equipment: string;
  equipmentId?: string | number | null | undefined;
  provider?: string | null | undefined;
  scheduledDate: string;
  technician?: string | null | undefined;
  type: MaintenanceType;
};

export type CreateParkingSpotInput = {
  covered: boolean;
  floor: string;
  number: string;
  type: ParkingSpotType;
};

export type CreateWarrantyInput = {
  brand: string;
  equipment: string;
  equipmentId?: string | number | null | undefined;
  model: string;
  observations?: string | null | undefined;
  purchaseDate: string;
  serialNumber?: string | null | undefined;
  supplier: string;
  supplierContact?: string | null | undefined;
  type: WarrantyType;
  warrantyEnd: string;
  warrantyMonths: number;
  warrantyStart: string;
};

export type EquipmentFilters = {
  includeDeleted?: boolean | null | undefined;
  search?: string | null | undefined;
  status?: EquipmentStatus | null | undefined;
  type?: EquipmentType | null | undefined;
};

export type EquipmentStatus =
  | 'ACTIVE'
  | 'ALERT'
  | 'INACTIVE'
  | 'MAINTENANCE';

export type EquipmentType =
  | 'CLIMATIZATION'
  | 'ELECTRICAL'
  | 'HYDRAULIC'
  | 'OTHER'
  | 'SECURITY'
  | 'TRANSPORT';

export type ExecuteLotteryInput = {
  seed?: number | null | undefined;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type MaintenanceFilters = {
  search?: string | null | undefined;
  status?: MaintenanceStatus | null | undefined;
  type?: MaintenanceType | null | undefined;
};

export type MaintenanceStatus =
  | 'CANCELED'
  | 'COMPLETED'
  | 'IN_PROGRESS'
  | 'OVERDUE'
  | 'PENDING';

export type MaintenanceType =
  | 'CORRECTIVE'
  | 'PREDICTIVE'
  | 'PREVENTIVE';

export type NotificationChannel =
  | 'SMS'
  | 'WHATSAPP';

export type NotificationDeliveryStatus =
  | 'FAILED'
  | 'QUEUED'
  | 'SENT';

export type NotificationSeverity =
  | 'HIGH'
  | 'LOW'
  | 'MEDIUM';

export type NotifyBrigadiersInput = {
  channel: NotificationChannel;
  message: string;
  recipientIds: Array<string | number>;
};

export type PaginationInput = {
  page?: number | null | undefined;
  pageSize?: number | null | undefined;
};

export type ParkingSpotType =
  | 'ACCESSIBLE'
  | 'MOTORCYCLE'
  | 'SPECIAL'
  | 'STANDARD';

export type Role =
  | 'ADMIN'
  | 'MANAGER'
  | 'VIEWER';

export type UpdateApartmentInput = {
  block?: string | null | undefined;
  floor?: number | null | undefined;
  hasVehicle?: boolean | null | undefined;
  isRented?: boolean | null | undefined;
  observations?: string | null | undefined;
  ownerDocument?: string | null | undefined;
  ownerEmail?: string | null | undefined;
  ownerName?: string | null | undefined;
  ownerPhone?: string | null | undefined;
  rentalEnd?: string | null | undefined;
  rentalStart?: string | null | undefined;
  tenantDocument?: string | null | undefined;
  tenantEmail?: string | null | undefined;
  tenantName?: string | null | undefined;
  tenantPhone?: string | null | undefined;
  unit?: string | null | undefined;
};

export type UpdateBrigadierInput = {
  active?: boolean | null | undefined;
  apartment?: string | null | undefined;
  block?: string | null | undefined;
  certificationBody?: string | null | undefined;
  certificationDate?: string | null | undefined;
  certificationExpiry?: string | null | undefined;
  name?: string | null | undefined;
  observations?: string | null | undefined;
  phone?: string | null | undefined;
  role?: BrigadierRole | null | undefined;
};

export type UpdateEquipmentInput = {
  acquisitionDate?: string | null | undefined;
  brand?: string | null | undefined;
  location?: string | null | undefined;
  model?: string | null | undefined;
  name?: string | null | undefined;
  nextMaintenance?: string | null | undefined;
  serialNumber?: string | null | undefined;
  status?: EquipmentStatus | null | undefined;
  type?: EquipmentType | null | undefined;
  value?: number | null | undefined;
  warrantyExpiry?: string | null | undefined;
};

export type UpdateParkingSpotInput = {
  covered?: boolean | null | undefined;
  floor?: string | null | undefined;
  number?: string | null | undefined;
  type?: ParkingSpotType | null | undefined;
};

export type WarrantyFilters = {
  search?: string | null | undefined;
  status?: WarrantyStatus | null | undefined;
  type?: WarrantyType | null | undefined;
};

export type WarrantyStatus =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'EXPIRING';

export type WarrantyType =
  | 'EXTENDED'
  | 'MANUFACTURER'
  | 'SERVICE'
  | 'SUPPLIER';

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { id: string, name: string, email: string, role: Role, avatar: string | null, condominiumId: string | null, condominiumName: string | null, condominiums: Array<{ id: string, name: string, cnpj: string, address: string, timezone: string, active: boolean }> } };

export type DashboardSummaryQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardSummaryQuery = { dashboardSummary: { generatedAt: string, condominiumId: string | null, condominiumName: string | null, equipmentTotal: number, maintenancePendingTotal: number, maintenanceOverdueTotal: number, warrantyExpiringTotal: number, unreadNotificationsTotal: number, recentEquipment: Array<{ id: string, name: string, type: EquipmentType, typeLabel: string, location: string, status: EquipmentStatus, statusLabel: string, nextMaintenance: string, patrimonyCode: string }>, upcomingMaintenances: Array<{ id: string, equipment: string, equipmentId: string | null, type: MaintenanceType, typeLabel: string, status: MaintenanceStatus, statusLabel: string, scheduledDate: string, description: string }>, maintenanceChart: Array<{ month: string, label: string, completed: number, pending: number }> } };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { login: { token: string, refreshToken: string | null, requiresCondominiumSelection: boolean, user: { id: string, name: string, email: string, role: Role, avatar: string | null, condominiumId: string | null, condominiumName: string | null, condominiums: Array<{ id: string, name: string, cnpj: string, address: string, timezone: string, active: boolean }> } } };

export type RefreshMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshMutation = { refresh: { token: string, refreshToken: string | null, requiresCondominiumSelection: boolean, user: { id: string, name: string, email: string, role: Role, avatar: string | null, condominiumId: string | null, condominiumName: string | null, condominiums: Array<{ id: string, name: string, cnpj: string, address: string, timezone: string, active: boolean }> } } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { logout: boolean };

export type SwitchCondominiumMutationVariables = Exact<{
  condominiumId: string | number;
}>;


export type SwitchCondominiumMutation = { switchCondominium: { token: string, refreshToken: string | null, requiresCondominiumSelection: boolean, user: { id: string, name: string, email: string, role: Role, avatar: string | null, condominiumId: string | null, condominiumName: string | null, condominiums: Array<{ id: string, name: string, cnpj: string, address: string, timezone: string, active: boolean }> } } };

export type EquipmentsQueryVariables = Exact<{
  filters?: EquipmentFilters | null | undefined;
  pagination?: PaginationInput | null | undefined;
}>;


export type EquipmentsQuery = { equipments: { pageInfo: { total: number, page: number, pageSize: number, totalPages: number }, data: Array<{ id: string, name: string, type: EquipmentType, typeLabel: string, brand: string, model: string, serialNumber: string, patrimonyCode: string, location: string, status: EquipmentStatus, statusLabel: string, acquisitionDate: string, warrantyExpiry: string, lastMaintenance: string | null, nextMaintenance: string, value: number, createdAt: string, updatedAt: string, createdBy: string | null }> } };

export type CreateEquipmentMutationVariables = Exact<{
  input: CreateEquipmentInput;
}>;


export type CreateEquipmentMutation = { createEquipment: { id: string, name: string, type: EquipmentType, typeLabel: string, brand: string, model: string, serialNumber: string, patrimonyCode: string, location: string, status: EquipmentStatus, statusLabel: string, acquisitionDate: string, warrantyExpiry: string, lastMaintenance: string | null, nextMaintenance: string, value: number, createdAt: string, updatedAt: string, createdBy: string | null } };

export type UpdateEquipmentMutationVariables = Exact<{
  id: string | number;
  input: UpdateEquipmentInput;
}>;


export type UpdateEquipmentMutation = { updateEquipment: { id: string, name: string, type: EquipmentType, typeLabel: string, brand: string, model: string, serialNumber: string, patrimonyCode: string, location: string, status: EquipmentStatus, statusLabel: string, acquisitionDate: string, warrantyExpiry: string, lastMaintenance: string | null, nextMaintenance: string, value: number, createdAt: string, updatedAt: string, createdBy: string | null } };

export type DeleteEquipmentMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteEquipmentMutation = { deleteEquipment: boolean };

export type MaintenancesQueryVariables = Exact<{
  filters?: MaintenanceFilters | null | undefined;
  pagination?: PaginationInput | null | undefined;
}>;


export type MaintenancesQuery = { maintenances: { pageInfo: { total: number }, data: Array<{ id: string, equipment: string, equipmentId: string | null, type: MaintenanceType, typeLabel: string, status: MaintenanceStatus, statusLabel: string, scheduledDate: string, completedDate: string | null, technician: string | null, provider: string | null, description: string, cost: number | null, observations: string | null, createdAt: string, updatedAt: string, createdBy: string | null }> } };

export type CreateMaintenanceMutationVariables = Exact<{
  input: CreateMaintenanceInput;
}>;


export type CreateMaintenanceMutation = { createMaintenance: { id: string, equipment: string, equipmentId: string | null, type: MaintenanceType, typeLabel: string, status: MaintenanceStatus, statusLabel: string, scheduledDate: string, completedDate: string | null, technician: string | null, provider: string | null, description: string, cost: number | null, observations: string | null, createdAt: string, updatedAt: string, createdBy: string | null } };

export type CompleteMaintenanceMutationVariables = Exact<{
  id: string | number;
  input: CompleteMaintenanceInput;
}>;


export type CompleteMaintenanceMutation = { completeMaintenance: { id: string, equipment: string, equipmentId: string | null, type: MaintenanceType, typeLabel: string, status: MaintenanceStatus, statusLabel: string, scheduledDate: string, completedDate: string | null, technician: string | null, provider: string | null, description: string, cost: number | null, observations: string | null, createdAt: string, updatedAt: string, createdBy: string | null } };

export type DeleteMaintenanceMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteMaintenanceMutation = { deleteMaintenance: boolean };

export type WarrantiesQueryVariables = Exact<{
  filters?: WarrantyFilters | null | undefined;
  pagination?: PaginationInput | null | undefined;
}>;


export type WarrantiesQuery = { warranties: { pageInfo: { total: number }, data: Array<{ id: string, equipment: string, equipmentId: string | null, brand: string, model: string, serialNumber: string | null, supplier: string, supplierContact: string | null, purchaseDate: string, warrantyStart: string, warrantyEnd: string, warrantyMonths: number, type: WarrantyType, typeLabel: string, status: WarrantyStatus, statusLabel: string, observations: string | null, documentUrl: string | null, createdAt: string, updatedAt: string, createdBy: string | null }> } };

export type CreateWarrantyMutationVariables = Exact<{
  input: CreateWarrantyInput;
}>;


export type CreateWarrantyMutation = { createWarranty: { id: string, equipment: string, equipmentId: string | null, brand: string, model: string, serialNumber: string | null, supplier: string, supplierContact: string | null, purchaseDate: string, warrantyStart: string, warrantyEnd: string, warrantyMonths: number, type: WarrantyType, typeLabel: string, status: WarrantyStatus, statusLabel: string, observations: string | null, documentUrl: string | null, createdAt: string, updatedAt: string, createdBy: string | null } };

export type ParkingDataQueryVariables = Exact<{ [key: string]: never; }>;


export type ParkingDataQuery = { parkingApartments: Array<{ id: string, unit: string, block: string, floor: number | null, ownerName: string, ownerDocument: string | null, ownerPhone: string | null, ownerEmail: string | null, isRented: boolean, tenantName: string | null, tenantDocument: string | null, tenantPhone: string | null, tenantEmail: string | null, rentalStart: string | null, rentalEnd: string | null, hasVehicle: boolean, observations: string | null, createdAt: string, updatedAt: string, createdBy: string | null }>, parkingSpots: Array<{ id: string, number: string, type: ParkingSpotType, typeLabel: string, covered: boolean, floor: string, assignedTo: string | null, createdAt: string, updatedAt: string, createdBy: string | null }>, parkingResults: Array<{ id: string, apartmentId: string, spotId: string, unit: string, block: string, ownerName: string, spotNumber: string, spotType: ParkingSpotType, spotTypeLabel: string, seed: number, drawnAt: string, createdAt: string, updatedAt: string, createdBy: string | null }>, lotterySessions: Array<{ id: string, seed: number, drawnAt: string, undrawnApartments: Array<{ id: string, unit: string, block: string, ownerName: string }>, results: Array<{ id: string }> }> };

export type CreateParkingApartmentMutationVariables = Exact<{
  input: CreateApartmentInput;
}>;


export type CreateParkingApartmentMutation = { createParkingApartment: { id: string, unit: string, block: string, floor: number | null, ownerName: string, ownerDocument: string | null, ownerPhone: string | null, ownerEmail: string | null, isRented: boolean, tenantName: string | null, tenantDocument: string | null, tenantPhone: string | null, tenantEmail: string | null, rentalStart: string | null, rentalEnd: string | null, hasVehicle: boolean, observations: string | null, createdAt: string, updatedAt: string, createdBy: string | null } };

export type UpdateParkingApartmentMutationVariables = Exact<{
  id: string | number;
  input: UpdateApartmentInput;
}>;


export type UpdateParkingApartmentMutation = { updateParkingApartment: { id: string, unit: string, block: string, floor: number | null, ownerName: string, ownerDocument: string | null, ownerPhone: string | null, ownerEmail: string | null, isRented: boolean, tenantName: string | null, tenantDocument: string | null, tenantPhone: string | null, tenantEmail: string | null, rentalStart: string | null, rentalEnd: string | null, hasVehicle: boolean, observations: string | null, createdAt: string, updatedAt: string, createdBy: string | null } };

export type DeleteParkingApartmentMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteParkingApartmentMutation = { deleteParkingApartment: boolean };

export type ApartmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type ApartmentsQuery = { apartments: Array<{ id: string, unit: string, block: string, floor: number | null, ownerName: string, ownerDocument: string | null, ownerPhone: string | null, ownerEmail: string | null, isRented: boolean, tenantName: string | null, tenantDocument: string | null, tenantPhone: string | null, tenantEmail: string | null, rentalStart: string | null, rentalEnd: string | null, hasVehicle: boolean, observations: string | null, createdAt: string, updatedAt: string, createdBy: string | null }> };

export type CreateApartmentMutationVariables = Exact<{
  input: CreateApartmentInput;
}>;


export type CreateApartmentMutation = { createApartment: { id: string, unit: string, block: string, floor: number | null, ownerName: string, ownerDocument: string | null, ownerPhone: string | null, ownerEmail: string | null, isRented: boolean, tenantName: string | null, tenantDocument: string | null, tenantPhone: string | null, tenantEmail: string | null, rentalStart: string | null, rentalEnd: string | null, hasVehicle: boolean, observations: string | null, createdAt: string, updatedAt: string, createdBy: string | null } };

export type UpdateApartmentMutationVariables = Exact<{
  id: string | number;
  input: UpdateApartmentInput;
}>;


export type UpdateApartmentMutation = { updateApartment: { id: string, unit: string, block: string, floor: number | null, ownerName: string, ownerDocument: string | null, ownerPhone: string | null, ownerEmail: string | null, isRented: boolean, tenantName: string | null, tenantDocument: string | null, tenantPhone: string | null, tenantEmail: string | null, rentalStart: string | null, rentalEnd: string | null, hasVehicle: boolean, observations: string | null, createdAt: string, updatedAt: string, createdBy: string | null } };

export type DeleteApartmentMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteApartmentMutation = { deleteApartment: boolean };

export type CreateParkingSpotMutationVariables = Exact<{
  input: CreateParkingSpotInput;
}>;


export type CreateParkingSpotMutation = { createParkingSpot: { id: string, number: string, type: ParkingSpotType, typeLabel: string, covered: boolean, floor: string, assignedTo: string | null, createdAt: string, updatedAt: string, createdBy: string | null } };

export type UpdateParkingSpotMutationVariables = Exact<{
  id: string | number;
  input: UpdateParkingSpotInput;
}>;


export type UpdateParkingSpotMutation = { updateParkingSpot: { id: string, number: string, type: ParkingSpotType, typeLabel: string, covered: boolean, floor: string, assignedTo: string | null, createdAt: string, updatedAt: string, createdBy: string | null } };

export type DeleteParkingSpotMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteParkingSpotMutation = { deleteParkingSpot: boolean };

export type ExecuteLotteryMutationVariables = Exact<{
  input?: ExecuteLotteryInput | null | undefined;
}>;


export type ExecuteLotteryMutation = { executeLottery: { id: string, seed: number, drawnAt: string, undrawnApartments: Array<{ id: string, unit: string, block: string, ownerName: string }>, results: Array<{ id: string, apartmentId: string, spotId: string, unit: string, block: string, ownerName: string, spotNumber: string, spotType: ParkingSpotType, spotTypeLabel: string, seed: number, drawnAt: string }> } };

export type ResetLotteryMutationVariables = Exact<{ [key: string]: never; }>;


export type ResetLotteryMutation = { resetLottery: boolean };

export type BrigadiersQueryVariables = Exact<{
  filters?: BrigadierFilters | null | undefined;
}>;


export type BrigadiersQuery = { brigadiers: Array<{ id: string, name: string, apartment: string, block: string, phone: string, role: BrigadierRole, roleLabel: string, certificationDate: string, certificationExpiry: string, certificationBody: string, certificationStatus: CertificationStatus, active: boolean, observations: string | null, createdAt: string, updatedAt: string, createdBy: string | null }>, notificationLogs: Array<{ id: string, channel: NotificationChannel, recipients: Array<string>, message: string, sentAt: string, status: NotificationDeliveryStatus, createdAt: string, updatedAt: string, createdBy: string | null }> };

export type CreateBrigadierMutationVariables = Exact<{
  input: CreateBrigadierInput;
}>;


export type CreateBrigadierMutation = { createBrigadier: { id: string, name: string, apartment: string, block: string, phone: string, role: BrigadierRole, roleLabel: string, certificationDate: string, certificationExpiry: string, certificationBody: string, certificationStatus: CertificationStatus, active: boolean, observations: string | null, createdAt: string, updatedAt: string, createdBy: string | null } };

export type UpdateBrigadierMutationVariables = Exact<{
  id: string | number;
  input: UpdateBrigadierInput;
}>;


export type UpdateBrigadierMutation = { updateBrigadier: { id: string, name: string, apartment: string, block: string, phone: string, role: BrigadierRole, roleLabel: string, certificationDate: string, certificationExpiry: string, certificationBody: string, certificationStatus: CertificationStatus, active: boolean, observations: string | null, createdAt: string, updatedAt: string, createdBy: string | null } };

export type DeleteBrigadierMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteBrigadierMutation = { deleteBrigadier: boolean };

export type NotifyBrigadiersMutationVariables = Exact<{
  input: NotifyBrigadiersInput;
}>;


export type NotifyBrigadiersMutation = { notifyBrigadiers: { id: string, channel: NotificationChannel, recipients: Array<string>, message: string, sentAt: string, status: NotificationDeliveryStatus, createdAt: string, updatedAt: string, createdBy: string | null } };

export type NotificationsQueryVariables = Exact<{ [key: string]: never; }>;


export type NotificationsQuery = { notifications: Array<{ id: string, type: AppNotificationType, title: string, description: string, severity: NotificationSeverity, date: string | null, read: boolean }> };

export type MarkNotificationReadMutationVariables = Exact<{
  id: string | number;
}>;


export type MarkNotificationReadMutation = { markNotificationRead: { id: string, type: AppNotificationType, title: string, description: string, severity: NotificationSeverity, date: string | null, read: boolean } };

export type MarkAllNotificationsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsReadMutation = { markAllNotificationsRead: Array<{ id: string, type: AppNotificationType, title: string, description: string, severity: NotificationSeverity, date: string | null, read: boolean }> };


export const MeDocument = gql`
    query Me {
  me {
    id
    name
    email
    role
    avatar
    condominiumId
    condominiumName
    condominiums {
      id
      name
      cnpj
      address
      timezone
      active
    }
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
// @ts-ignore
export function useMeSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MeQuery, MeQueryVariables>;
export function useMeSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MeQuery | undefined, MeQueryVariables>;
export function useMeSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeSuspenseQueryHookResult = ReturnType<typeof useMeSuspenseQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const DashboardSummaryDocument = gql`
    query DashboardSummary {
  dashboardSummary {
    generatedAt
    condominiumId
    condominiumName
    equipmentTotal
    maintenancePendingTotal
    maintenanceOverdueTotal
    warrantyExpiringTotal
    unreadNotificationsTotal
    recentEquipment {
      id
      name
      type
      typeLabel
      location
      status
      statusLabel
      nextMaintenance
      patrimonyCode
    }
    upcomingMaintenances {
      id
      equipment
      equipmentId
      type
      typeLabel
      status
      statusLabel
      scheduledDate
      description
    }
    maintenanceChart {
      month
      label
      completed
      pending
    }
  }
}
    `;

/**
 * __useDashboardSummaryQuery__
 *
 * To run a query within a React component, call `useDashboardSummaryQuery` and pass it any options that fit your needs.
 * When your component renders, `useDashboardSummaryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDashboardSummaryQuery({
 *   variables: {
 *   },
 * });
 */
export function useDashboardSummaryQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<DashboardSummaryQuery, DashboardSummaryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<DashboardSummaryQuery, DashboardSummaryQueryVariables>(DashboardSummaryDocument, options);
      }
export function useDashboardSummaryLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<DashboardSummaryQuery, DashboardSummaryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<DashboardSummaryQuery, DashboardSummaryQueryVariables>(DashboardSummaryDocument, options);
        }
// @ts-ignore
export function useDashboardSummarySuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<DashboardSummaryQuery, DashboardSummaryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<DashboardSummaryQuery, DashboardSummaryQueryVariables>;
export function useDashboardSummarySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<DashboardSummaryQuery, DashboardSummaryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<DashboardSummaryQuery | undefined, DashboardSummaryQueryVariables>;
export function useDashboardSummarySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<DashboardSummaryQuery, DashboardSummaryQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<DashboardSummaryQuery, DashboardSummaryQueryVariables>(DashboardSummaryDocument, options);
        }
export type DashboardSummaryQueryHookResult = ReturnType<typeof useDashboardSummaryQuery>;
export type DashboardSummaryLazyQueryHookResult = ReturnType<typeof useDashboardSummaryLazyQuery>;
export type DashboardSummarySuspenseQueryHookResult = ReturnType<typeof useDashboardSummarySuspenseQuery>;
export type DashboardSummaryQueryResult = Apollo.QueryResult<DashboardSummaryQuery, DashboardSummaryQueryVariables>;
export const LoginDocument = gql`
    mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    refreshToken
    requiresCondominiumSelection
    user {
      id
      name
      email
      role
      avatar
      condominiumId
      condominiumName
      condominiums {
        id
        name
        cnpj
        address
        timezone
        active
      }
    }
  }
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const RefreshDocument = gql`
    mutation Refresh {
  refresh {
    token
    refreshToken
    requiresCondominiumSelection
    user {
      id
      name
      email
      role
      avatar
      condominiumId
      condominiumName
      condominiums {
        id
        name
        cnpj
        address
        timezone
        active
      }
    }
  }
}
    `;
export type RefreshMutationFn = Apollo.MutationFunction<RefreshMutation, RefreshMutationVariables>;

/**
 * __useRefreshMutation__
 *
 * To run a mutation, you first call `useRefreshMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRefreshMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [refreshMutation, { data, loading, error }] = useRefreshMutation({
 *   variables: {
 *   },
 * });
 */
export function useRefreshMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RefreshMutation, RefreshMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RefreshMutation, RefreshMutationVariables>(RefreshDocument, options);
      }
export type RefreshMutationHookResult = ReturnType<typeof useRefreshMutation>;
export type RefreshMutationResult = Apollo.MutationResult<RefreshMutation>;
export type RefreshMutationOptions = Apollo.BaseMutationOptions<RefreshMutation, RefreshMutationVariables>;
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, options);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const SwitchCondominiumDocument = gql`
    mutation SwitchCondominium($condominiumId: ID!) {
  switchCondominium(condominiumId: $condominiumId) {
    token
    refreshToken
    requiresCondominiumSelection
    user {
      id
      name
      email
      role
      avatar
      condominiumId
      condominiumName
      condominiums {
        id
        name
        cnpj
        address
        timezone
        active
      }
    }
  }
}
    `;
export type SwitchCondominiumMutationFn = Apollo.MutationFunction<SwitchCondominiumMutation, SwitchCondominiumMutationVariables>;

/**
 * __useSwitchCondominiumMutation__
 *
 * To run a mutation, you first call `useSwitchCondominiumMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSwitchCondominiumMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [switchCondominiumMutation, { data, loading, error }] = useSwitchCondominiumMutation({
 *   variables: {
 *      condominiumId: // value for 'condominiumId'
 *   },
 * });
 */
export function useSwitchCondominiumMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SwitchCondominiumMutation, SwitchCondominiumMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SwitchCondominiumMutation, SwitchCondominiumMutationVariables>(SwitchCondominiumDocument, options);
      }
export type SwitchCondominiumMutationHookResult = ReturnType<typeof useSwitchCondominiumMutation>;
export type SwitchCondominiumMutationResult = Apollo.MutationResult<SwitchCondominiumMutation>;
export type SwitchCondominiumMutationOptions = Apollo.BaseMutationOptions<SwitchCondominiumMutation, SwitchCondominiumMutationVariables>;
export const EquipmentsDocument = gql`
    query Equipments($filters: EquipmentFilters, $pagination: PaginationInput) {
  equipments(filters: $filters, pagination: $pagination) {
    pageInfo {
      total
      page
      pageSize
      totalPages
    }
    data {
      id
      name
      type
      typeLabel
      brand
      model
      serialNumber
      patrimonyCode
      location
      status
      statusLabel
      acquisitionDate
      warrantyExpiry
      lastMaintenance
      nextMaintenance
      value
      createdAt
      updatedAt
      createdBy
    }
  }
}
    `;

/**
 * __useEquipmentsQuery__
 *
 * To run a query within a React component, call `useEquipmentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useEquipmentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEquipmentsQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useEquipmentsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<EquipmentsQuery, EquipmentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<EquipmentsQuery, EquipmentsQueryVariables>(EquipmentsDocument, options);
      }
export function useEquipmentsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<EquipmentsQuery, EquipmentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<EquipmentsQuery, EquipmentsQueryVariables>(EquipmentsDocument, options);
        }
// @ts-ignore
export function useEquipmentsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<EquipmentsQuery, EquipmentsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<EquipmentsQuery, EquipmentsQueryVariables>;
export function useEquipmentsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<EquipmentsQuery, EquipmentsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<EquipmentsQuery | undefined, EquipmentsQueryVariables>;
export function useEquipmentsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<EquipmentsQuery, EquipmentsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<EquipmentsQuery, EquipmentsQueryVariables>(EquipmentsDocument, options);
        }
export type EquipmentsQueryHookResult = ReturnType<typeof useEquipmentsQuery>;
export type EquipmentsLazyQueryHookResult = ReturnType<typeof useEquipmentsLazyQuery>;
export type EquipmentsSuspenseQueryHookResult = ReturnType<typeof useEquipmentsSuspenseQuery>;
export type EquipmentsQueryResult = Apollo.QueryResult<EquipmentsQuery, EquipmentsQueryVariables>;
export const CreateEquipmentDocument = gql`
    mutation CreateEquipment($input: CreateEquipmentInput!) {
  createEquipment(input: $input) {
    id
    name
    type
    typeLabel
    brand
    model
    serialNumber
    patrimonyCode
    location
    status
    statusLabel
    acquisitionDate
    warrantyExpiry
    lastMaintenance
    nextMaintenance
    value
    createdAt
    updatedAt
    createdBy
  }
}
    `;
export type CreateEquipmentMutationFn = Apollo.MutationFunction<CreateEquipmentMutation, CreateEquipmentMutationVariables>;

/**
 * __useCreateEquipmentMutation__
 *
 * To run a mutation, you first call `useCreateEquipmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateEquipmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createEquipmentMutation, { data, loading, error }] = useCreateEquipmentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateEquipmentMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateEquipmentMutation, CreateEquipmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateEquipmentMutation, CreateEquipmentMutationVariables>(CreateEquipmentDocument, options);
      }
export type CreateEquipmentMutationHookResult = ReturnType<typeof useCreateEquipmentMutation>;
export type CreateEquipmentMutationResult = Apollo.MutationResult<CreateEquipmentMutation>;
export type CreateEquipmentMutationOptions = Apollo.BaseMutationOptions<CreateEquipmentMutation, CreateEquipmentMutationVariables>;
export const UpdateEquipmentDocument = gql`
    mutation UpdateEquipment($id: ID!, $input: UpdateEquipmentInput!) {
  updateEquipment(id: $id, input: $input) {
    id
    name
    type
    typeLabel
    brand
    model
    serialNumber
    patrimonyCode
    location
    status
    statusLabel
    acquisitionDate
    warrantyExpiry
    lastMaintenance
    nextMaintenance
    value
    createdAt
    updatedAt
    createdBy
  }
}
    `;
export type UpdateEquipmentMutationFn = Apollo.MutationFunction<UpdateEquipmentMutation, UpdateEquipmentMutationVariables>;

/**
 * __useUpdateEquipmentMutation__
 *
 * To run a mutation, you first call `useUpdateEquipmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateEquipmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateEquipmentMutation, { data, loading, error }] = useUpdateEquipmentMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateEquipmentMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateEquipmentMutation, UpdateEquipmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateEquipmentMutation, UpdateEquipmentMutationVariables>(UpdateEquipmentDocument, options);
      }
export type UpdateEquipmentMutationHookResult = ReturnType<typeof useUpdateEquipmentMutation>;
export type UpdateEquipmentMutationResult = Apollo.MutationResult<UpdateEquipmentMutation>;
export type UpdateEquipmentMutationOptions = Apollo.BaseMutationOptions<UpdateEquipmentMutation, UpdateEquipmentMutationVariables>;
export const DeleteEquipmentDocument = gql`
    mutation DeleteEquipment($id: ID!) {
  deleteEquipment(id: $id)
}
    `;
export type DeleteEquipmentMutationFn = Apollo.MutationFunction<DeleteEquipmentMutation, DeleteEquipmentMutationVariables>;

/**
 * __useDeleteEquipmentMutation__
 *
 * To run a mutation, you first call `useDeleteEquipmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteEquipmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteEquipmentMutation, { data, loading, error }] = useDeleteEquipmentMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteEquipmentMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteEquipmentMutation, DeleteEquipmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteEquipmentMutation, DeleteEquipmentMutationVariables>(DeleteEquipmentDocument, options);
      }
export type DeleteEquipmentMutationHookResult = ReturnType<typeof useDeleteEquipmentMutation>;
export type DeleteEquipmentMutationResult = Apollo.MutationResult<DeleteEquipmentMutation>;
export type DeleteEquipmentMutationOptions = Apollo.BaseMutationOptions<DeleteEquipmentMutation, DeleteEquipmentMutationVariables>;
export const MaintenancesDocument = gql`
    query Maintenances($filters: MaintenanceFilters, $pagination: PaginationInput) {
  maintenances(filters: $filters, pagination: $pagination) {
    pageInfo {
      total
    }
    data {
      id
      equipment
      equipmentId
      type
      typeLabel
      status
      statusLabel
      scheduledDate
      completedDate
      technician
      provider
      description
      cost
      observations
      createdAt
      updatedAt
      createdBy
    }
  }
}
    `;

/**
 * __useMaintenancesQuery__
 *
 * To run a query within a React component, call `useMaintenancesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMaintenancesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMaintenancesQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useMaintenancesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<MaintenancesQuery, MaintenancesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MaintenancesQuery, MaintenancesQueryVariables>(MaintenancesDocument, options);
      }
export function useMaintenancesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MaintenancesQuery, MaintenancesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MaintenancesQuery, MaintenancesQueryVariables>(MaintenancesDocument, options);
        }
// @ts-ignore
export function useMaintenancesSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<MaintenancesQuery, MaintenancesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MaintenancesQuery, MaintenancesQueryVariables>;
export function useMaintenancesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MaintenancesQuery, MaintenancesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<MaintenancesQuery | undefined, MaintenancesQueryVariables>;
export function useMaintenancesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<MaintenancesQuery, MaintenancesQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<MaintenancesQuery, MaintenancesQueryVariables>(MaintenancesDocument, options);
        }
export type MaintenancesQueryHookResult = ReturnType<typeof useMaintenancesQuery>;
export type MaintenancesLazyQueryHookResult = ReturnType<typeof useMaintenancesLazyQuery>;
export type MaintenancesSuspenseQueryHookResult = ReturnType<typeof useMaintenancesSuspenseQuery>;
export type MaintenancesQueryResult = Apollo.QueryResult<MaintenancesQuery, MaintenancesQueryVariables>;
export const CreateMaintenanceDocument = gql`
    mutation CreateMaintenance($input: CreateMaintenanceInput!) {
  createMaintenance(input: $input) {
    id
    equipment
    equipmentId
    type
    typeLabel
    status
    statusLabel
    scheduledDate
    completedDate
    technician
    provider
    description
    cost
    observations
    createdAt
    updatedAt
    createdBy
  }
}
    `;
export type CreateMaintenanceMutationFn = Apollo.MutationFunction<CreateMaintenanceMutation, CreateMaintenanceMutationVariables>;

/**
 * __useCreateMaintenanceMutation__
 *
 * To run a mutation, you first call `useCreateMaintenanceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateMaintenanceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createMaintenanceMutation, { data, loading, error }] = useCreateMaintenanceMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateMaintenanceMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateMaintenanceMutation, CreateMaintenanceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateMaintenanceMutation, CreateMaintenanceMutationVariables>(CreateMaintenanceDocument, options);
      }
export type CreateMaintenanceMutationHookResult = ReturnType<typeof useCreateMaintenanceMutation>;
export type CreateMaintenanceMutationResult = Apollo.MutationResult<CreateMaintenanceMutation>;
export type CreateMaintenanceMutationOptions = Apollo.BaseMutationOptions<CreateMaintenanceMutation, CreateMaintenanceMutationVariables>;
export const CompleteMaintenanceDocument = gql`
    mutation CompleteMaintenance($id: ID!, $input: CompleteMaintenanceInput!) {
  completeMaintenance(id: $id, input: $input) {
    id
    equipment
    equipmentId
    type
    typeLabel
    status
    statusLabel
    scheduledDate
    completedDate
    technician
    provider
    description
    cost
    observations
    createdAt
    updatedAt
    createdBy
  }
}
    `;
export type CompleteMaintenanceMutationFn = Apollo.MutationFunction<CompleteMaintenanceMutation, CompleteMaintenanceMutationVariables>;

/**
 * __useCompleteMaintenanceMutation__
 *
 * To run a mutation, you first call `useCompleteMaintenanceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCompleteMaintenanceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [completeMaintenanceMutation, { data, loading, error }] = useCompleteMaintenanceMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCompleteMaintenanceMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CompleteMaintenanceMutation, CompleteMaintenanceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CompleteMaintenanceMutation, CompleteMaintenanceMutationVariables>(CompleteMaintenanceDocument, options);
      }
export type CompleteMaintenanceMutationHookResult = ReturnType<typeof useCompleteMaintenanceMutation>;
export type CompleteMaintenanceMutationResult = Apollo.MutationResult<CompleteMaintenanceMutation>;
export type CompleteMaintenanceMutationOptions = Apollo.BaseMutationOptions<CompleteMaintenanceMutation, CompleteMaintenanceMutationVariables>;
export const DeleteMaintenanceDocument = gql`
    mutation DeleteMaintenance($id: ID!) {
  deleteMaintenance(id: $id)
}
    `;
export type DeleteMaintenanceMutationFn = Apollo.MutationFunction<DeleteMaintenanceMutation, DeleteMaintenanceMutationVariables>;

/**
 * __useDeleteMaintenanceMutation__
 *
 * To run a mutation, you first call `useDeleteMaintenanceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteMaintenanceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteMaintenanceMutation, { data, loading, error }] = useDeleteMaintenanceMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteMaintenanceMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteMaintenanceMutation, DeleteMaintenanceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteMaintenanceMutation, DeleteMaintenanceMutationVariables>(DeleteMaintenanceDocument, options);
      }
export type DeleteMaintenanceMutationHookResult = ReturnType<typeof useDeleteMaintenanceMutation>;
export type DeleteMaintenanceMutationResult = Apollo.MutationResult<DeleteMaintenanceMutation>;
export type DeleteMaintenanceMutationOptions = Apollo.BaseMutationOptions<DeleteMaintenanceMutation, DeleteMaintenanceMutationVariables>;
export const WarrantiesDocument = gql`
    query Warranties($filters: WarrantyFilters, $pagination: PaginationInput) {
  warranties(filters: $filters, pagination: $pagination) {
    pageInfo {
      total
    }
    data {
      id
      equipment
      equipmentId
      brand
      model
      serialNumber
      supplier
      supplierContact
      purchaseDate
      warrantyStart
      warrantyEnd
      warrantyMonths
      type
      typeLabel
      status
      statusLabel
      observations
      documentUrl
      createdAt
      updatedAt
      createdBy
    }
  }
}
    `;

/**
 * __useWarrantiesQuery__
 *
 * To run a query within a React component, call `useWarrantiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useWarrantiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWarrantiesQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useWarrantiesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<WarrantiesQuery, WarrantiesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<WarrantiesQuery, WarrantiesQueryVariables>(WarrantiesDocument, options);
      }
export function useWarrantiesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<WarrantiesQuery, WarrantiesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<WarrantiesQuery, WarrantiesQueryVariables>(WarrantiesDocument, options);
        }
// @ts-ignore
export function useWarrantiesSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<WarrantiesQuery, WarrantiesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<WarrantiesQuery, WarrantiesQueryVariables>;
export function useWarrantiesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<WarrantiesQuery, WarrantiesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<WarrantiesQuery | undefined, WarrantiesQueryVariables>;
export function useWarrantiesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<WarrantiesQuery, WarrantiesQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<WarrantiesQuery, WarrantiesQueryVariables>(WarrantiesDocument, options);
        }
export type WarrantiesQueryHookResult = ReturnType<typeof useWarrantiesQuery>;
export type WarrantiesLazyQueryHookResult = ReturnType<typeof useWarrantiesLazyQuery>;
export type WarrantiesSuspenseQueryHookResult = ReturnType<typeof useWarrantiesSuspenseQuery>;
export type WarrantiesQueryResult = Apollo.QueryResult<WarrantiesQuery, WarrantiesQueryVariables>;
export const CreateWarrantyDocument = gql`
    mutation CreateWarranty($input: CreateWarrantyInput!) {
  createWarranty(input: $input) {
    id
    equipment
    equipmentId
    brand
    model
    serialNumber
    supplier
    supplierContact
    purchaseDate
    warrantyStart
    warrantyEnd
    warrantyMonths
    type
    typeLabel
    status
    statusLabel
    observations
    documentUrl
    createdAt
    updatedAt
    createdBy
  }
}
    `;
export type CreateWarrantyMutationFn = Apollo.MutationFunction<CreateWarrantyMutation, CreateWarrantyMutationVariables>;

/**
 * __useCreateWarrantyMutation__
 *
 * To run a mutation, you first call `useCreateWarrantyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWarrantyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWarrantyMutation, { data, loading, error }] = useCreateWarrantyMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateWarrantyMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateWarrantyMutation, CreateWarrantyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateWarrantyMutation, CreateWarrantyMutationVariables>(CreateWarrantyDocument, options);
      }
export type CreateWarrantyMutationHookResult = ReturnType<typeof useCreateWarrantyMutation>;
export type CreateWarrantyMutationResult = Apollo.MutationResult<CreateWarrantyMutation>;
export type CreateWarrantyMutationOptions = Apollo.BaseMutationOptions<CreateWarrantyMutation, CreateWarrantyMutationVariables>;
export const ParkingDataDocument = gql`
    query ParkingData {
  parkingApartments {
    id
    unit
    block
    floor
    ownerName
    ownerDocument
    ownerPhone
    ownerEmail
    isRented
    tenantName
    tenantDocument
    tenantPhone
    tenantEmail
    rentalStart
    rentalEnd
    hasVehicle
    observations
    createdAt
    updatedAt
    createdBy
  }
  parkingSpots {
    id
    number
    type
    typeLabel
    covered
    floor
    assignedTo
    createdAt
    updatedAt
    createdBy
  }
  parkingResults {
    id
    apartmentId
    spotId
    unit
    block
    ownerName
    spotNumber
    spotType
    spotTypeLabel
    seed
    drawnAt
    createdAt
    updatedAt
    createdBy
  }
  lotterySessions {
    id
    seed
    drawnAt
    undrawnApartments {
      id
      unit
      block
      ownerName
    }
    results {
      id
    }
  }
}
    `;

/**
 * __useParkingDataQuery__
 *
 * To run a query within a React component, call `useParkingDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useParkingDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useParkingDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useParkingDataQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<ParkingDataQuery, ParkingDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ParkingDataQuery, ParkingDataQueryVariables>(ParkingDataDocument, options);
      }
export function useParkingDataLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ParkingDataQuery, ParkingDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ParkingDataQuery, ParkingDataQueryVariables>(ParkingDataDocument, options);
        }
// @ts-ignore
export function useParkingDataSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<ParkingDataQuery, ParkingDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ParkingDataQuery, ParkingDataQueryVariables>;
export function useParkingDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ParkingDataQuery, ParkingDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ParkingDataQuery | undefined, ParkingDataQueryVariables>;
export function useParkingDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ParkingDataQuery, ParkingDataQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<ParkingDataQuery, ParkingDataQueryVariables>(ParkingDataDocument, options);
        }
export type ParkingDataQueryHookResult = ReturnType<typeof useParkingDataQuery>;
export type ParkingDataLazyQueryHookResult = ReturnType<typeof useParkingDataLazyQuery>;
export type ParkingDataSuspenseQueryHookResult = ReturnType<typeof useParkingDataSuspenseQuery>;
export type ParkingDataQueryResult = Apollo.QueryResult<ParkingDataQuery, ParkingDataQueryVariables>;
export const CreateParkingApartmentDocument = gql`
    mutation CreateParkingApartment($input: CreateApartmentInput!) {
  createParkingApartment(input: $input) {
    id
    unit
    block
    floor
    ownerName
    ownerDocument
    ownerPhone
    ownerEmail
    isRented
    tenantName
    tenantDocument
    tenantPhone
    tenantEmail
    rentalStart
    rentalEnd
    hasVehicle
    observations
    createdAt
    updatedAt
    createdBy
  }
}
    `;
export type CreateParkingApartmentMutationFn = Apollo.MutationFunction<CreateParkingApartmentMutation, CreateParkingApartmentMutationVariables>;

/**
 * __useCreateParkingApartmentMutation__
 *
 * To run a mutation, you first call `useCreateParkingApartmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateParkingApartmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createParkingApartmentMutation, { data, loading, error }] = useCreateParkingApartmentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateParkingApartmentMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateParkingApartmentMutation, CreateParkingApartmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateParkingApartmentMutation, CreateParkingApartmentMutationVariables>(CreateParkingApartmentDocument, options);
      }
export type CreateParkingApartmentMutationHookResult = ReturnType<typeof useCreateParkingApartmentMutation>;
export type CreateParkingApartmentMutationResult = Apollo.MutationResult<CreateParkingApartmentMutation>;
export type CreateParkingApartmentMutationOptions = Apollo.BaseMutationOptions<CreateParkingApartmentMutation, CreateParkingApartmentMutationVariables>;
export const UpdateParkingApartmentDocument = gql`
    mutation UpdateParkingApartment($id: ID!, $input: UpdateApartmentInput!) {
  updateParkingApartment(id: $id, input: $input) {
    id
    unit
    block
    floor
    ownerName
    ownerDocument
    ownerPhone
    ownerEmail
    isRented
    tenantName
    tenantDocument
    tenantPhone
    tenantEmail
    rentalStart
    rentalEnd
    hasVehicle
    observations
    createdAt
    updatedAt
    createdBy
  }
}
    `;
export type UpdateParkingApartmentMutationFn = Apollo.MutationFunction<UpdateParkingApartmentMutation, UpdateParkingApartmentMutationVariables>;

/**
 * __useUpdateParkingApartmentMutation__
 *
 * To run a mutation, you first call `useUpdateParkingApartmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateParkingApartmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateParkingApartmentMutation, { data, loading, error }] = useUpdateParkingApartmentMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateParkingApartmentMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateParkingApartmentMutation, UpdateParkingApartmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateParkingApartmentMutation, UpdateParkingApartmentMutationVariables>(UpdateParkingApartmentDocument, options);
      }
export type UpdateParkingApartmentMutationHookResult = ReturnType<typeof useUpdateParkingApartmentMutation>;
export type UpdateParkingApartmentMutationResult = Apollo.MutationResult<UpdateParkingApartmentMutation>;
export type UpdateParkingApartmentMutationOptions = Apollo.BaseMutationOptions<UpdateParkingApartmentMutation, UpdateParkingApartmentMutationVariables>;
export const DeleteParkingApartmentDocument = gql`
    mutation DeleteParkingApartment($id: ID!) {
  deleteParkingApartment(id: $id)
}
    `;
export type DeleteParkingApartmentMutationFn = Apollo.MutationFunction<DeleteParkingApartmentMutation, DeleteParkingApartmentMutationVariables>;

/**
 * __useDeleteParkingApartmentMutation__
 *
 * To run a mutation, you first call `useDeleteParkingApartmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteParkingApartmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteParkingApartmentMutation, { data, loading, error }] = useDeleteParkingApartmentMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteParkingApartmentMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteParkingApartmentMutation, DeleteParkingApartmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteParkingApartmentMutation, DeleteParkingApartmentMutationVariables>(DeleteParkingApartmentDocument, options);
      }
export type DeleteParkingApartmentMutationHookResult = ReturnType<typeof useDeleteParkingApartmentMutation>;
export type DeleteParkingApartmentMutationResult = Apollo.MutationResult<DeleteParkingApartmentMutation>;
export type DeleteParkingApartmentMutationOptions = Apollo.BaseMutationOptions<DeleteParkingApartmentMutation, DeleteParkingApartmentMutationVariables>;
export const ApartmentsDocument = gql`
    query Apartments {
  apartments {
    id
    unit
    block
    floor
    ownerName
    ownerDocument
    ownerPhone
    ownerEmail
    isRented
    tenantName
    tenantDocument
    tenantPhone
    tenantEmail
    rentalStart
    rentalEnd
    hasVehicle
    observations
    createdAt
    updatedAt
    createdBy
  }
}
    `;

/**
 * __useApartmentsQuery__
 *
 * To run a query within a React component, call `useApartmentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useApartmentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useApartmentsQuery({
 *   variables: {
 *   },
 * });
 */
export function useApartmentsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<ApartmentsQuery, ApartmentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ApartmentsQuery, ApartmentsQueryVariables>(ApartmentsDocument, options);
      }
export function useApartmentsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ApartmentsQuery, ApartmentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ApartmentsQuery, ApartmentsQueryVariables>(ApartmentsDocument, options);
        }
// @ts-ignore
export function useApartmentsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<ApartmentsQuery, ApartmentsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ApartmentsQuery, ApartmentsQueryVariables>;
export function useApartmentsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ApartmentsQuery, ApartmentsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ApartmentsQuery | undefined, ApartmentsQueryVariables>;
export function useApartmentsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ApartmentsQuery, ApartmentsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<ApartmentsQuery, ApartmentsQueryVariables>(ApartmentsDocument, options);
        }
export type ApartmentsQueryHookResult = ReturnType<typeof useApartmentsQuery>;
export type ApartmentsLazyQueryHookResult = ReturnType<typeof useApartmentsLazyQuery>;
export type ApartmentsSuspenseQueryHookResult = ReturnType<typeof useApartmentsSuspenseQuery>;
export type ApartmentsQueryResult = Apollo.QueryResult<ApartmentsQuery, ApartmentsQueryVariables>;
export const CreateApartmentDocument = gql`
    mutation CreateApartment($input: CreateApartmentInput!) {
  createApartment(input: $input) {
    id
    unit
    block
    floor
    ownerName
    ownerDocument
    ownerPhone
    ownerEmail
    isRented
    tenantName
    tenantDocument
    tenantPhone
    tenantEmail
    rentalStart
    rentalEnd
    hasVehicle
    observations
    createdAt
    updatedAt
    createdBy
  }
}
    `;
export type CreateApartmentMutationFn = Apollo.MutationFunction<CreateApartmentMutation, CreateApartmentMutationVariables>;

/**
 * __useCreateApartmentMutation__
 *
 * To run a mutation, you first call `useCreateApartmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateApartmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createApartmentMutation, { data, loading, error }] = useCreateApartmentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateApartmentMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateApartmentMutation, CreateApartmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateApartmentMutation, CreateApartmentMutationVariables>(CreateApartmentDocument, options);
      }
export type CreateApartmentMutationHookResult = ReturnType<typeof useCreateApartmentMutation>;
export type CreateApartmentMutationResult = Apollo.MutationResult<CreateApartmentMutation>;
export type CreateApartmentMutationOptions = Apollo.BaseMutationOptions<CreateApartmentMutation, CreateApartmentMutationVariables>;
export const UpdateApartmentDocument = gql`
    mutation UpdateApartment($id: ID!, $input: UpdateApartmentInput!) {
  updateApartment(id: $id, input: $input) {
    id
    unit
    block
    floor
    ownerName
    ownerDocument
    ownerPhone
    ownerEmail
    isRented
    tenantName
    tenantDocument
    tenantPhone
    tenantEmail
    rentalStart
    rentalEnd
    hasVehicle
    observations
    createdAt
    updatedAt
    createdBy
  }
}
    `;
export type UpdateApartmentMutationFn = Apollo.MutationFunction<UpdateApartmentMutation, UpdateApartmentMutationVariables>;

/**
 * __useUpdateApartmentMutation__
 *
 * To run a mutation, you first call `useUpdateApartmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateApartmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateApartmentMutation, { data, loading, error }] = useUpdateApartmentMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateApartmentMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateApartmentMutation, UpdateApartmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateApartmentMutation, UpdateApartmentMutationVariables>(UpdateApartmentDocument, options);
      }
export type UpdateApartmentMutationHookResult = ReturnType<typeof useUpdateApartmentMutation>;
export type UpdateApartmentMutationResult = Apollo.MutationResult<UpdateApartmentMutation>;
export type UpdateApartmentMutationOptions = Apollo.BaseMutationOptions<UpdateApartmentMutation, UpdateApartmentMutationVariables>;
export const DeleteApartmentDocument = gql`
    mutation DeleteApartment($id: ID!) {
  deleteApartment(id: $id)
}
    `;
export type DeleteApartmentMutationFn = Apollo.MutationFunction<DeleteApartmentMutation, DeleteApartmentMutationVariables>;

/**
 * __useDeleteApartmentMutation__
 *
 * To run a mutation, you first call `useDeleteApartmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteApartmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteApartmentMutation, { data, loading, error }] = useDeleteApartmentMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteApartmentMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteApartmentMutation, DeleteApartmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteApartmentMutation, DeleteApartmentMutationVariables>(DeleteApartmentDocument, options);
      }
export type DeleteApartmentMutationHookResult = ReturnType<typeof useDeleteApartmentMutation>;
export type DeleteApartmentMutationResult = Apollo.MutationResult<DeleteApartmentMutation>;
export type DeleteApartmentMutationOptions = Apollo.BaseMutationOptions<DeleteApartmentMutation, DeleteApartmentMutationVariables>;
export const CreateParkingSpotDocument = gql`
    mutation CreateParkingSpot($input: CreateParkingSpotInput!) {
  createParkingSpot(input: $input) {
    id
    number
    type
    typeLabel
    covered
    floor
    assignedTo
    createdAt
    updatedAt
    createdBy
  }
}
    `;
export type CreateParkingSpotMutationFn = Apollo.MutationFunction<CreateParkingSpotMutation, CreateParkingSpotMutationVariables>;

/**
 * __useCreateParkingSpotMutation__
 *
 * To run a mutation, you first call `useCreateParkingSpotMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateParkingSpotMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createParkingSpotMutation, { data, loading, error }] = useCreateParkingSpotMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateParkingSpotMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateParkingSpotMutation, CreateParkingSpotMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateParkingSpotMutation, CreateParkingSpotMutationVariables>(CreateParkingSpotDocument, options);
      }
export type CreateParkingSpotMutationHookResult = ReturnType<typeof useCreateParkingSpotMutation>;
export type CreateParkingSpotMutationResult = Apollo.MutationResult<CreateParkingSpotMutation>;
export type CreateParkingSpotMutationOptions = Apollo.BaseMutationOptions<CreateParkingSpotMutation, CreateParkingSpotMutationVariables>;
export const UpdateParkingSpotDocument = gql`
    mutation UpdateParkingSpot($id: ID!, $input: UpdateParkingSpotInput!) {
  updateParkingSpot(id: $id, input: $input) {
    id
    number
    type
    typeLabel
    covered
    floor
    assignedTo
    createdAt
    updatedAt
    createdBy
  }
}
    `;
export type UpdateParkingSpotMutationFn = Apollo.MutationFunction<UpdateParkingSpotMutation, UpdateParkingSpotMutationVariables>;

/**
 * __useUpdateParkingSpotMutation__
 *
 * To run a mutation, you first call `useUpdateParkingSpotMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateParkingSpotMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateParkingSpotMutation, { data, loading, error }] = useUpdateParkingSpotMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateParkingSpotMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateParkingSpotMutation, UpdateParkingSpotMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateParkingSpotMutation, UpdateParkingSpotMutationVariables>(UpdateParkingSpotDocument, options);
      }
export type UpdateParkingSpotMutationHookResult = ReturnType<typeof useUpdateParkingSpotMutation>;
export type UpdateParkingSpotMutationResult = Apollo.MutationResult<UpdateParkingSpotMutation>;
export type UpdateParkingSpotMutationOptions = Apollo.BaseMutationOptions<UpdateParkingSpotMutation, UpdateParkingSpotMutationVariables>;
export const DeleteParkingSpotDocument = gql`
    mutation DeleteParkingSpot($id: ID!) {
  deleteParkingSpot(id: $id)
}
    `;
export type DeleteParkingSpotMutationFn = Apollo.MutationFunction<DeleteParkingSpotMutation, DeleteParkingSpotMutationVariables>;

/**
 * __useDeleteParkingSpotMutation__
 *
 * To run a mutation, you first call `useDeleteParkingSpotMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteParkingSpotMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteParkingSpotMutation, { data, loading, error }] = useDeleteParkingSpotMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteParkingSpotMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteParkingSpotMutation, DeleteParkingSpotMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteParkingSpotMutation, DeleteParkingSpotMutationVariables>(DeleteParkingSpotDocument, options);
      }
export type DeleteParkingSpotMutationHookResult = ReturnType<typeof useDeleteParkingSpotMutation>;
export type DeleteParkingSpotMutationResult = Apollo.MutationResult<DeleteParkingSpotMutation>;
export type DeleteParkingSpotMutationOptions = Apollo.BaseMutationOptions<DeleteParkingSpotMutation, DeleteParkingSpotMutationVariables>;
export const ExecuteLotteryDocument = gql`
    mutation ExecuteLottery($input: ExecuteLotteryInput) {
  executeLottery(input: $input) {
    id
    seed
    drawnAt
    undrawnApartments {
      id
      unit
      block
      ownerName
    }
    results {
      id
      apartmentId
      spotId
      unit
      block
      ownerName
      spotNumber
      spotType
      spotTypeLabel
      seed
      drawnAt
    }
  }
}
    `;
export type ExecuteLotteryMutationFn = Apollo.MutationFunction<ExecuteLotteryMutation, ExecuteLotteryMutationVariables>;

/**
 * __useExecuteLotteryMutation__
 *
 * To run a mutation, you first call `useExecuteLotteryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useExecuteLotteryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [executeLotteryMutation, { data, loading, error }] = useExecuteLotteryMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useExecuteLotteryMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ExecuteLotteryMutation, ExecuteLotteryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ExecuteLotteryMutation, ExecuteLotteryMutationVariables>(ExecuteLotteryDocument, options);
      }
export type ExecuteLotteryMutationHookResult = ReturnType<typeof useExecuteLotteryMutation>;
export type ExecuteLotteryMutationResult = Apollo.MutationResult<ExecuteLotteryMutation>;
export type ExecuteLotteryMutationOptions = Apollo.BaseMutationOptions<ExecuteLotteryMutation, ExecuteLotteryMutationVariables>;
export const ResetLotteryDocument = gql`
    mutation ResetLottery {
  resetLottery
}
    `;
export type ResetLotteryMutationFn = Apollo.MutationFunction<ResetLotteryMutation, ResetLotteryMutationVariables>;

/**
 * __useResetLotteryMutation__
 *
 * To run a mutation, you first call `useResetLotteryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResetLotteryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resetLotteryMutation, { data, loading, error }] = useResetLotteryMutation({
 *   variables: {
 *   },
 * });
 */
export function useResetLotteryMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ResetLotteryMutation, ResetLotteryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ResetLotteryMutation, ResetLotteryMutationVariables>(ResetLotteryDocument, options);
      }
export type ResetLotteryMutationHookResult = ReturnType<typeof useResetLotteryMutation>;
export type ResetLotteryMutationResult = Apollo.MutationResult<ResetLotteryMutation>;
export type ResetLotteryMutationOptions = Apollo.BaseMutationOptions<ResetLotteryMutation, ResetLotteryMutationVariables>;
export const BrigadiersDocument = gql`
    query Brigadiers($filters: BrigadierFilters) {
  brigadiers(filters: $filters) {
    id
    name
    apartment
    block
    phone
    role
    roleLabel
    certificationDate
    certificationExpiry
    certificationBody
    certificationStatus
    active
    observations
    createdAt
    updatedAt
    createdBy
  }
  notificationLogs {
    id
    channel
    recipients
    message
    sentAt
    status
    createdAt
    updatedAt
    createdBy
  }
}
    `;

/**
 * __useBrigadiersQuery__
 *
 * To run a query within a React component, call `useBrigadiersQuery` and pass it any options that fit your needs.
 * When your component renders, `useBrigadiersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBrigadiersQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useBrigadiersQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<BrigadiersQuery, BrigadiersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<BrigadiersQuery, BrigadiersQueryVariables>(BrigadiersDocument, options);
      }
export function useBrigadiersLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<BrigadiersQuery, BrigadiersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<BrigadiersQuery, BrigadiersQueryVariables>(BrigadiersDocument, options);
        }
// @ts-ignore
export function useBrigadiersSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<BrigadiersQuery, BrigadiersQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<BrigadiersQuery, BrigadiersQueryVariables>;
export function useBrigadiersSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<BrigadiersQuery, BrigadiersQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<BrigadiersQuery | undefined, BrigadiersQueryVariables>;
export function useBrigadiersSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<BrigadiersQuery, BrigadiersQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<BrigadiersQuery, BrigadiersQueryVariables>(BrigadiersDocument, options);
        }
export type BrigadiersQueryHookResult = ReturnType<typeof useBrigadiersQuery>;
export type BrigadiersLazyQueryHookResult = ReturnType<typeof useBrigadiersLazyQuery>;
export type BrigadiersSuspenseQueryHookResult = ReturnType<typeof useBrigadiersSuspenseQuery>;
export type BrigadiersQueryResult = Apollo.QueryResult<BrigadiersQuery, BrigadiersQueryVariables>;
export const CreateBrigadierDocument = gql`
    mutation CreateBrigadier($input: CreateBrigadierInput!) {
  createBrigadier(input: $input) {
    id
    name
    apartment
    block
    phone
    role
    roleLabel
    certificationDate
    certificationExpiry
    certificationBody
    certificationStatus
    active
    observations
    createdAt
    updatedAt
    createdBy
  }
}
    `;
export type CreateBrigadierMutationFn = Apollo.MutationFunction<CreateBrigadierMutation, CreateBrigadierMutationVariables>;

/**
 * __useCreateBrigadierMutation__
 *
 * To run a mutation, you first call `useCreateBrigadierMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateBrigadierMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createBrigadierMutation, { data, loading, error }] = useCreateBrigadierMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateBrigadierMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateBrigadierMutation, CreateBrigadierMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateBrigadierMutation, CreateBrigadierMutationVariables>(CreateBrigadierDocument, options);
      }
export type CreateBrigadierMutationHookResult = ReturnType<typeof useCreateBrigadierMutation>;
export type CreateBrigadierMutationResult = Apollo.MutationResult<CreateBrigadierMutation>;
export type CreateBrigadierMutationOptions = Apollo.BaseMutationOptions<CreateBrigadierMutation, CreateBrigadierMutationVariables>;
export const UpdateBrigadierDocument = gql`
    mutation UpdateBrigadier($id: ID!, $input: UpdateBrigadierInput!) {
  updateBrigadier(id: $id, input: $input) {
    id
    name
    apartment
    block
    phone
    role
    roleLabel
    certificationDate
    certificationExpiry
    certificationBody
    certificationStatus
    active
    observations
    createdAt
    updatedAt
    createdBy
  }
}
    `;
export type UpdateBrigadierMutationFn = Apollo.MutationFunction<UpdateBrigadierMutation, UpdateBrigadierMutationVariables>;

/**
 * __useUpdateBrigadierMutation__
 *
 * To run a mutation, you first call `useUpdateBrigadierMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateBrigadierMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateBrigadierMutation, { data, loading, error }] = useUpdateBrigadierMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateBrigadierMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateBrigadierMutation, UpdateBrigadierMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateBrigadierMutation, UpdateBrigadierMutationVariables>(UpdateBrigadierDocument, options);
      }
export type UpdateBrigadierMutationHookResult = ReturnType<typeof useUpdateBrigadierMutation>;
export type UpdateBrigadierMutationResult = Apollo.MutationResult<UpdateBrigadierMutation>;
export type UpdateBrigadierMutationOptions = Apollo.BaseMutationOptions<UpdateBrigadierMutation, UpdateBrigadierMutationVariables>;
export const DeleteBrigadierDocument = gql`
    mutation DeleteBrigadier($id: ID!) {
  deleteBrigadier(id: $id)
}
    `;
export type DeleteBrigadierMutationFn = Apollo.MutationFunction<DeleteBrigadierMutation, DeleteBrigadierMutationVariables>;

/**
 * __useDeleteBrigadierMutation__
 *
 * To run a mutation, you first call `useDeleteBrigadierMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteBrigadierMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteBrigadierMutation, { data, loading, error }] = useDeleteBrigadierMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteBrigadierMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteBrigadierMutation, DeleteBrigadierMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteBrigadierMutation, DeleteBrigadierMutationVariables>(DeleteBrigadierDocument, options);
      }
export type DeleteBrigadierMutationHookResult = ReturnType<typeof useDeleteBrigadierMutation>;
export type DeleteBrigadierMutationResult = Apollo.MutationResult<DeleteBrigadierMutation>;
export type DeleteBrigadierMutationOptions = Apollo.BaseMutationOptions<DeleteBrigadierMutation, DeleteBrigadierMutationVariables>;
export const NotifyBrigadiersDocument = gql`
    mutation NotifyBrigadiers($input: NotifyBrigadiersInput!) {
  notifyBrigadiers(input: $input) {
    id
    channel
    recipients
    message
    sentAt
    status
    createdAt
    updatedAt
    createdBy
  }
}
    `;
export type NotifyBrigadiersMutationFn = Apollo.MutationFunction<NotifyBrigadiersMutation, NotifyBrigadiersMutationVariables>;

/**
 * __useNotifyBrigadiersMutation__
 *
 * To run a mutation, you first call `useNotifyBrigadiersMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useNotifyBrigadiersMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [notifyBrigadiersMutation, { data, loading, error }] = useNotifyBrigadiersMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useNotifyBrigadiersMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<NotifyBrigadiersMutation, NotifyBrigadiersMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<NotifyBrigadiersMutation, NotifyBrigadiersMutationVariables>(NotifyBrigadiersDocument, options);
      }
export type NotifyBrigadiersMutationHookResult = ReturnType<typeof useNotifyBrigadiersMutation>;
export type NotifyBrigadiersMutationResult = Apollo.MutationResult<NotifyBrigadiersMutation>;
export type NotifyBrigadiersMutationOptions = Apollo.BaseMutationOptions<NotifyBrigadiersMutation, NotifyBrigadiersMutationVariables>;
export const NotificationsDocument = gql`
    query Notifications {
  notifications {
    id
    type
    title
    description
    severity
    date
    read
  }
}
    `;

/**
 * __useNotificationsQuery__
 *
 * To run a query within a React component, call `useNotificationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useNotificationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNotificationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useNotificationsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<NotificationsQuery, NotificationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<NotificationsQuery, NotificationsQueryVariables>(NotificationsDocument, options);
      }
export function useNotificationsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<NotificationsQuery, NotificationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<NotificationsQuery, NotificationsQueryVariables>(NotificationsDocument, options);
        }
// @ts-ignore
export function useNotificationsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<NotificationsQuery, NotificationsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<NotificationsQuery, NotificationsQueryVariables>;
export function useNotificationsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<NotificationsQuery, NotificationsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<NotificationsQuery | undefined, NotificationsQueryVariables>;
export function useNotificationsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<NotificationsQuery, NotificationsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<NotificationsQuery, NotificationsQueryVariables>(NotificationsDocument, options);
        }
export type NotificationsQueryHookResult = ReturnType<typeof useNotificationsQuery>;
export type NotificationsLazyQueryHookResult = ReturnType<typeof useNotificationsLazyQuery>;
export type NotificationsSuspenseQueryHookResult = ReturnType<typeof useNotificationsSuspenseQuery>;
export type NotificationsQueryResult = Apollo.QueryResult<NotificationsQuery, NotificationsQueryVariables>;
export const MarkNotificationReadDocument = gql`
    mutation MarkNotificationRead($id: ID!) {
  markNotificationRead(id: $id) {
    id
    type
    title
    description
    severity
    date
    read
  }
}
    `;
export type MarkNotificationReadMutationFn = Apollo.MutationFunction<MarkNotificationReadMutation, MarkNotificationReadMutationVariables>;

/**
 * __useMarkNotificationReadMutation__
 *
 * To run a mutation, you first call `useMarkNotificationReadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkNotificationReadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markNotificationReadMutation, { data, loading, error }] = useMarkNotificationReadMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useMarkNotificationReadMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<MarkNotificationReadMutation, MarkNotificationReadMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<MarkNotificationReadMutation, MarkNotificationReadMutationVariables>(MarkNotificationReadDocument, options);
      }
export type MarkNotificationReadMutationHookResult = ReturnType<typeof useMarkNotificationReadMutation>;
export type MarkNotificationReadMutationResult = Apollo.MutationResult<MarkNotificationReadMutation>;
export type MarkNotificationReadMutationOptions = Apollo.BaseMutationOptions<MarkNotificationReadMutation, MarkNotificationReadMutationVariables>;
export const MarkAllNotificationsReadDocument = gql`
    mutation MarkAllNotificationsRead {
  markAllNotificationsRead {
    id
    type
    title
    description
    severity
    date
    read
  }
}
    `;
export type MarkAllNotificationsReadMutationFn = Apollo.MutationFunction<MarkAllNotificationsReadMutation, MarkAllNotificationsReadMutationVariables>;

/**
 * __useMarkAllNotificationsReadMutation__
 *
 * To run a mutation, you first call `useMarkAllNotificationsReadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkAllNotificationsReadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markAllNotificationsReadMutation, { data, loading, error }] = useMarkAllNotificationsReadMutation({
 *   variables: {
 *   },
 * });
 */
export function useMarkAllNotificationsReadMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<MarkAllNotificationsReadMutation, MarkAllNotificationsReadMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<MarkAllNotificationsReadMutation, MarkAllNotificationsReadMutationVariables>(MarkAllNotificationsReadDocument, options);
      }
export type MarkAllNotificationsReadMutationHookResult = ReturnType<typeof useMarkAllNotificationsReadMutation>;
export type MarkAllNotificationsReadMutationResult = Apollo.MutationResult<MarkAllNotificationsReadMutation>;
export type MarkAllNotificationsReadMutationOptions = Apollo.BaseMutationOptions<MarkAllNotificationsReadMutation, MarkAllNotificationsReadMutationVariables>;