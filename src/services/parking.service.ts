import { apiConfig, API_ENDPOINTS } from "../config/api.config";
import { getHttpClient } from "./http.client";
import type {
  Apartment,
  ParkingSpot,
  LotteryResult,
  CreateApartmentDto,
  UpdateApartmentDto,
  CreateSpotDto,
  UpdateSpotDto,
} from "../types";

const MOCK_APARTMENTS: Apartment[] = [
  { id: "apt1", unit: "101", block: "A", ownerName: "Carlos Mendes", phone: "(11) 98765-0001", email: "carlos@email.com", floor: 1, hasVehicle: true },
  { id: "apt2", unit: "102", block: "A", ownerName: "Ana Lima", phone: "(11) 98765-0002", floor: 1, hasVehicle: true },
  { id: "apt3", unit: "201", block: "A", ownerName: "Roberto Alves", phone: "(11) 98765-0003", floor: 2, hasVehicle: false },
  { id: "apt4", unit: "202", block: "A", ownerName: "Fernanda Costa", phone: "(11) 98765-0004", floor: 2, hasVehicle: true },
  { id: "apt5", unit: "301", block: "B", ownerName: "Marcos Souza", phone: "(11) 98765-0005", floor: 3, hasVehicle: true },
  { id: "apt6", unit: "302", block: "B", ownerName: "Juliana Ferreira", phone: "(11) 98765-0006", floor: 3, hasVehicle: true },
  { id: "apt7", unit: "401", block: "B", ownerName: "Paulo Rodrigues", phone: "(11) 98765-0007", floor: 4, hasVehicle: true },
  { id: "apt8", unit: "402", block: "B", ownerName: "Cristina Barbosa", phone: "(11) 98765-0008", floor: 4, hasVehicle: false },
];

const MOCK_SPOTS: ParkingSpot[] = [
  { id: "sp1", number: "01", type: "Padrão", covered: true, floor: "Subsolo 1" },
  { id: "sp2", number: "02", type: "Padrão", covered: true, floor: "Subsolo 1" },
  { id: "sp3", number: "03", type: "Padrão", covered: true, floor: "Subsolo 1" },
  { id: "sp4", number: "04", type: "Padrão", covered: false, floor: "Térreo" },
  { id: "sp5", number: "05", type: "Deficiente", covered: true, floor: "Térreo" },
  { id: "sp6", number: "06", type: "Moto", covered: false, floor: "Térreo" },
  { id: "sp7", number: "07", type: "Padrão", covered: true, floor: "Subsolo 1" },
  { id: "sp8", number: "08", type: "Especial", covered: true, floor: "Subsolo 1" },
];

let _mockApartments = [...MOCK_APARTMENTS];
let _mockSpots = [...MOCK_SPOTS];
let _mockResults: LotteryResult[] = [];

export interface IParkingService {
  findAllApartments(): Promise<Apartment[]>;
  createApartment(dto: CreateApartmentDto): Promise<Apartment>;
  updateApartment(id: string, dto: UpdateApartmentDto): Promise<Apartment>;
  removeApartment(id: string): Promise<void>;
  findAllSpots(): Promise<ParkingSpot[]>;
  createSpot(dto: CreateSpotDto): Promise<ParkingSpot>;
  updateSpot(id: string, dto: UpdateSpotDto): Promise<ParkingSpot>;
  removeSpot(id: string): Promise<void>;
  getLotteryResults(): Promise<LotteryResult[]>;
  runLottery(): Promise<LotteryResult[]>;
  resetLottery(): Promise<void>;
}

class MockParkingService implements IParkingService {
  private delay = () => new Promise((r) => setTimeout(r, 200));

  async findAllApartments(): Promise<Apartment[]> {
    await this.delay();
    return [..._mockApartments];
  }

  async createApartment(dto: CreateApartmentDto): Promise<Apartment> {
    await this.delay();
    const item: Apartment = { ...dto, id: `apt${Date.now()}`, createdAt: new Date().toISOString() };
    _mockApartments = [..._mockApartments, item];
    return { ...item };
  }

  async updateApartment(id: string, dto: UpdateApartmentDto): Promise<Apartment> {
    await this.delay();
    const idx = _mockApartments.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error(`Apartment ${id} not found`);
    _mockApartments[idx] = { ..._mockApartments[idx], ...dto };
    return { ..._mockApartments[idx] };
  }

