import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Wrench,
  ChevronRight,
  Trash2,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useMaintenance } from "../../hooks/useMaintenance";
import type { MaintenanceRecord, CreateMaintenanceDto } from "../../graphql/models";

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  "Pendente": { label: "Pendente", className: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
  "Em andamento": { label: "Em andamento", className: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Wrench },
  "Concluída": { label: "Concluída", className: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  "Atrasada": { label: "Atrasada", className: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle },
  "Cancelada": { label: "Cancelada", className: "bg-gray-100 text-gray-600 border-gray-200", icon: XCircle },
};

const typeConfig: Record<string, string> = {
  "Preventiva": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Corretiva": "bg-orange-100 text-orange-700 border-orange-200",
  "Preditiva": "bg-teal-100 text-teal-700 border-teal-200",
};

function formatCurrency(value?: number | null): string | null {
  return typeof value === "number" ? `R$ ${value.toLocaleString("pt-BR")}` : null;
}

export function MaintenancePage() {
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<CreateMaintenanceDto>>({ type: "Preventiva" });
  const [activeTab, setActiveTab] = useState("all");
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: allRecords, isLoading, create, complete, remove } = useMaintenance({ search });

  const tabFilter = (r: MaintenanceRecord) => {
    if (activeTab === "pending") return r.status === "Pendente" || r.status === "Em andamento";
    if (activeTab === "overdue") return r.status === "Atrasada";
    if (activeTab === "done") return r.status === "Concluída";
    return true;
  };

  const filtered = useMemo(() => allRecords.filter(tabFilter), [allRecords, activeTab]);

  const counts = useMemo(() => ({
    all: allRecords.length,
    pending: allRecords.filter((r) => r.status === "Pendente" || r.status === "Em andamento").length,
    overdue: allRecords.filter((r) => r.status === "Atrasada").length,
    done: allRecords.filter((r) => r.status === "Concluída").length,
  }), [allRecords]);

  const handleAdd = async () => {
    setActionError(null);
    try {
      await create(newRecord as CreateMaintenanceDto);
      setShowAddModal(false);
      setNewRecord({ type: "Preventiva" });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Nao foi possivel agendar a manutencao.");
    }
  };

  const handleComplete = async (id: string) => {
    setActionError(null);
    try {
      await complete(id, {
        completedDate: new Date().toISOString().slice(0, 10),
      });
      setSelectedRecord(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Nao foi possivel concluir a manutencao.");
    }
  };

  const handleDelete = async (id: string) => {
    setActionError(null);
    try {
      await remove(id);
      setSelectedRecord(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Nao foi possivel excluir a manutencao.");
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-900">Manutenções</h1>
          <p className="text-sm text-gray-500 mt-0.5">Controle de manutenções preventivas e corretivas</p>
        </div>
        <Button
          size="sm"
          className="bg-blue-700 hover:bg-blue-800 text-white gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4" /> Agendar manutenção
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: counts.all, color: "text-gray-700", bg: "bg-gray-100" },
          { label: "Pendentes", value: counts.pending, color: "text-blue-700", bg: "bg-blue-100" },
          { label: "Atrasadas", value: counts.overdue, color: "text-red-700", bg: "bg-red-100" },
          { label: "Concluídas", value: counts.done, color: "text-green-700", bg: "bg-green-100" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {actionError && (
          <div className="m-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError}
          </div>
        )}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por equipamento ou ID..."
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
                { value: "pending", label: `Pendentes (${counts.pending})` },
                { value: "overdue", label: `Atrasadas (${counts.overdue})` },
                { value: "done", label: `Concluídas (${counts.done})` },
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

          <TabsContent value={activeTab} className="m-0">
            <div className="divide-y divide-gray-50">
              {isLoading ? (
                <div className="text-center py-12 text-gray-400">
                  <Wrench className="w-8 h-8 mx-auto mb-3 animate-pulse opacity-30" />
                  <p>Carregando...</p>
                </div>
              ) : filtered.map((record) => {
                const status = statusConfig[record.status];
                const StatusIcon = status.icon;
                const costLabel = formatCurrency(record.cost);
                return (
                  <div
                    key={record.id}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      record.status === "Atrasada" ? "bg-red-100" :
                      record.status === "Concluída" ? "bg-green-100" :
                      record.status === "Em andamento" ? "bg-yellow-100" : "bg-blue-100"
                    }`}>
                      <StatusIcon className={`w-4 h-4 ${
                        record.status === "Atrasada" ? "text-red-600" :
                        record.status === "Concluída" ? "text-green-600" :
                        record.status === "Em andamento" ? "text-yellow-600" : "text-blue-600"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{record.equipment}</span>
                        <span className="text-xs text-gray-400">{record.id}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${typeConfig[record.type]}`}>
                          {record.type}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5 truncate">{record.description}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {record.completedDate ? `Concluída em ${record.completedDate}` : `Agendada para ${record.scheduledDate}`}
                        </span>
                        {record.technician && <span>Técnico: {record.technician}</span>}
                        {record.provider && <span>Empresa: {record.provider}</span>}
                        {costLabel && <span>Custo: {costLabel}</span>}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                  </div>
                );
              })}
              {!isLoading && filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Wrench className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma manutenção encontrada</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-lg">
          {selectedRecord && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  {selectedRecord.equipment}
                </DialogTitle>
                <DialogDescription>
                  Consulte os detalhes da manutencao e execute as acoes disponiveis.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[selectedRecord.status].className}`}>
                    {selectedRecord.status}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${typeConfig[selectedRecord.type]}`}>
                    {selectedRecord.type}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-400 text-xs">ID</span><div className="text-gray-900 font-mono">{selectedRecord.id}</div></div>
                  <div><span className="text-gray-400 text-xs">Agendado para</span><div className="text-gray-900">{selectedRecord.scheduledDate}</div></div>
                  {selectedRecord.completedDate && <div><span className="text-gray-400 text-xs">Concluído em</span><div className="text-gray-900">{selectedRecord.completedDate}</div></div>}
                  {selectedRecord.technician && <div><span className="text-gray-400 text-xs">Técnico</span><div className="text-gray-900">{selectedRecord.technician}</div></div>}
                  {selectedRecord.provider && <div><span className="text-gray-400 text-xs">Empresa</span><div className="text-gray-900">{selectedRecord.provider}</div></div>}
                  {formatCurrency(selectedRecord.cost) && <div><span className="text-gray-400 text-xs">Custo</span><div className="text-gray-900">{formatCurrency(selectedRecord.cost)}</div></div>}
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Descrição</span>
                  <p className="text-sm text-gray-900 mt-1">{selectedRecord.description}</p>
                </div>
                {selectedRecord.observations && (
                  <div>
                    <span className="text-gray-400 text-xs">Observações</span>
                    <p className="text-sm text-gray-900 mt-1">{selectedRecord.observations}</p>
                  </div>
                )}
              </div>
              <DialogFooter className="mt-2">
                <Button variant="outline" className="gap-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(selectedRecord.id)}>
                  <Trash2 className="w-4 h-4" /> Excluir
                </Button>
                {selectedRecord.status !== "Concluída" && (
                  <Button className="bg-green-600 hover:bg-green-700 text-white gap-2" onClick={() => handleComplete(selectedRecord.id)}>
                    <CheckCircle2 className="w-4 h-4" /> Marcar como concluída
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Agendar manutenção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Equipamento *</Label>
              <Input placeholder="Nome do equipamento" onChange={(e) => setNewRecord({ ...newRecord, equipment: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tipo *</Label>
                <Select defaultValue="Preventiva" onValueChange={(v) => setNewRecord({ ...newRecord, type: v as CreateMaintenanceDto["type"] })}>
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
                <Input
                  type="date"
                  value={newRecord.scheduledDate ?? ""}
                  onChange={(e) => setNewRecord({ ...newRecord, scheduledDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Técnico responsável</Label>
              <Input placeholder="Nome do técnico" onChange={(e) => setNewRecord({ ...newRecord, technician: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Empresa prestadora</Label>
              <Input placeholder="Nome da empresa" onChange={(e) => setNewRecord({ ...newRecord, provider: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição *</Label>
              <Input placeholder="Descreva o serviço a ser realizado" onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancelar</Button>
            <Button className="bg-blue-700 hover:bg-blue-800 text-white" onClick={handleAdd}>Agendar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
