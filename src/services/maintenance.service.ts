import { apiConfig, API_ENDPOINTS } from "../config/api.config";
import { getHttpClient } from "./http.client";
import type {
  MaintenanceRecord,
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
  CompleteMaintenanceDto,
  MaintenanceFilters,
} from "../types";

const MOCK_RECORDS: MaintenanceRecord[] = [
  { id: "MAN-001", equipment: "Elevador Social", equipmentId: "EQ-002", type: "Preventiva", status: "Atrasada", scheduledDate: "02/05/2026", technician: "Carlos Oliveira", provider: "Thyssenkrupp Serviços", description: "Inspeção mensal e lubrificação dos cabos" },
  { id: "MAN-002", equipment: "CFTV - Câmera 03", equipmentId: "EQ-005", type: "Corretiva", status: "Pendente", scheduledDate: "05/06/2026", description: "Câmera com imagem borrada, necessita substituição de lente" },
  { id: "MAN-003", equipment: "Bomba d'água 1", equipmentId: "EQ-004", type: "Preventiva", status: "Pendente", scheduledDate: "10/06/2026", technician: "Roberto Santos", description: "Troca de vedações e verificação de pressão" },
  { id: "MAN-004", equipment: "Ar-condicionado Split", equipmentId: "EQ-001", type: "Preventiva", status: "Pendente", scheduledDate: "15/06/2026", provider: "ClimaTech Serviços", description: "Limpeza de filtros e higienização completa" },
  { id: "MAN-005", equipment: "Gerador 150kVA", equipmentId: "EQ-003", type: "Preventiva", status: "Em andamento", scheduledDate: "10/05/2026", technician: "Paulo Mendes", provider: "Stemac Assistência", description: "Troca de óleo, filtros e verificação elétrica", cost: 850 },
  { id: "MAN-006", equipment: "Portão Eletrônico", equipmentId: "EQ-008", type: "Corretiva", status: "Concluída", scheduledDate: "15/04/2026", completedDate: "16/04/2026", technician: "Marcos Lima", provider: "PPA Service", description: "Motor com falha no acionamento automático", cost: 320, observations: "Motor substituído. Garantia de 90 dias na peça" },
  { id: "MAN-007", equipment: "Central de Incêndio", equipmentId: "EQ-007", type: "Preventiva", status: "Concluída", scheduledDate: "05/05/2026", completedDate: "05/05/2026", technician: "André Costa", description: "Teste anual dos sensores e sirenes", cost: 500 },
  { id: "MAN-008", equipment: "Bomba Piscina", equipmentId: "EQ-006", type: "Preventiva", status: "Atrasada", scheduledDate: "01/05/2026", description: "Limpeza do filtro e verificação do sistema" },
];

let _mockStore = [...MOCK_RECORDS];

export interface IMaintenanceService {
  findAll(filters?: MaintenanceFilters): Promise<MaintenanceRecord[]>;
  findById(id: string): Promise<MaintenanceRecord>;
  create(dto: CreateMaintenanceDto): Promise<MaintenanceRecord>;
  update(id: string, dto: UpdateMaintenanceDto): Promise<MaintenanceRecord>;
  complete(id: string, dto: CompleteMaintenanceDto): Promise<MaintenanceRecord>;
  remove(id: string): Promise<void>;
}

class MockMaintenanceService implements IMaintenanceService {
  private delay = () => new Promise((r) => setTimeout(r, 200));

  async findAll(filters?: MaintenanceFilters): Promise<MaintenanceRecord[]> {
    await this.delay();
    let result = [..._mockStore];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (r) => r.equipment.toLowerCase().includes(q) || r.id.toLowerCase().includes(q),
      );
    }
    if (filters?.status && filters.status !== "all") result = result.filter((r) => r.status === filters.status);
    if (filters?.type && filters.type !== "all") result = result.filter((r) => r.type === filters.type);
    return result;
  }

  async findById(id: string): Promise<MaintenanceRecord> {
    await this.delay();
    const item = _mockStore.find((r) => r.id === id);
    if (!item) throw new Error(`Maintenance ${id} not found`);
    return { ...item };
  }

  async create(dto: CreateMaintenanceDto): Promise<MaintenanceRecord> {
    await this.delay();
    const item: MaintenanceRecord = {
      ...dto,
      id: `MAN-${String(_mockStore.length + 1).padStart(3, "0")}`,
      equipmentId: dto.equipmentId ?? "",
      status: "Pendente",
      createdAt: new Date().toISOString(),
    };
    _mockStore = [item, ..._mockStore];
    return { ...item };
  }

  async update(id: string, dto: UpdateMaintenanceDto): Promise<MaintenanceRecord> {
    await this.delay();
    const idx = _mockStore.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Maintenance ${id} not found`);
    _mockStore[idx] = { ..._mockStore[idx], ...dto, updatedAt: new Date().toISOString() };
    return { ..._mockStore[idx] };
  }

  async complete(id: string, dto: CompleteMaintenanceDto): Promise<MaintenanceRecord> {
    await this.delay();
    const idx = _mockStore.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Maintenance ${id} not found`);
    _mockStore[idx] = { ..._mockStore[idx], ...dto, status: "Concluída", updatedAt: new Date().toISOString() };
    return { ..._mockStore[idx] };
  }

  async remove(id: string): Promise<void> {
    await this.delay();
    _mockStore = _mockStore.filter((r) => r.id !== id);
  }
}

class ApiMaintenanceService implements IMaintenanceService {
  private http = getHttpClient();

  findAll(filters?: MaintenanceFilters): Promise<MaintenanceRecord[]> {
    const params: Record<string, string> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.status && filters.status !== "all") params.status = filters.status;
    if (filters?.type && filters.type !== "all") params.type = filters.type;
    return this.http.get<MaintenanceRecord[]>(API_ENDPOINTS.maintenance.base, params);
  }

  findById(id: string): Promise<MaintenanceRecord> {
    return this.http.get<MaintenanceRecord>(API_ENDPOINTS.maintenance.byId(id));
  }

  create(dto: CreateMaintenanceDto): Promise<MaintenanceRecord> {
    return this.http.post<MaintenanceRecord>(API_ENDPOINTS.maintenance.base, dto);
  }

  update(id: string, dto: UpdateMaintenanceDto): Promise<MaintenanceRecord> {
    return this.http.patch<MaintenanceRecord>(API_ENDPOINTS.maintenance.byId(id), dto);
  }

  complete(id: string, dto: CompleteMaintenanceDto): Promise<MaintenanceRecord> {
    return this.http.post<MaintenanceRecord>(API_ENDPOINTS.maintenance.complete(id), dto);
  }

  remove(id: string): Promise<void> {
    return this.http.delete(API_ENDPOINTS.maintenance.byId(id));
  }
}

export const maintenanceService: IMaintenanceService = apiConfig.useMock
  ? new MockMaintenanceService()
  : new ApiMaintenanceService();