  async removeApartment(id: string): Promise<void> {
    await this.delay();
    _mockApartments = _mockApartments.filter((a) => a.id !== id);
  }

  async findAllSpots(): Promise<ParkingSpot[]> {
    await this.delay();
    return [..._mockSpots];
  }

  async createSpot(dto: CreateSpotDto): Promise<ParkingSpot> {
    await this.delay();
    const item: ParkingSpot = { ...dto, id: `sp${Date.now()}`, createdAt: new Date().toISOString() };
    _mockSpots = [..._mockSpots, item];
    return { ...item };
  }

  async updateSpot(id: string, dto: UpdateSpotDto): Promise<ParkingSpot> {
    await this.delay();
    const idx = _mockSpots.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Spot ${id} not found`);
    _mockSpots[idx] = { ..._mockSpots[idx], ...dto };
    return { ..._mockSpots[idx] };
  }

  async removeSpot(id: string): Promise<void> {
    await this.delay();
    _mockSpots = _mockSpots.filter((s) => s.id !== id);
  }

  async getLotteryResults(): Promise<LotteryResult[]> {
    await this.delay();
    return [..._mockResults];
  }

  async runLottery(): Promise<LotteryResult[]> {
    await new Promise((r) => setTimeout(r, 1500));
    const assigned = new Set(_mockResults.map((r) => r.apartmentId));
    const usedSpots = new Set(_mockResults.map((r) => r.spotId));

    const eligible = _mockApartments.filter((a) => a.hasVehicle && !assigned.has(a.id));
    const available = _mockSpots.filter((s) => !usedSpots.has(s.id));

    const shuffled = [...eligible].sort(() => Math.random() - 0.5);
    const shuffledSpots = [...available].sort(() => Math.random() - 0.5);
    const count = Math.min(shuffled.length, shuffledSpots.length);

    const newResults: LotteryResult[] = Array.from({ length: count }, (_, i) => ({
      id: `res-${Date.now()}-${i}`,
      apartmentId: shuffled[i].id,
      spotId: shuffledSpots[i].id,
      unit: shuffled[i].unit,
      block: shuffled[i].block,
      ownerName: shuffled[i].ownerName,
      spotNumber: shuffledSpots[i].number,
      spotType: shuffledSpots[i].type,
      drawnAt: new Date().toLocaleString("pt-BR"),
    }));

    _mockResults = [..._mockResults, ...newResults];
    return [..._mockResults];
  }

  async resetLottery(): Promise<void> {
    await this.delay();
    _mockResults = [];
  }
}

class ApiParkingService implements IParkingService {
  private http = getHttpClient();
  findAllApartments = () => this.http.get<Apartment[]>(API_ENDPOINTS.parking.apartments);
  createApartment = (dto: CreateApartmentDto) => this.http.post<Apartment>(API_ENDPOINTS.parking.apartments, dto);
  updateApartment = (id: string, dto: UpdateApartmentDto) => this.http.patch<Apartment>(API_ENDPOINTS.parking.apartmentById(id), dto);
  removeApartment = (id: string) => this.http.delete<void>(API_ENDPOINTS.parking.apartmentById(id));
  findAllSpots = () => this.http.get<ParkingSpot[]>(API_ENDPOINTS.parking.spots);
  createSpot = (dto: CreateSpotDto) => this.http.post<ParkingSpot>(API_ENDPOINTS.parking.spots, dto);
  updateSpot = (id: string, dto: UpdateSpotDto) => this.http.patch<ParkingSpot>(API_ENDPOINTS.parking.spotById(id), dto);
  removeSpot = (id: string) => this.http.delete<void>(API_ENDPOINTS.parking.spotById(id));
  getLotteryResults = () => this.http.get<LotteryResult[]>(API_ENDPOINTS.parking.results);
  runLottery = () => this.http.post<LotteryResult[]>(API_ENDPOINTS.parking.lottery, {});
  resetLottery = () => this.http.delete<void>(API_ENDPOINTS.parking.results);
}

export const parkingService: IParkingService = apiConfig.useMock
  ? new MockParkingService()
  : new ApiParkingService();
