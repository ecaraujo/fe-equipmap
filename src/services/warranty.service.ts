import { apiConfig, API_ENDPOINTS } from "../config/api.config";
import { getHttpClient } from "./http.client";
import type { Warranty, CreateWarrantyDto, UpdateWarrantyDto, WarrantyFilters } from "../types";

const MOCK_WARRANTIES: Warranty[] = [
  { id: "GAR-001", equipment: "Ar-condicionado Split", equipmentId: "EQ-001", brand: "Midea", model: "MSplit 12000 BTU", serialNumber: "MID-2024-001", supplier: "TechAr Distribuidora", supplierContact: "(11) 98765-4321", purchaseDate: "15/03/2024", warrantyStart: "15/03/2024", warrantyEnd: "15/03/2026", warrantyMonths: 24, type: "Fabricante", status: "Vencendo", observations: "Garantia válida para defeitos de fabricação." },
  { id: "GAR-002", equipment: "Elevador Social", equipmentId: "EQ-002", brand: "Thyssenkrupp", model: "Synergy 2000", serialNumber: "TK-2022-445", supplier: "Thyssenkrupp Elevadores", supplierContact: "(11) 4004-5555", purchaseDate: "20/01/2022", warrantyStart: "20/01/2022", warrantyEnd: "20/01/2025", warrantyMonths: 36, type: "Fabricante", status: "Vencida" },
  { id: "GAR-003", equipment: "Gerador 150kVA", equipmentId: "EQ-003", brand: "Stemac", model: "SGP-150", serialNumber: "STM-2021-089", supplier: "Stemac Equipamentos", supplierContact: "(51) 3232-0000", purchaseDate: "10/06/2021", warrantyStart: "10/06/2021", warrantyEnd: "10/06/2023", warrantyMonths: 24, type: "Fabricante", status: "Vencida" },
  { id: "GAR-004", equipment: "Bomba d'água 1", equipmentId: "EQ-004", brand: "Grundfos", model: "CM5-5", serialNumber: "GF-2023-112", supplier: "Hidro Sistemas Ltda", supplierContact: "(11) 3456-7890", purchaseDate: "05/08/2023", warrantyStart: "05/08/2023", warrantyEnd: "05/08/2025", warrantyMonths: 24, type: "Fabricante", status: "Vencida" },
  { id: "GAR-005", equipment: "CFTV - Câmera 03", equipmentId: "EQ-005", brand: "Intelbras", model: "VHD 1220 D G6", serialNumber: "INT-2023-334", supplier: "Segurana Sistemas", supplierContact: "(11) 91234-5678", purchaseDate: "12/11/2023", warrantyStart: "12/11/2023", warrantyEnd: "12/11/2025", warrantyMonths: 24, type: "Fabricante", status: "Vencida" },
  { id: "GAR-006", equipment: "Bomba Piscina", equipmentId: "EQ-006", brand: "Dancor", model: "CV-1", serialNumber: "DAN-2024-078", supplier: "Aquática Distribuidora", supplierContact: "(11) 92345-6789", purchaseDate: "20/02/2024", warrantyStart: "20/02/2024", warrantyEnd: "20/02/2026", warrantyMonths: 24, type: "Fabricante", status: "Vencendo" },
  { id: "GAR-007", equipment: "Central de Incêndio", equipmentId: "EQ-007", brand: "UNIPOS", model: "FS-5100", serialNumber: "UNI-2020-055", supplier: "ProtFogo Sistemas", supplierContact: "(11) 3567-8901", purchaseDate: "15/09/2020", warrantyStart: "15/09/2020", warrantyEnd: "15/09/2022", warrantyMonths: 24, type: "Fabricante", status: "Vencida" },
  { id: "GAR-008", equipment: "Portão Eletrônico - Motor", equipmentId: "EQ-008", brand: "PPA", model: "Motor F1000", serialNumber: "PPA-2026-009", supplier: "PPA Service", supplierContact: "(11) 4005-5555", purchaseDate: "16/04/2026", warrantyStart: "16/04/2026", warrantyEnd: "16/07/2026", warrantyMonths: 3, type: "Serviço", status: "Vigente", observations: "Garantia de 90 dias da peça substituída" },
  { id: "GAR-009", equipment: "Ar-condicionado Split", equipmentId: "EQ-001", brand: "ClimaTech", model: "Instalação e Serviço", serialNumber: "—", supplier: "ClimaTech Serviços", supplierContact: "(11) 98000-1234", purchaseDate: "15/03/2024", warrantyStart: "15/03/2024", warrantyEnd: "15/03/2027", warrantyMonths: 36, type: "Serviço", status: "Vigente", observations: "Garantia de instalação e mão de obra" },
];

