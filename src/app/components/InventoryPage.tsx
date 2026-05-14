import { useState } from "react";
import {
  Plus,
  Search,
  Download,
  Upload,
  MoreHorizontal,
  QrCode,
  Wrench,
  FileText,
  Trash2,
  Edit,
  Package,
  Loader2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
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
import type { Equipment, CreateEquipmentDto, EquipmentFilters } from "../../types";
import { EQUIPMENT_TYPES } from "../../types";

const statusConfig: Record<string, { label: string; className: string }> = {
  Ativo: { label: "Ativo", className: "bg-green-100 text-green-700 border-green-200" },
  Manutenção: { label: "Manutenção", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  Alerta: { label: "Alerta", className: "bg-red-100 text-red-700 border-red-200" },
  Inativo: { label: "Inativo", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

export function InventoryPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [newEquipment, setNewEquipment] = useState<Partial<CreateEquipmentDto>>({ status: "Ativo" });
  const [isSaving, setIsSaving] = useState(false);

  const filters: EquipmentFilters = { search, type: filterType as EquipmentFilters["type"], status: filterStatus as EquipmentFilters["status"] };
  const { data: filtered, isLoading, create, remove } = useEquipment(filters);

  const handleAdd = async () => {
    setIsSaving(true);
    try {
      await create(newEquipment as CreateEquipmentDto);
      setShowAddModal(false);
      setNewEquipment({ status: "Ativo" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-900">Inventário</h1>
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
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4" /> Novo equipamento
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, ID ou código de patrimônio..."
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
              {EQUIPMENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
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
              <SelectItem value="Manutenção">Manutenção</SelectItem>
              <SelectItem value="Alerta">Alerta</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Equipamento</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Patrimônio</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Tipo</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Localização</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Próx. Manut.</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((eq) => {
                const status = statusConfig[eq.status];
                return (
                  <tr
                    key={eq.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedEquipment(eq)}
                  >
                    <td className="px-5 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{eq.name}</div>
                        <div className="text-xs text-gray-400">{eq.id} · {eq.brand} {eq.model}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-600 font-mono">{eq.patrimonyCode}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-600">{eq.type}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-600">{eq.location}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-sm text-gray-600">{eq.nextMaintenance}</span>
                    </td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={() => setSelectedEquipment(eq)}>
                            <Edit className="w-4 h-4" /> Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Wrench className="w-4 h-4" /> Registrar manutenção
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <QrCode className="w-4 h-4" /> Gerar QR Code
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <FileText className="w-4 h-4" /> Ver documentos
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-red-600" onClick={() => remove(eq.id)}>
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

      {/* Equipment Detail Modal */}
      <Dialog open={!!selectedEquipment} onOpenChange={() => setSelectedEquipment(null)}>
        <DialogContent className="max-w-2xl">
          {selectedEquipment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  {selectedEquipment.name}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <InfoRow label="ID" value={selectedEquipment.id} />
                <InfoRow label="Código de Patrimônio" value={selectedEquipment.patrimonyCode} mono />
                <InfoRow label="Marca" value={selectedEquipment.brand} />
                <InfoRow label="Modelo" value={selectedEquipment.model} />
                <InfoRow label="Número de Série" value={selectedEquipment.serialNumber} mono />
                <InfoRow label="Tipo" value={selectedEquipment.type} />
                <InfoRow label="Localização" value={selectedEquipment.location} />
                <InfoRow label="Status" value={selectedEquipment.status} />
                <InfoRow label="Data de Aquisição" value={selectedEquipment.acquisitionDate} />
                <InfoRow label="Venc. da Garantia" value={selectedEquipment.warrantyExpiry} />
                <InfoRow label="Última Manutenção" value={selectedEquipment.lastMaintenance || "—"} />
                <InfoRow label="Próx. Manutenção" value={selectedEquipment.nextMaintenance} />
                <InfoRow label="Valor" value={`R$ ${selectedEquipment.value.toLocaleString("pt-BR")}`} />
              </div>
              <DialogFooter className="gap-2 mt-2">
                <Button variant="outline" className="gap-2">
                  <QrCode className="w-4 h-4" /> QR Code
                </Button>
                <Button variant="outline" className="gap-2">
                  <Wrench className="w-4 h-4" /> Agendar manutenção
                </Button>
                <Button className="bg-blue-700 hover:bg-blue-800 text-white gap-2">
                  <Edit className="w-4 h-4" /> Editar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Equipment Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar novo equipamento</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="col-span-2 space-y-1.5">
              <Label>Nome do equipamento *</Label>
              <Input placeholder="Ex: Ar-condicionado Split 12000 BTU" onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Marca *</Label>
              <Input placeholder="Ex: Midea" onChange={(e) => setNewEquipment({ ...newEquipment, brand: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Modelo</Label>
              <Input placeholder="Ex: MSplit 12000" onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Número de série</Label>
              <Input placeholder="Ex: MID-2024-001" onChange={(e) => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo *</Label>
              <Select onValueChange={(v) => setNewEquipment({ ...newEquipment, type: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar tipo" /></SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Localização *</Label>
              <Input placeholder="Ex: Bloco A - Sala 01" onChange={(e) => setNewEquipment({ ...newEquipment, location: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select defaultValue="Ativo" onValueChange={(v) => setNewEquipment({ ...newEquipment, status: v as Equipment["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Manutenção">Manutenção</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Data de aquisição</Label>
              <Input type="date" onChange={(e) => setNewEquipment({ ...newEquipment, acquisitionDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Vencimento da garantia</Label>
              <Input type="date" onChange={(e) => setNewEquipment({ ...newEquipment, warrantyExpiry: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Próxima manutenção</Label>
              <Input type="date" onChange={(e) => setNewEquipment({ ...newEquipment, nextMaintenance: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Valor de aquisição (R$)</Label>
              <Input type="number" placeholder="0,00" onChange={(e) => setNewEquipment({ ...newEquipment, value: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancelar</Button>
            <Button className="bg-blue-700 hover:bg-blue-800 text-white" onClick={handleAdd}>
              Cadastrar equipamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-sm text-gray-900 ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
