import { apiConfig, API_ENDPOINTS } from "../config/api.config";
import { getHttpClient } from "./http.client";
import type {
  Equipment,
  CreateEquipmentDto,
  UpdateEquipmentDto,
  EquipmentFilters,
} from "../types";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_EQUIPMENT: Equipment[] = [
  { id: "EQ-001", name: "Ar-condicionado Split", type: "Climatização", brand: "Midea", model: "MSplit 12000 BTU", serialNumber: "MID-2024-001", patrimonyCode: "PAT-2024-001", location: "Bloco A - Sala 01", status: "Ativo", acquisitionDate: "15/03/2024", warrantyExpiry: "15/03/2026", lastMaintenance: "10/04/2026", nextMaintenance: "15/06/2026", value: 3500 },
  { id: "EQ-002", name: "Elevador Social", type: "Transporte", brand: "Thyssenkrupp", model: "Synergy 2000", serialNumber: "TK-2022-445", patrimonyCode: "PAT-2022-002", location: "Torre Principal", status: "Manutenção", acquisitionDate: "20/01/2022", warrantyExpiry: "20/01/2025", lastMaintenance: "01/05/2026", nextMaintenance: "02/06/2026", value: 85000 },
  { id: "EQ-003", name: "Gerador 150kVA", type: "Elétrica", brand: "Stemac", model: "SGP-150", serialNumber: "STM-2021-089", patrimonyCode: "PAT-2021-003", location: "Casa de Máquinas", status: "Ativo", acquisitionDate: "10/06/2021", warrantyExpiry: "10/06/2023", lastMaintenance: "15/04/2026", nextMaintenance: "20/07/2026", value: 120000 },
  { id: "EQ-004", name: "Bomba d'água 1", type: "Hidráulica", brand: "Grundfos", model: "CM5-5", serialNumber: "GF-2023-112", patrimonyCode: "PAT-2023-004", location: "Subsolo", status: "Ativo", acquisitionDate: "05/08/2023", warrantyExpiry: "05/08/2025", lastMaintenance: "20/03/2026", nextMaintenance: "10/06/2026", value: 8500 },
  { id: "EQ-005", name: "CFTV - Câmera 03", type: "Segurança", brand: "Intelbras", model: "VHD 1220 D G6", serialNumber: "INT-2023-334", patrimonyCode: "PAT-2023-005", location: "Portaria", status: "Alerta", acquisitionDate: "12/11/2023", warrantyExpiry: "12/11/2025", lastMaintenance: "01/02/2026", nextMaintenance: "05/06/2026", value: 650 },
  { id: "EQ-006", name: "Bomba Piscina", type: "Hidráulica", brand: "Dancor", model: "CV-1", serialNumber: "DAN-2024-078", patrimonyCode: "PAT-2024-006", location: "Área de Lazer", status: "Ativo", acquisitionDate: "20/02/2024", warrantyExpiry: "20/02/2026", lastMaintenance: "10/05/2026", nextMaintenance: "10/08/2026", value: 2800 },
  { id: "EQ-007", name: "Central de Incêndio", type: "Segurança", brand: "UNIPOS", model: "FS-5100", serialNumber: "UNI-2020-055", patrimonyCode: "PAT-2020-007", location: "Recepção", status: "Ativo", acquisitionDate: "15/09/2020", warrantyExpiry: "15/09/2022", lastMaintenance: "05/05/2026", nextMaintenance: "05/08/2026", value: 15000 },
  { id: "EQ-008", name: "Portão Eletrônico", type: "Segurança", brand: "Ppa", model: "Motor F1000", serialNumber: "PPA-2023-201", patrimonyCode: "PAT-2023-008", location: "Entrada Principal", status: "Inativo", acquisitionDate: "30/04/2023", warrantyExpiry: "30/04/2025", lastMaintenance: "01/03/2026", nextMaintenance: "01/06/2026", value: 4200 },
];

let _mockStore = [...MOCK_EQUIPMENT];

// ─── Interface (Repository Pattern) ──────────────────────────────────────────

export interface IEquipmentService {
  findAll(filters?: EquipmentFilters): Promise<Equipment[]>;
  findById(id: string): Promise<Equipment>;
  create(dto: CreateEquipmentDto): Promise<Equipment>;
  update(id: string, dto: UpdateEquipmentDto): Promise<Equipment>;
  remove(id: string): Promise<void>;
}

// ─── Mock Implementation ──────────────────────────────────────────────────────

class MockEquipmentService implements IEquipmentService {
  private delay = () => new Promise((r) => setTimeout(r, 200));

  async findAll(filters?: EquipmentFilters): Promise<Equipment[]> {
    await this.delay();
    let result = [..._mockStore];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.patrimonyCode.toLowerCase().includes(q),
      );
    }
    if (filters?.type && filters.type !== "all") result = result.filter((e) => e.type === filters.type);
    if (filters?.status && filters.status !== "all") result = result.filter((e) => e.status === filters.status);
    return result;
  }

  async findById(id: string): Promise<Equipment> {
    await this.delay();
    const item = _mockStore.find((e) => e.id === id);
    if (!item) throw new Error(`Equipment ${id} not found`);
    return { ...item };
  }

  async create(dto: CreateEquipmentDto): Promise<Equipment> {
    await this.delay();
    const newItem: Equipment = {
      ...dto,
      id: `EQ-${String(_mockStore.length + 1).padStart(3, "0")}`,
      patrimonyCode: `PAT-2026-${String(_mockStore.length + 1).padStart(3, "0")}`,
      lastMaintenance: "",
      createdAt: new Date().toISOString(),
    };
    _mockStore = [newItem, ..._mockStore];
    return { ...newItem };
  }

  async update(id: string, dto: UpdateEquipmentDto): Promise<Equipment> {
    await this.delay();
    const idx = _mockStore.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error(`Equipment ${id} not found`);
    _mockStore[idx] = { ..._mockStore[idx], ...dto, updatedAt: new Date().toISOString() };
    return { ..._mockStore[idx] };
  }

  async remove(id: string): Promise<void> {
    await this.delay();
    _mockStore = _mockStore.filter((e) => e.id !== id);
  }
}

// ─── Real API Implementation ──────────────────────────────────────────────────

class ApiEquipmentService implements IEquipmentService {
  private http = getHttpClient();

  findAll(filters?: EquipmentFilters): Promise<Equipment[]> {
    const params: Record<string, string> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.type && filters.type !== "all") params.type = filters.type;
    if (filters?.status && filters.status !== "all") params.status = filters.status;
    return this.http.get<Equipment[]>(API_ENDPOINTS.equipment.base, params);
  }

  findById(id: string): Promise<Equipment> {
    return this.http.get<Equipment>(API_ENDPOINTS.equipment.byId(id));
  }

  create(dto: CreateEquipmentDto): Promise<Equipment> {
    return this.http.post<Equipment>(API_ENDPOINTS.equipment.base, dto);
  }

  update(id: string, dto: UpdateEquipmentDto): Promise<Equipment> {
    return this.http.patch<Equipment>(API_ENDPOINTS.equipment.byId(id), dto);
  }

  remove(id: string): Promise<void> {
    return this.http.delete(API_ENDPOINTS.equipment.byId(id));
  }
}

// ─── Factory – selects implementation based on config ────────────────────────

export const equipmentService: IEquipmentService = apiConfig.useMock
  ? new MockEquipmentService()
  : new ApiEquipmentService();
