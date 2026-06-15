import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  Plus,
  Search,
  Download,
  Upload,
  MoreHorizontal,
  QrCode,
  Wrench,
  Trash2,
  Edit,
  Package,
  Loader2,
  Copy,
  Printer,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { useEquipment } from "../../hooks/useEquipment";
import { useMaintenance } from "../../hooks/useMaintenance";
import type { CreateEquipmentDto, CreateMaintenanceDto, Equipment, EquipmentFilters } from "../../graphql/models";
import { EQUIPMENT_TYPES } from "../../graphql/models";

const statusConfig: Record<string, { label: string; className: string }> = {
  Ativo: { label: "Ativo", className: "bg-green-100 text-green-700 border-green-200" },
  Manutencao: { label: "Manutencao", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  "ManutenÃ§Ã£o": { label: "Manutencao", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  Alerta: { label: "Alerta", className: "bg-red-100 text-red-700 border-red-200" },
  Inativo: { label: "Inativo", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

const defaultEquipmentForm: Partial<CreateEquipmentDto> = { status: "Ativo" };
const defaultMaintenanceForm: Partial<CreateMaintenanceDto> = { type: "Preventiva" };

function toDateInput(value?: string | null): string {
  if (!value) return "";
  const iso = value.match(/^(\d{4})-\d{2}-\d{2}/);
  if (iso) return value.slice(0, 10);
  const pt = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (pt) return `${pt[3]}-${pt[2]}-${pt[1]}`;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function todayInput(): string {
  return new Date().toISOString().slice(0, 10);
}

function equipmentToForm(equipment: Equipment): Partial<CreateEquipmentDto> {
  return {
    name: equipment.name,
    type: equipment.type,
    brand: equipment.brand,
    model: equipment.model,
    serialNumber: equipment.serialNumber,
    location: equipment.location,
    status: equipment.status,
    acquisitionDate: toDateInput(equipment.acquisitionDate),
    warrantyExpiry: toDateInput(equipment.warrantyExpiry),
    nextMaintenance: toDateInput(equipment.nextMaintenance),
    value: equipment.value,
  };
}

function getMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Nao foi possivel concluir a operacao.";
}

function buildEquipmentQrPayload(equipment: Equipment): string {
  return JSON.stringify({
    r: "equipmap.equipment",
    id: equipment.id,
    n: equipment.name,
    pc: equipment.patrimonyCode,
    tp: equipment.type,
    br: equipment.brand,
    md: equipment.model,
    sn: equipment.serialNumber,
    loc: equipment.location,
    st: equipment.status,
    acq: equipment.acquisitionDate,
    warr: equipment.warrantyExpiry,
    last: equipment.lastMaintenance ?? null,
    next: equipment.nextMaintenance,
    val: equipment.value,
  });
}

function printEquipmentQr(equipment: Equipment, qrSvg: string): void {
  const escape = (value: string | number | null | undefined) =>
    String(value ?? "-").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char] ?? char));

  const rows = [
    ["ID", equipment.id],
    ["Codigo de patrimonio", equipment.patrimonyCode],
    ["Nome", equipment.name],
    ["Tipo", equipment.type],
    ["Marca", equipment.brand],
    ["Modelo", equipment.model],
    ["Numero de serie", equipment.serialNumber],
    ["Localizacao", equipment.location],
    ["Status", equipment.status],
    ["Data de aquisicao", equipment.acquisitionDate],
    ["Vencimento da garantia", equipment.warrantyExpiry],
    ["Ultima manutencao", equipment.lastMaintenance],
    ["Proxima manutencao", equipment.nextMaintenance],
    ["Valor", `R$ ${equipment.value.toLocaleString("pt-BR")}`],
  ];

  const frame = document.createElement("iframe");
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  document.body.appendChild(frame);

  const frameDocument = frame.contentDocument;
  if (!frameDocument) {
    frame.remove();
    throw new Error("Nao foi possivel preparar a impressao.");
  }

  frameDocument.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>QR Code - ${escape(equipment.patrimonyCode)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111827; margin: 24px; }
    .sheet { max-width: 680px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; border-bottom: 1px solid #d1d5db; padding-bottom: 16px; margin-bottom: 18px; }
    .brand { color: #1d4ed8; font-weight: 700; font-size: 18px; margin-bottom: 8px; }
    h1 { font-size: 22px; margin: 0 0 6px; }
    .subtitle { color: #6b7280; font-size: 13px; }
    .qr { flex: 0 0 auto; border: 1px solid #d1d5db; padding: 10px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { text-align: left; border-bottom: 1px solid #e5e7eb; padding: 8px 6px; vertical-align: top; }
    th { width: 210px; color: #6b7280; font-weight: 600; }
    @media print {
      body { margin: 12mm; }
      .sheet { max-width: none; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <div class="brand">EquipMap</div>
        <h1>${escape(equipment.name)}</h1>
        <div class="subtitle">${escape(equipment.patrimonyCode)} - ${escape(equipment.location)}</div>
      </div>
      <div class="qr">${qrSvg}</div>
    </div>
    <table>
      <tbody>
        ${rows.map(([label, value]) => `<tr><th>${escape(label)}</th><td>${escape(value)}</td></tr>`).join("")}
      </tbody>
    </table>
  </div>
</body>
</html>`);
  frameDocument.close();

  window.setTimeout(() => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    window.setTimeout(() => frame.remove(), 1000);
  }, 100);
}

export function InventoryPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [equipmentForm, setEquipmentForm] = useState<Partial<CreateEquipmentDto>>(defaultEquipmentForm);
  const [maintenanceEquipment, setMaintenanceEquipment] = useState<Equipment | null>(null);
  const [maintenanceForm, setMaintenanceForm] = useState<Partial<CreateMaintenanceDto>>(defaultMaintenanceForm);
  const [qrEquipment, setQrEquipment] = useState<Equipment | null>(null);
  const [qrImage, setQrImage] = useState("");
  const [qrSvg, setQrSvg] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const filters: EquipmentFilters = { search, type: filterType as EquipmentFilters["type"], status: filterStatus as EquipmentFilters["status"] };
  const { data: filtered, isLoading, error, create, update, remove } = useEquipment(filters);
  const { create: createMaintenance } = useMaintenance();

  const closeEquipmentModal = () => {
    setShowEquipmentModal(false);
    setEditingEquipment(null);
    setEquipmentForm(defaultEquipmentForm);
  };

  const openCreateEquipment = () => {
    setActionError(null);
    setEditingEquipment(null);
    setEquipmentForm(defaultEquipmentForm);
    setShowEquipmentModal(true);
  };

  const openEditEquipment = (equipment: Equipment) => {
    setActionError(null);
    setSelectedEquipment(null);
    setEditingEquipment(equipment);
    setEquipmentForm(equipmentToForm(equipment));
    setShowEquipmentModal(true);
  };

  const openMaintenanceModal = (equipment: Equipment) => {
    setActionError(null);
    setSelectedEquipment(null);
    setMaintenanceEquipment(equipment);
    setMaintenanceForm({
      type: "Preventiva",
      scheduledDate: toDateInput(equipment.nextMaintenance) || todayInput(),
      technician: "",
      provider: "",
      description: `Manutencao de ${equipment.name}`,
    });
  };

  const openQrModal = (equipment: Equipment) => {
    setActionError(null);
    setSelectedEquipment(null);
    setQrEquipment(equipment);
  };

  const handleSaveEquipment = async () => {
    if (!equipmentForm.name || !equipmentForm.brand || !equipmentForm.type || !equipmentForm.location) {
      setActionError("Preencha nome, marca, tipo e localizacao do equipamento.");
      return;
    }

    setIsSaving(true);
    setActionError(null);
    try {
      if (editingEquipment) {
        await update(editingEquipment.id, equipmentForm);
      } else {
        await create(equipmentForm as CreateEquipmentDto);
      }
      closeEquipmentModal();
    } catch (err) {
      setActionError(getMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleScheduleMaintenance = async () => {
    if (!maintenanceEquipment || !maintenanceForm.type || !maintenanceForm.scheduledDate || !maintenanceForm.description) {
      setActionError("Preencha tipo, data agendada e descricao da manutencao.");
      return;
    }

    setIsSaving(true);
    setActionError(null);
    try {
      await createMaintenance({
        equipment: maintenanceEquipment.name,
        equipmentId: maintenanceEquipment.id,
        type: maintenanceForm.type,
        scheduledDate: maintenanceForm.scheduledDate,
        technician: maintenanceForm.technician || undefined,
        provider: maintenanceForm.provider || undefined,
        description: maintenanceForm.description,
      });
      setMaintenanceEquipment(null);
      setMaintenanceForm(defaultMaintenanceForm);
    } catch (err) {
      setActionError(getMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveEquipment = async (id: string) => {
    setActionError(null);
    try {
      await remove(id);
    } catch (err) {
      setActionError(getMessage(err));
    }
  };

  const qrPayload = useMemo(() => (qrEquipment ? buildEquipmentQrPayload(qrEquipment) : ""), [qrEquipment]);

  useEffect(() => {
    let active = true;
    if (!qrPayload) {
      setQrImage("");
      setQrSvg("");
      return;
    }

    const options = {
      errorCorrectionLevel: "M" as const,
      margin: 4,
      width: 360,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    };

    Promise.all([
      QRCode.toDataURL(qrPayload, options),
      QRCode.toString(qrPayload, { ...options, type: "svg" as const }),
    ])
      .then(([dataUrl, svg]) => {
        if (active) {
          setQrImage(dataUrl);
          setQrSvg(svg);
        }
      })
      .catch((err) => {
        if (active) {
          setQrImage("");
          setQrSvg("");
          setActionError(getMessage(err));
        }
      });

    return () => {
      active = false;
    };
  }, [qrPayload]);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-900">Inventario</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isLoading ? "Carregando..." : `${filtered.length} equipamentos encontrados`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="w-4 h-4" /> Importar
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" /> Exportar
          </Button>
          <Button
            size="sm"
            className="bg-blue-700 hover:bg-blue-800 text-white gap-2"
            onClick={openCreateEquipment}
          >
            <Plus className="w-4 h-4" /> Novo equipamento
          </Button>
        </div>
      </div>

      {(actionError || error) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError || error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, ID ou codigo de patrimonio..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {EQUIPMENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="ManutenÃ§Ã£o">Manutencao</SelectItem>
              <SelectItem value="Alerta">Alerta</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Equipamento</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Patrimonio</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Tipo</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Localizacao</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Prox. manut.</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((equipment) => {
                const status = statusConfig[equipment.status] ?? statusConfig.Ativo;
                return (
                  <tr
                    key={equipment.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedEquipment(equipment)}
                  >
                    <td className="px-5 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{equipment.name}</div>
                        <div className="text-xs text-gray-400">{equipment.id} - {equipment.brand} {equipment.model}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-600 font-mono">{equipment.patrimonyCode}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-600">{equipment.type}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-600">{equipment.location}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-sm text-gray-600">{equipment.nextMaintenance}</span>
                    </td>
                    <td className="px-5 py-4" onClick={(event) => event.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={() => setSelectedEquipment(equipment)}>
                            <Package className="w-4 h-4" /> Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => openEditEquipment(equipment)}>
                            <Edit className="w-4 h-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => openMaintenanceModal(equipment)}>
                            <Wrench className="w-4 h-4" /> Agendar manutencao
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => openQrModal(equipment)}>
                            <QrCode className="w-4 h-4" /> QR Code
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-red-600" onClick={() => handleRemoveEquipment(equipment.id)}>
                            <Trash2 className="w-4 h-4" /> Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Nenhum equipamento encontrado</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!selectedEquipment} onOpenChange={() => setSelectedEquipment(null)}>
        <DialogContent className="max-w-2xl">
          {selectedEquipment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  {selectedEquipment.name}
                </DialogTitle>
                <DialogDescription>
                  Dados atuais carregados do BFF para este equipamento.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <InfoRow label="ID" value={selectedEquipment.id} />
                <InfoRow label="Codigo de Patrimonio" value={selectedEquipment.patrimonyCode} mono />
                <InfoRow label="Marca" value={selectedEquipment.brand} />
                <InfoRow label="Modelo" value={selectedEquipment.model} />
                <InfoRow label="Numero de Serie" value={selectedEquipment.serialNumber} mono />
                <InfoRow label="Tipo" value={selectedEquipment.type} />
                <InfoRow label="Localizacao" value={selectedEquipment.location} />
                <InfoRow label="Status" value={selectedEquipment.status} />
                <InfoRow label="Data de Aquisicao" value={selectedEquipment.acquisitionDate} />
                <InfoRow label="Venc. da Garantia" value={selectedEquipment.warrantyExpiry} />
                <InfoRow label="Ultima Manutencao" value={selectedEquipment.lastMaintenance || "-"} />
                <InfoRow label="Prox. Manutencao" value={selectedEquipment.nextMaintenance} />
                <InfoRow label="Valor" value={`R$ ${selectedEquipment.value.toLocaleString("pt-BR")}`} />
              </div>
              <DialogFooter className="gap-2 mt-2">
                <Button variant="outline" className="gap-2" onClick={() => openQrModal(selectedEquipment)}>
                  <QrCode className="w-4 h-4" /> QR Code
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => openMaintenanceModal(selectedEquipment)}>
                  <Wrench className="w-4 h-4" /> Agendar manutencao
                </Button>
                <Button className="bg-blue-700 hover:bg-blue-800 text-white gap-2" onClick={() => openEditEquipment(selectedEquipment)}>
                  <Edit className="w-4 h-4" /> Editar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showEquipmentModal} onOpenChange={(open) => (open ? setShowEquipmentModal(true) : closeEquipmentModal())}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEquipment ? "Editar equipamento" : "Cadastrar novo equipamento"}</DialogTitle>
            <DialogDescription className="sr-only">Formulario de equipamento.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="col-span-2 space-y-1.5">
              <Label>Nome do equipamento *</Label>
              <Input value={equipmentForm.name ?? ""} placeholder="Ex: Ar-condicionado Split 12000 BTU" onChange={(event) => setEquipmentForm({ ...equipmentForm, name: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Marca *</Label>
              <Input value={equipmentForm.brand ?? ""} placeholder="Ex: Midea" onChange={(event) => setEquipmentForm({ ...equipmentForm, brand: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Modelo</Label>
              <Input value={equipmentForm.model ?? ""} placeholder="Ex: MSplit 12000" onChange={(event) => setEquipmentForm({ ...equipmentForm, model: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Numero de serie</Label>
              <Input value={equipmentForm.serialNumber ?? ""} placeholder="Ex: MID-2024-001" onChange={(event) => setEquipmentForm({ ...equipmentForm, serialNumber: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo *</Label>
              <Select value={equipmentForm.type} onValueChange={(value) => setEquipmentForm({ ...equipmentForm, type: value as Equipment["type"] })}>
                <SelectTrigger><SelectValue placeholder="Selecionar tipo" /></SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Localizacao *</Label>
              <Input value={equipmentForm.location ?? ""} placeholder="Ex: Bloco A - Sala 01" onChange={(event) => setEquipmentForm({ ...equipmentForm, location: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={equipmentForm.status ?? "Ativo"} onValueChange={(value) => setEquipmentForm({ ...equipmentForm, status: value as Equipment["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="ManutenÃ§Ã£o">Manutencao</SelectItem>
                  <SelectItem value="Alerta">Alerta</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Data de aquisicao</Label>
              <Input type="date" value={equipmentForm.acquisitionDate ?? ""} onChange={(event) => setEquipmentForm({ ...equipmentForm, acquisitionDate: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Vencimento da garantia</Label>
              <Input type="date" value={equipmentForm.warrantyExpiry ?? ""} onChange={(event) => setEquipmentForm({ ...equipmentForm, warrantyExpiry: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Proxima manutencao</Label>
              <Input type="date" value={equipmentForm.nextMaintenance ?? ""} onChange={(event) => setEquipmentForm({ ...equipmentForm, nextMaintenance: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Valor de aquisicao (R$)</Label>
              <Input type="number" value={equipmentForm.value ?? ""} placeholder="0,00" onChange={(event) => setEquipmentForm({ ...equipmentForm, value: Number(event.target.value) })} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={closeEquipmentModal}>Cancelar</Button>
            <Button className="bg-blue-700 hover:bg-blue-800 text-white gap-2" onClick={handleSaveEquipment} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingEquipment ? "Salvar alteracoes" : "Cadastrar equipamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!maintenanceEquipment} onOpenChange={() => setMaintenanceEquipment(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Agendar manutencao</DialogTitle>
            <DialogDescription>
              Cria uma manutencao real no BFF para o equipamento selecionado.
            </DialogDescription>
          </DialogHeader>
          {maintenanceEquipment && (
            <div className="space-y-4 mt-2">
              <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-sm">
                <div className="font-medium text-gray-900">{maintenanceEquipment.name}</div>
                <div className="text-gray-500">{maintenanceEquipment.patrimonyCode}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Tipo *</Label>
                  <Select value={maintenanceForm.type} onValueChange={(value) => setMaintenanceForm({ ...maintenanceForm, type: value as CreateMaintenanceDto["type"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Preventiva">Preventiva</SelectItem>
                      <SelectItem value="Corretiva">Corretiva</SelectItem>
                      <SelectItem value="Preditiva">Preditiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Data agendada *</Label>
                  <Input type="date" value={maintenanceForm.scheduledDate ?? ""} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, scheduledDate: event.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Tecnico</Label>
                  <Input value={maintenanceForm.technician ?? ""} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, technician: event.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Empresa</Label>
                  <Input value={maintenanceForm.provider ?? ""} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, provider: event.target.value })} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Descricao *</Label>
                  <Input value={maintenanceForm.description ?? ""} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, description: event.target.value })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setMaintenanceEquipment(null)}>Cancelar</Button>
            <Button className="bg-blue-700 hover:bg-blue-800 text-white gap-2" onClick={handleScheduleMaintenance} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Agendar manutencao
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!qrEquipment} onOpenChange={() => setQrEquipment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-600" />
              QR Code
            </DialogTitle>
            <DialogDescription>
              QR Code gerado com todos os dados atuais do equipamento carregados pelo BFF.
            </DialogDescription>
          </DialogHeader>
          {qrEquipment && (
            <div className="grid gap-4 md:grid-cols-[220px_1fr] mt-2">
              <div className="rounded-lg border border-gray-200 bg-white p-3 flex items-center justify-center">
                {qrImage ? (
                  <img src={qrImage} alt="QR Code do equipamento" className="h-60 w-60" style={{ imageRendering: "pixelated" }} />
                ) : (
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                )}
              </div>
              <div className="space-y-3 min-w-0">
                <div>
                  <div className="text-sm font-medium text-gray-900">{qrEquipment.name}</div>
                  <div className="text-xs text-gray-500">{qrEquipment.patrimonyCode} - {qrEquipment.location}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <InfoRow label="Status" value={qrEquipment.status} />
                  <InfoRow label="Tipo" value={qrEquipment.type} />
                  <InfoRow label="Marca" value={qrEquipment.brand} />
                  <InfoRow label="Modelo" value={qrEquipment.model} />
                  <InfoRow label="Serie" value={qrEquipment.serialNumber} />
                  <InfoRow label="Prox. manut." value={qrEquipment.nextMaintenance} />
                </div>
                <pre className="max-h-40 rounded-lg bg-gray-950 text-gray-50 p-3 text-xs overflow-auto">{JSON.stringify(JSON.parse(qrPayload), null, 2)}</pre>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setQrEquipment(null)}>Fechar</Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                if (qrEquipment && qrSvg) printEquipmentQr(qrEquipment, qrSvg);
              }}
              disabled={!qrSvg}
            >
              <Printer className="w-4 h-4" /> Imprimir
            </Button>
            <Button
              className="bg-blue-700 hover:bg-blue-800 text-white gap-2"
              onClick={() => void navigator.clipboard?.writeText(qrPayload)}
            >
              <Copy className="w-4 h-4" /> Copiar dados
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-sm text-gray-900 ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
