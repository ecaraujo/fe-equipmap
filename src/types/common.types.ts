/** Resultado paginado retornado pela API */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Estado genérico de carregamento assíncrono */
export interface AsyncState<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
}

/** Filtros base comuns a todos os recursos */
export interface BaseFilters {
  search?: string;
  page?: number;
  pageSize?: number;
}

/** DTO base para criação/atualização com campos de auditoria */
export interface AuditFields {
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}
