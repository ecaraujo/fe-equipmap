import type { AuditFields } from "./common.types";

export type ParkingSpotType = "Padrão" | "Deficiente" | "Moto" | "Especial";

export interface Apartment extends AuditFields {
  id: string;
  unit: string;
  block: string;
  ownerName: string;
  phone: string;
  email?: string;
  floor: number;
  hasVehicle: boolean;
}

export interface ParkingSpot extends AuditFields {
  id: string;
  number: string;
  type: ParkingSpotType;
  covered: boolean;
  floor: string;
  assignedTo?: string;
}

export interface LotteryResult extends AuditFields {
  id: string;
  apartmentId: string;
  spotId: string;
  unit: string;
  block: string;
  ownerName: string;
  spotNumber: string;
  spotType: string;
  drawnAt: string;
}

export interface CreateApartmentDto {
  unit: string;
  block: string;
  ownerName: string;
  phone: string;
  email?: string;
  floor: number;
  hasVehicle: boolean;
}

export type UpdateApartmentDto = Partial<CreateApartmentDto>;

export interface CreateSpotDto {
  number: string;
  type: ParkingSpotType;
  covered: boolean;
  floor: string;
}

export type UpdateSpotDto = Partial<CreateSpotDto>;
