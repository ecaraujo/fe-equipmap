import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Calendar,
  ChevronRight,
  FileText,
  AlertTriangle,
  Clock,
  Upload,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useWarranty } from "../../hooks/useWarranty";
import type { Warranty, CreateWarrantyDto } from "../../types";

function daysUntil(dateStr: string): number {
  const [day, month, year] = dateStr.split("/").map(Number);
  const target = new Date(year, month - 1, day);
  const now = new Date(2026, 4, 12);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function warrantyProgress(start: string, end: string): number {
  const [ds, ms, ys] = start.split("/").map(Number);
  const [de, me, ye] = end.split("/").map(Number);
  const now = new Date(2026, 4, 12);
  const startDate = new Date(ys, ms - 1, ds);
  const endDate = new Date(ye, me - 1, de);
  const total = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType; progressColor: string }> = {
  "Vigente": { label: "Vigente", className: "bg-green-100 text-green-700 border-green-200", icon: ShieldCheck, progressColor: "bg-green-500" },
  "Vencendo": { label: "Vencendo em breve", className: "bg-amber-100 text-amber-700 border-amber-200", icon: ShieldAlert, progressColor: "bg-amber-500" },
  "Vencida": { label: "Vencida", className: "bg-red-100 text-red-700 border-red-200", icon: ShieldOff, progressColor: "bg-red-400" },
};

const typeColors: Record<string, string> = {
  "Fabricante": "bg-blue-100 text-blue-700 border-blue-200",
  "Fornecedor": "bg-purple-100 text-purple-700 border-purple-200",
  "Estendida": "bg-teal-100 text-teal-700 border-teal-200",
  "Serviço": "bg-orange-100 text-orange-700 border-orange-200",
};

export function WarrantyPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWarranty, setNewWarranty] = useState<Partial<CreateWarrantyDto>>({ type: "Fabricante" });

  const { data: allWarranties, isLoading, create } = useWarranty({ search });

  const tabFilter = (w: Warranty) => {
    if (activeTab === "active") return w.status === "Vigente";
    if (activeTab === "expiring") return w.status === "Vencendo";
    if (activeTab === "expired") return w.status === "Vencida";
    return true;
  };

  const filtered = useMemo(() => allWarranties.filter(tabFilter), [allWarranties, activeTab]);

  const counts = useMemo(() => ({
    all: allWarranties.length,
    active: allWarranties.filter((w) => w.status === "Vigente").length,
    expiring: allWarranties.filter((w) => w.status === "Vencendo").length,
    expired: allWarranties.filter((w) => w.status === "Vencida").length,
  }), [allWarranties]);

  const handleAdd = async () => {
    await create(newWarranty as CreateWarrantyDto);
    setShowAddModal(false);
    setNewWarranty({ type: "Fabricante" });
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-900">Garantias</h1>
          <p className="text-sm text-gray-500 mt-0.5">Controle de garantias de equipamentos e serviços</p>
        </div>
        <Button
          size="sm"
          className="bg-blue-700 hover:bg-blue-800 text-white gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4" /> Nova garantia
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: counts.all, icon: Shield, color: "text-gray-600", bg: "bg-gray-100" },
          { label: "Vigentes", value: counts.active, icon: ShieldCheck, color: "text-green-600", bg: "bg-green-100" },
          { label: "Vencendo", value: counts.expiring, icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-100" },
          { label: "Vencidas", value: counts.expired, icon: ShieldOff, color: "text-red-600", bg: "bg-red-100" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cards */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por equipamento, marca ou ID..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4 border-b border-gray-100">
            <TabsList className="bg-transparent border-none rounded-none h-10 gap-4 p-0">
              {[
                { value: "all", label: `Todas (${counts.all})` },
                { value: "active", label: `Vigentes (${counts.active})` },
                { value: "expiring", label: `Vencendo (${counts.expiring})` },
                { value: "expired", label: `Vencidas (${counts.expired})` },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="border-b-2 border-transparent data-[state=active]:border-blue-700 data-[state=active]:text-blue-700 rounded-none pb-0 h-10 text-sm text-gray-500"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="m-0 p-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((warranty) => {
                const status = statusConfig[warranty.status];
                const StatusIcon = status.icon;
                const days = daysUntil(warranty.warrantyEnd);
                const progress = warrantyProgress(warranty.warrantyStart, warranty.warrantyEnd);
                return (
                  <div
                    key={warranty.id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-200"
                    onClick={() => setSelectedWarranty(warranty)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        warranty.status === "Vigente" ? "bg-green-100" :
                        warranty.status === "Vencendo" ? "bg-amber-100" : "bg-red-100"
                      }`}>
                        <StatusIcon className={`w-5 h-5 ${
                          warranty.status === "Vigente" ? "text-green-600" :
                          warranty.status === "Vencendo" ? "text-amber-600" : "text-red-500"
                        }`} />
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${typeColors[warranty.type]}`}>
                        {warranty.type}
                      </span>
                    </div>

                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-gray-900 leading-tight">{warranty.equipment}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{warranty.brand} {warranty.model}</p>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">Progresso da garantia</span>
                        <span className={`font-medium ${
                          warranty.status === "Vigente" ? "text-green-600" :
                          warranty.status === "Vencendo" ? "text-amber-600" : "text-red-600"
                        }`}>
                          {warranty.status === "Vencida" ? "Vencida" : `${days}d restantes`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${status.progressColor}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {warranty.warrantyStart}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {warranty.warrantyEnd}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400 truncate">
                      {warranty.supplier}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma garantia encontrada</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedWarranty} onOpenChange={() => setSelectedWarranty(null)}>
        <DialogContent className="max-w-lg">
          {selectedWarranty && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  {selectedWarranty.equipment}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[selectedWarranty.status].className}`}>
                    {selectedWarranty.status}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${typeColors[selectedWarranty.type]}`}>
                    {selectedWarranty.type}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">Progresso</span>
                    <span className="font-medium text-gray-700">
                      {selectedWarranty.status === "Vencida"
                        ? `Vencida em ${selectedWarranty.warrantyEnd}`
                        : `${daysUntil(selectedWarranty.warrantyEnd)} dias restantes`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${statusConfig[selectedWarranty.status].progressColor}`}
                      style={{ width: `${warrantyProgress(selectedWarranty.warrantyStart, selectedWarranty.warrantyEnd)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-400 text-xs">Marca / Modelo</span><div className="text-gray-900">{selectedWarranty.brand} {selectedWarranty.model}</div></div>
                  <div><span className="text-gray-400 text-xs">N° de Série</span><div className="text-gray-900 font-mono">{selectedWarranty.serialNumber}</div></div>
                  <div><span className="text-gray-400 text-xs">Fornecedor</span><div className="text-gray-900">{selectedWarranty.supplier}</div></div>
                  <div><span className="text-gray-400 text-xs">Contato</span><div className="text-gray-900">{selectedWarranty.supplierContact}</div></div>
                  <div><span className="text-gray-400 text-xs">Início da garantia</span><div className="text-gray-900">{selectedWarranty.warrantyStart}</div></div>
                  <div><span className="text-gray-400 text-xs">Fim da garantia</span><div className="text-gray-900">{selectedWarranty.warrantyEnd}</div></div>
                  <div><span className="text-gray-400 text-xs">Duração</span><div className="text-gray-900">{selectedWarranty.warrantyMonths} meses</div></div>
                  <div><span className="text-gray-400 text-xs">Data de compra</span><div className="text-gray-900">{selectedWarranty.purchaseDate}</div></div>
                </div>

                {selectedWarranty.observations && (
                  <div>
                    <span className="text-gray-400 text-xs">Observações</span>
                    <p className="text-sm text-gray-900 mt-1">{selectedWarranty.observations}</p>
                  </div>
                )}
              </div>
              <DialogFooter className="mt-2">
                <Button variant="outline" className="gap-2">
                  <Upload className="w-4 h-4" /> Anexar documento
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar garantia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Equipamento *</Label>
              <Input placeholder="Nome do equipamento" onChange={(e) => setNewWarranty({ ...newWarranty, equipment: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Marca *</Label>
                <Input placeholder="Ex: Midea" onChange={(e) => setNewWarranty({ ...newWarranty, brand: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Modelo</Label>
                <Input placeholder="Ex: MSplit 12000" onChange={(e) => setNewWarranty({ ...newWarranty, model: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de garantia *</Label>
              <Select defaultValue="Fabricante" onValueChange={(v) => setNewWarranty({ ...newWarranty, type: v as Warranty["type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fabricante">Fabricante</SelectItem>
                  <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                  <SelectItem value="Estendida">Estendida</SelectItem>
                  <SelectItem value="Serviço">Serviço</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fornecedor *</Label>
              <Input placeholder="Nome do fornecedor/fabricante" onChange={(e) => setNewWarranty({ ...newWarranty, supplier: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Contato do fornecedor</Label>
              <Input placeholder="Telefone ou e-mail" onChange={(e) => setNewWarranty({ ...newWarranty, supplierContact: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Início da garantia *</Label>
                <Input type="date" onChange={(e) => setNewWarranty({ ...newWarranty, warrantyStart: new Date(e.target.value).toLocaleDateString("pt-BR") })} />
              </div>
              <div className="space-y-1.5">
                <Label>Fim da garantia *</Label>
                <Input type="date" onChange={(e) => setNewWarranty({ ...newWarranty, warrantyEnd: new Date(e.target.value).toLocaleDateString("pt-BR") })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Input placeholder="Condições, restrições da garantia..." onChange={(e) => setNewWarranty({ ...newWarranty, observations: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancelar</Button>
            <Button className="bg-blue-700 hover:bg-blue-800 text-white" onClick={handleAdd}>
              Cadastrar garantia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
