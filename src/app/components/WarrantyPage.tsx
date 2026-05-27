import { useMemo, useState, type ElementType } from "react";
import {
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Calendar,
  Upload,
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
import { useWarranty } from "../../hooks/useWarranty";
import type { CreateWarrantyDto, Warranty } from "../../graphql/models";

const serviceWarrantyType = "Servi\u00e7o" as Warranty["type"];
const emptyWarrantyForm: Partial<CreateWarrantyDto> = { type: "Fabricante" };

function todayAtStart(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function parseLocalDate(value: string | undefined): Date | null {
  if (!value) return null;
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const pt = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (pt) return new Date(Number(pt[3]), Number(pt[2]) - 1, Number(pt[1]));
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function daysUntil(dateStr: string): number {
  const target = parseLocalDate(dateStr);
  if (!target) return 0;
  return Math.ceil((target.getTime() - todayAtStart().getTime()) / (1000 * 60 * 60 * 24));
}

function warrantyProgress(start: string, end: string): number {
  const startDate = parseLocalDate(start);
  const endDate = parseLocalDate(end);
  if (!startDate || !endDate) return 0;
  const total = endDate.getTime() - startDate.getTime();
  if (total <= 0) return 100;
  const elapsed = todayAtStart().getTime() - startDate.getTime();
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

function monthsBetween(startIso: string, endIso: string): number {
  const [startYear, startMonth, startDay] = startIso.split("-").map(Number);
  const [endYear, endMonth, endDay] = endIso.split("-").map(Number);
  let months = (endYear - startYear) * 12 + (endMonth - startMonth);
  if (endDay < startDay) months -= 1;
  return Math.max(1, months);
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Nao foi possivel cadastrar a garantia.";
}

const statusConfig: Record<string, { className: string; icon: ElementType; progressColor: string }> = {
  Vigente: { className: "bg-green-100 text-green-700 border-green-200", icon: ShieldCheck, progressColor: "bg-green-500" },
  Vencendo: { className: "bg-amber-100 text-amber-700 border-amber-200", icon: ShieldAlert, progressColor: "bg-amber-500" },
  Vencida: { className: "bg-red-100 text-red-700 border-red-200", icon: ShieldOff, progressColor: "bg-red-400" },
};

const typeColors: Record<string, string> = {
  Fabricante: "bg-blue-100 text-blue-700 border-blue-200",
  Fornecedor: "bg-purple-100 text-purple-700 border-purple-200",
  Estendida: "bg-teal-100 text-teal-700 border-teal-200",
  [serviceWarrantyType]: "bg-orange-100 text-orange-700 border-orange-200",
  "ServiÃ§o": "bg-orange-100 text-orange-700 border-orange-200",
};

export function WarrantyPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWarranty, setNewWarranty] = useState<Partial<CreateWarrantyDto>>(emptyWarrantyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: allWarranties, create } = useWarranty({ search });

  const filtered = useMemo(() => allWarranties.filter((warranty) => {
    if (activeTab === "active") return warranty.status === "Vigente";
    if (activeTab === "expiring") return warranty.status === "Vencendo";
    if (activeTab === "expired") return warranty.status === "Vencida";
    return true;
  }), [allWarranties, activeTab]);

  const counts = useMemo(() => ({
    all: allWarranties.length,
    active: allWarranties.filter((warranty) => warranty.status === "Vigente").length,
    expiring: allWarranties.filter((warranty) => warranty.status === "Vencendo").length,
    expired: allWarranties.filter((warranty) => warranty.status === "Vencida").length,
  }), [allWarranties]);

  const resetForm = () => {
    setFormError(null);
    setNewWarranty(emptyWarrantyForm);
  };

  const handleAdd = async () => {
    setFormError(null);
    const warrantyStart = newWarranty.warrantyStart;
    const warrantyEnd = newWarranty.warrantyEnd;
    const requiredFields: Array<keyof CreateWarrantyDto> = ["equipment", "brand", "model", "supplier", "type"];
    const missingField = requiredFields.find((field) => !String(newWarranty[field] ?? "").trim());

    if (missingField || !warrantyStart || !warrantyEnd) {
      setFormError("Preencha os campos obrigatorios antes de cadastrar a garantia.");
      return;
    }

    const startDate = parseLocalDate(warrantyStart);
    const endDate = parseLocalDate(warrantyEnd);
    if (!startDate || !endDate || endDate.getTime() < startDate.getTime()) {
      setFormError("O fim da garantia deve ser igual ou posterior ao inicio.");
      return;
    }

    setIsSubmitting(true);
    try {
      await create({
        ...newWarranty,
        purchaseDate: newWarranty.purchaseDate || warrantyStart,
        warrantyMonths: newWarranty.warrantyMonths ?? monthsBetween(warrantyStart, warrantyEnd),
      } as CreateWarrantyDto);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-900">Garantias</h1>
          <p className="text-sm text-gray-500 mt-0.5">Controle de garantias de equipamentos e servicos</p>
        </div>
        <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white gap-2" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" /> Nova garantia
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: counts.all, icon: Shield, color: "text-gray-600", bg: "bg-gray-100" },
          { label: "Vigentes", value: counts.active, icon: ShieldCheck, color: "text-green-600", bg: "bg-green-100" },
          { label: "Vencendo", value: counts.expiring, icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-100" },
          { label: "Vencidas", value: counts.expired, icon: ShieldOff, color: "text-red-600", bg: "bg-red-100" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por equipamento, marca ou ID..."
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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
                const status = statusConfig[warranty.status] ?? statusConfig.Vigente;
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
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${typeColors[warranty.type] ?? typeColors.Fabricante}`}>
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
                        <div className={`h-1.5 rounded-full ${status.progressColor}`} style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{warranty.warrantyStart}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{warranty.warrantyEnd}</span>
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

      <Dialog open={!!selectedWarranty} onOpenChange={() => setSelectedWarranty(null)}>
        <DialogContent className="max-w-lg">
          {selectedWarranty && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  {selectedWarranty.equipment}
                </DialogTitle>
                <DialogDescription>Dados atuais da garantia carregados pelo BFF.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[selectedWarranty.status].className}`}>
                    {selectedWarranty.status}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${typeColors[selectedWarranty.type] ?? typeColors.Fabricante}`}>
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
                    <div className={`h-2 rounded-full ${statusConfig[selectedWarranty.status].progressColor}`} style={{ width: `${warrantyProgress(selectedWarranty.warrantyStart, selectedWarranty.warrantyEnd)}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-400 text-xs">Marca / Modelo</span><div className="text-gray-900">{selectedWarranty.brand} {selectedWarranty.model}</div></div>
                  <div><span className="text-gray-400 text-xs">Numero de serie</span><div className="text-gray-900 font-mono">{selectedWarranty.serialNumber ?? "-"}</div></div>
                  <div><span className="text-gray-400 text-xs">Fornecedor</span><div className="text-gray-900">{selectedWarranty.supplier}</div></div>
                  <div><span className="text-gray-400 text-xs">Contato</span><div className="text-gray-900">{selectedWarranty.supplierContact ?? "-"}</div></div>
                  <div><span className="text-gray-400 text-xs">Inicio da garantia</span><div className="text-gray-900">{selectedWarranty.warrantyStart}</div></div>
                  <div><span className="text-gray-400 text-xs">Fim da garantia</span><div className="text-gray-900">{selectedWarranty.warrantyEnd}</div></div>
                  <div><span className="text-gray-400 text-xs">Duracao</span><div className="text-gray-900">{selectedWarranty.warrantyMonths} meses</div></div>
                  <div><span className="text-gray-400 text-xs">Data de compra</span><div className="text-gray-900">{selectedWarranty.purchaseDate}</div></div>
                </div>

                {selectedWarranty.observations && (
                  <div>
                    <span className="text-gray-400 text-xs">Observacoes</span>
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

      <Dialog open={showAddModal} onOpenChange={(open) => {
        setShowAddModal(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar garantia</DialogTitle>
            <DialogDescription>Preencha os dados obrigatorios para criar a garantia no backend.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Equipamento *</Label>
              <Input value={newWarranty.equipment ?? ""} placeholder="Nome do equipamento" onChange={(event) => setNewWarranty({ ...newWarranty, equipment: event.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Marca *</Label>
                <Input value={newWarranty.brand ?? ""} placeholder="Ex: Midea" onChange={(event) => setNewWarranty({ ...newWarranty, brand: event.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Modelo *</Label>
                <Input value={newWarranty.model ?? ""} placeholder="Ex: MSplit 12000" onChange={(event) => setNewWarranty({ ...newWarranty, model: event.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de garantia *</Label>
              <Select value={newWarranty.type ?? "Fabricante"} onValueChange={(value) => setNewWarranty({ ...newWarranty, type: value as Warranty["type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fabricante">Fabricante</SelectItem>
                  <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                  <SelectItem value="Estendida">Estendida</SelectItem>
                  <SelectItem value={serviceWarrantyType}>Servico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fornecedor *</Label>
              <Input value={newWarranty.supplier ?? ""} placeholder="Nome do fornecedor/fabricante" onChange={(event) => setNewWarranty({ ...newWarranty, supplier: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Contato do fornecedor</Label>
              <Input value={newWarranty.supplierContact ?? ""} placeholder="Telefone ou e-mail" onChange={(event) => setNewWarranty({ ...newWarranty, supplierContact: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Data de compra *</Label>
              <Input type="date" value={newWarranty.purchaseDate ?? ""} onChange={(event) => setNewWarranty({ ...newWarranty, purchaseDate: event.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Inicio da garantia *</Label>
                <Input type="date" value={newWarranty.warrantyStart ?? ""} onChange={(event) => {
                  const warrantyStart = event.target.value;
                  setNewWarranty({
                    ...newWarranty,
                    warrantyStart,
                    purchaseDate: newWarranty.purchaseDate || warrantyStart,
                    warrantyMonths: warrantyStart && newWarranty.warrantyEnd ? monthsBetween(warrantyStart, newWarranty.warrantyEnd) : newWarranty.warrantyMonths,
                  });
                }} />
              </div>
              <div className="space-y-1.5">
                <Label>Fim da garantia *</Label>
                <Input type="date" value={newWarranty.warrantyEnd ?? ""} onChange={(event) => {
                  const warrantyEnd = event.target.value;
                  setNewWarranty({
                    ...newWarranty,
                    warrantyEnd,
                    warrantyMonths: newWarranty.warrantyStart && warrantyEnd ? monthsBetween(newWarranty.warrantyStart, warrantyEnd) : newWarranty.warrantyMonths,
                  });
                }} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Duracao da garantia (meses)</Label>
              <Input
                type="number"
                min={1}
                value={newWarranty.warrantyMonths ?? ""}
                placeholder="Calculado automaticamente"
                onChange={(event) => setNewWarranty({ ...newWarranty, warrantyMonths: event.target.value ? Number(event.target.value) : undefined })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Observacoes</Label>
              <Input value={newWarranty.observations ?? ""} placeholder="Condicoes, restricoes da garantia..." onChange={(event) => setNewWarranty({ ...newWarranty, observations: event.target.value })} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button className="bg-blue-700 hover:bg-blue-800 text-white" onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting ? "Cadastrando..." : "Cadastrar garantia"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
