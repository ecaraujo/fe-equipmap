import { apiConfig, API_ENDPOINTS } from "../config/api.config";
import { getHttpClient } from "./http.client";
import type {
  Brigadier,
  NotificationLog,
  CreateBrigadierDto,
  UpdateBrigadierDto,
  SendNotificationDto,
} from "../types";

const MOCK_BRIGADIERS: Brigadier[] = [
  { id: "br1", name: "Carlos Eduardo Mendes", apartment: "101", block: "A", phone: "(11) 98765-0001", role: "Brigadista Chefe", certificationDate: "10/03/2025", certificationExpiry: "10/03/2027", certificationBody: "SESMT Treinamentos", active: true },
  { id: "br2", name: "Ana Paula Lima", apartment: "203", block: "A", phone: "(11) 98765-0002", role: "Sub-Chefe", certificationDate: "15/04/2025", certificationExpiry: "15/04/2027", certificationBody: "SESMT Treinamentos", active: true },
  { id: "br3", name: "Roberto Alves", apartment: "305", block: "B", phone: "(11) 98765-0003", role: "Brigadista", certificationDate: "20/01/2025", certificationExpiry: "20/01/2027", certificationBody: "Corpo de Bombeiros", active: true },
  { id: "br4", name: "Fernanda Costa", apartment: "412", block: "B", phone: "(11) 98765-0004", role: "Brigadista", certificationDate: "05/06/2024", certificationExpiry: "05/06/2026", certificationBody: "SESMT Treinamentos", active: true, observations: "Certificação próxima do vencimento" },
  { id: "br5", name: "Marcos Rodrigues", apartment: "502", block: "C", phone: "(11) 98765-0005", role: "Brigadista", certificationDate: "12/02/2023", certificationExpiry: "12/02/2025", certificationBody: "Corpo de Bombeiros", active: false, observations: "Certificação vencida - aguardando renovação" },
  { id: "br6", name: "Juliana Ferreira", apartment: "601", block: "C", phone: "(11) 98765-0006", role: "Brigadista", certificationDate: "18/08/2025", certificationExpiry: "18/08/2027", certificationBody: "SENAC", active: true },
];

let _mockBrigadiers = [...MOCK_BRIGADIERS];
let _mockLogs: NotificationLog[] = [];

export interface IBrigadierService {
  findAll(search?: string): Promise<Brigadier[]>;
  findById(id: string): Promise<Brigadier>;
  create(dto: CreateBrigadierDto): Promise<Brigadier>;
  update(id: string, dto: UpdateBrigadierDto): Promise<Brigadier>;
  remove(id: string): Promise<void>;
  sendNotification(dto: SendNotificationDto): Promise<NotificationLog>;
  getNotificationLogs(): Promise<NotificationLog[]>;
}

class MockBrigadierService implements IBrigadierService {
  private delay = () => new Promise((r) => setTimeout(r, 200));

  async findAll(search?: string): Promise<Brigadier[]> {
    await this.delay();
    if (!search) return [..._mockBrigadiers];
    const q = search.toLowerCase();
    return _mockBrigadiers.filter(
      (b) => b.name.toLowerCase().includes(q) || b.apartment.includes(q) || b.role.toLowerCase().includes(q),
    );
  }

  async findById(id: string): Promise<Brigadier> {
    await this.delay();
    const item = _mockBrigadiers.find((b) => b.id === id);
    if (!item) throw new Error(`Brigadier ${id} not found`);
    return { ...item };
  }

  async create(dto: CreateBrigadierDto): Promise<Brigadier> {
    await this.delay();
    const item: Brigadier = { ...dto, id: `br${Date.now()}`, createdAt: new Date().toISOString() };
    _mockBrigadiers = [..._mockBrigadiers, item];
    return { ...item };
  }

  async update(id: string, dto: UpdateBrigadierDto): Promise<Brigadier> {
    await this.delay();
    const idx = _mockBrigadiers.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error(`Brigadier ${id} not found`);
    _mockBrigadiers[idx] = { ..._mockBrigadiers[idx], ...dto };
    return { ..._mockBrigadiers[idx] };
  }

  async remove(id: string): Promise<void> {
    await this.delay();
    _mockBrigadiers = _mockBrigadiers.filter((b) => b.id !== id);
  }

  async sendNotification(dto: SendNotificationDto): Promise<NotificationLog> {
    await this.delay();
    const recipients = _mockBrigadiers
      .filter((b) => dto.recipientIds.includes(b.id))
      .map((b) => b.name);

    const log: NotificationLog = {
      id: `log-${Date.now()}`,
      channel: dto.channel,
      recipients,
      message: dto.message,
      sentAt: new Date().toLocaleString("pt-BR"),
      status: "sent",
      createdAt: new Date().toISOString(),
    };
    _mockLogs = [log, ..._mockLogs];
    return { ...log };
  }

  async getNotificationLogs(): Promise<NotificationLog[]> {
    await this.delay();
    return [..._mockLogs];
  }
}

class ApiBrigadierService implements IBrigadierService {
  private http = getHttpClient();

  findAll(search?: string): Promise<Brigadier[]> {
    return this.http.get<Brigadier[]>(API_ENDPOINTS.brigadiers.base, search ? { search } : undefined);
  }
  findById(id: string): Promise<Brigadier> {
    return this.http.get<Brigadier>(API_ENDPOINTS.brigadiers.byId(id));
  }
  create(dto: CreateBrigadierDto): Promise<Brigadier> {
    return this.http.post<Brigadier>(API_ENDPOINTS.brigadiers.base, dto);
  }
  update(id: string, dto: UpdateBrigadierDto): Promise<Brigadier> {
    return this.http.patch<Brigadier>(API_ENDPOINTS.brigadiers.byId(id), dto);
  }
  remove(id: string): Promise<void> {
    return this.http.delete(API_ENDPOINTS.brigadiers.byId(id));
  }
  sendNotification(dto: SendNotificationDto): Promise<NotificationLog> {
    return this.http.post<NotificationLog>(API_ENDPOINTS.brigadiers.notify, dto);
  }
  getNotificationLogs(): Promise<NotificationLog[]> {
    return this.http.get<NotificationLog[]>(API_ENDPOINTS.brigadiers.logs);
  }
}

export const brigadierService: IBrigadierService = apiConfig.useMock
  ? new MockBrigadierService()
  : new ApiBrigadierService();
