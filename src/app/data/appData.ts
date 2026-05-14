// Shared application data used for notifications and pages

export interface NotificationItem {
  id: string;
  type: "warranty_expired" | "warranty_expiring" | "maintenance_overdue" | "maintenance_pending";
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  date?: string;
}

export const NOTIFICATIONS: NotificationItem[] = [
  // Manutenções atrasadas
  {
    id: "n1",
    type: "maintenance_overdue",
    title: "Elevador Social",
    description: "Manutenção atrasada desde 02/05/2026",
    severity: "high",
  },
  {
    id: "n2",
    type: "maintenance_overdue",
    title: "Bomba Piscina",
    description: "Manutenção atrasada desde 01/05/2026",
    severity: "high",
  },
  // Manutenções pendentes urgentes
  {
    id: "n3",
    type: "maintenance_pending",
    title: "CFTV - Câmera 03",
    description: "Manutenção corretiva em 05/06/2026",
    severity: "medium",
  },
  {
    id: "n4",
    type: "maintenance_pending",
    title: "Bomba d'água 1",
    description: "Manutenção preventiva em 10/06/2026",
    severity: "low",
  },
  // Garantias vencendo
  {
    id: "n5",
    type: "warranty_expiring",
    title: "Ar-condicionado Split",
    description: "Garantia vence em 15/03/2026 (33 dias)",
    severity: "medium",
  },
  {
    id: "n6",
    type: "warranty_expiring",
    title: "Bomba Piscina",
    description: "Garantia vence em 20/02/2026 (8 dias)",
    severity: "high",
  },
  // Garantias vencidas
  {
    id: "n7",
    type: "warranty_expired",
    title: "Elevador Social",
    description: "Garantia vencida em 20/01/2025",
    severity: "high",
  },
  {
    id: "n8",
    type: "warranty_expired",
    title: "Gerador 150kVA",
    description: "Garantia vencida em 10/06/2023",
    severity: "high",
  },
  {
    id: "n9",
    type: "warranty_expired",
    title: "Bomba d'água 1",
    description: "Garantia vencida em 05/08/2025",
    severity: "high",
  },
  {
    id: "n10",
    type: "warranty_expired",
    title: "CFTV - Câmera 03",
    description: "Garantia vencida em 12/11/2025",
    severity: "high",
  },
  {
    id: "n11",
    type: "warranty_expired",
    title: "Central de Incêndio",
    description: "Garantia vencida em 15/09/2022",
    severity: "high",
  },
  {
    id: "n12",
    type: "warranty_expired",
    title: "Portão Eletrônico",
    description: "Garantia vencida em 30/04/2025",
    severity: "high",
  },
];