let _mockStore = [...MOCK_WARRANTIES];

export interface IWarrantyService {
  findAll(filters?: WarrantyFilters): Promise<Warranty[]>;
  findById(id: string): Promise<Warranty>;
  create(dto: CreateWarrantyDto): Promise<Warranty>;
  update(id: string, dto: UpdateWarrantyDto): Promise<Warranty>;
  remove(id: string): Promise<void>;
}

class MockWarrantyService implements IWarrantyService {
  private delay = () => new Promise((r) => setTimeout(r, 200));

  async findAll(filters?: WarrantyFilters): Promise<Warranty[]> {
    await this.delay();
    let result = [..._mockStore];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (w) => w.equipment.toLowerCase().includes(q) || w.id.toLowerCase().includes(q) || w.brand.toLowerCase().includes(q),
      );
    }
    if (filters?.status && filters.status !== "all") result = result.filter((w) => w.status === filters.status);
    if (filters?.type && filters.type !== "all") result = result.filter((w) => w.type === filters.type);
    return result;
  }

  async findById(id: string): Promise<Warranty> {
    await this.delay();
    const item = _mockStore.find((w) => w.id === id);
    if (!item) throw new Error(`Warranty ${id} not found`);
    return { ...item };
  }

  async create(dto: CreateWarrantyDto): Promise<Warranty> {
    await this.delay();
    const item: Warranty = {
      ...dto,
      id: `GAR-${String(_mockStore.length + 1).padStart(3, "0")}`,
      equipmentId: dto.equipmentId ?? "",
      serialNumber: dto.serialNumber ?? "",
      supplierContact: dto.supplierContact ?? "",
      warrantyMonths: dto.warrantyMonths ?? 12,
      status: "Vigente",
      createdAt: new Date().toISOString(),
    };
    _mockStore = [item, ..._mockStore];
    return { ...item };
  }

  async update(id: string, dto: UpdateWarrantyDto): Promise<Warranty> {
    await this.delay();
    const idx = _mockStore.findIndex((w) => w.id === id);
    if (idx === -1) throw new Error(`Warranty ${id} not found`);
    _mockStore[idx] = { ..._mockStore[idx], ...dto, updatedAt: new Date().toISOString() };
    return { ..._mockStore[idx] };
  }

  async remove(id: string): Promise<void> {
    await this.delay();
    _mockStore = _mockStore.filter((w) => w.id !== id);
  }
}

class ApiWarrantyService implements IWarrantyService {
  private http = getHttpClient();

  findAll(filters?: WarrantyFilters): Promise<Warranty[]> {
    const params: Record<string, string> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.status && filters.status !== "all") params.status = filters.status;
    if (filters?.type && filters.type !== "all") params.type = filters.type;
    return this.http.get<Warranty[]>(API_ENDPOINTS.warranty.base, params);
  }

  findById(id: string): Promise<Warranty> {
    return this.http.get<Warranty>(API_ENDPOINTS.warranty.byId(id));
  }

  create(dto: CreateWarrantyDto): Promise<Warranty> {
    return this.http.post<Warranty>(API_ENDPOINTS.warranty.base, dto);
  }

  update(id: string, dto: UpdateWarrantyDto): Promise<Warranty> {
    return this.http.patch<Warranty>(API_ENDPOINTS.warranty.byId(id), dto);
  }

  remove(id: string): Promise<void> {
    return this.http.delete(API_ENDPOINTS.warranty.byId(id));
  }
}

export const warrantyService: IWarrantyService = apiConfig.useMock
  ? new MockWarrantyService()
  : new ApiWarrantyService();
