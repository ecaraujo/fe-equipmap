import { useState } from "react";
import { motion } from "motion/react";
import {
  Plus,
  Trash2,
  Edit,
  Car,
  User,
  Phone,
  Shuffle,
  Trophy,
  Search,
  CheckCircle2,
  Building,
  Hash,
  Download,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
import { cn } from "./ui/utils";
import { useParking } from "../../hooks/useParking";
import type {
  Apartment,
  ParkingSpot,
  CreateApartmentDto,
  UpdateApartmentDto,
  CreateSpotDto,
  UpdateSpotDto,
} from "../../types";

const spotTypeColors: Record<string, string> = {
  "Padrão": "bg-blue-100 text-blue-700 border-blue-200",
  "Deficiente": "bg-purple-100 text-purple-700 border-purple-200",
  "Moto": "bg-orange-100 text-orange-700 border-orange-200",
  "Especial": "bg-green-100 text-green-700 border-green-200",
};

export function ParkingLotteryPage() {
  const {
    apartments,
    spots,
    results,
    isRunningLottery,
    createApartment,
    updateApartment,
    removeApartment,
    createSpot,
    updateSpot,
    removeSpot,
    runLottery: runLotteryService,
    resetLottery: resetLotteryService,
  } = useParking();

  const [activeTab, setActiveTab] = useState("apartments");
  const [search, setSearch] = useState("");
  const [showLotteryModal, setShowLotteryModal] = useState(false);
  const [showAptModal, setShowAptModal] = useState(false);
  const [showSpotModal, setShowSpotModal] = useState(false);
  const [editingApt, setEditingApt] = useState<Apartment | null>(null);
  const [editingSpot, setEditingSpot] = useState<ParkingSpot | null>(null);
  const [newApt, setNewApt] = useState<Partial<CreateApartmentDto>>({ hasVehicle: true, floor: 1, block: "A" });
  const [newSpot, setNewSpot] = useState<Partial<CreateSpotDto>>({ type: "Padrão", covered: false });

  const eligibleApts = apartments.filter((a) => a.hasVehicle && !results.find((r) => r.apartmentId === a.id));
  const availableSpots = spots.filter((s) => !results.find((r) => r.spotId === s.id));

  const handleRunLottery = async () => {
    await runLotteryService();
    setShowLotteryModal(false);
    setActiveTab("results");
  };

  const handleResetLottery = async () => {
    await resetLotteryService();
    setActiveTab("results");
  };

  const handleSaveApt = async () => {
    if (editingApt) {
      await updateApartment(editingApt.id, newApt as UpdateApartmentDto);
    } else {
      await createApartment(newApt as CreateApartmentDto);
    }
    setShowAptModal(false);
    setEditingApt(null);
    setNewApt({ hasVehicle: true, floor: 1, block: "A" });
  };

  const handleSaveSpot = async () => {
    if (editingSpot) {
      await updateSpot(editingSpot.id, newSpot as UpdateSpotDto);
    } else {
      await createSpot(newSpot as CreateSpotDto);
    }
    setShowSpotModal(false);
    setEditingSpot(null);
    setNewSpot({ type: "Padrão", covered: false });
  };

  const filteredApts = apartments.filter((a) =>
    a.unit.includes(search) || a.ownerName.toLowerCase().includes(search.toLowerCase()) || a.block.toLowerCase().includes(search.toLowerCase())
  );

  const filteredResults = results.filter((r) =>
    r.unit.includes(search) || r.ownerName.toLowerCase().includes(search.toLowerCase()) || r.spotNumber.includes(search)
  );

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-900">Sorteio de Vagas de Garagem</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {apartments.length} apartamentos · {spots.length} vagas · {results.length} alocadas
          </p>
        </div>
        <div className="flex items-center gap-2">
          {results.length > 0 && (
            <Button variant="outline" size="sm" className="gap-2 text-red-600 border-red-200 hover:bg-red-50" onClick={handleResetLottery}>
              <RefreshCw className="w-4 h-4" /> Resetar sorteio
            </Button>
          )}
          <Button
            size="sm"
            className="bg-blue-700 hover:bg-blue-800 text-white gap-2"
            onClick={() => setShowLotteryModal(true)}
            disabled={eligibleApts.length === 0 || availableSpots.length === 0}
          >
            <Shuffle className="w-4 h-4" /> Realizar sorteio
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Apartamentos", value: apartments.length, sub: `${apartments.filter((a) => a.hasVehicle).length} com veículo`, color: "text-blue-600", bg: "bg-blue-50", icon: Building },
          { label: "Vagas totais", value: spots.length, sub: `${availableSpots.length} disponíveis`, color: "text-green-600", bg: "bg-green-50", icon: Car },
          { label: "Aptos sorteados", value: results.length, sub: `${eligibleApts.length} aguardando`, color: "text-purple-600", bg: "bg-purple-50", icon: Trophy },
          { label: "Pendentes", value: eligibleApts.length, sub: `${availableSpots.length} vagas livres`, color: eligibleApts.length > 0 ? "text-amber-600" : "text-gray-400", bg: eligibleApts.length > 0 ? "bg-amber-50" : "bg-gray-50", icon: AlertCircle },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-400 leading-tight">{s.label}<br /><span className="text-gray-300">{s.sub}</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between px-4 border-b border-gray-100 flex-wrap gap-2">
            <TabsList className="bg-transparent border-none rounded-none h-12 gap-4 p-0">
              {[
                { value: "apartments", label: `Apartamentos (${apartments.length})` },
                { value: "spots", label: `Vagas (${spots.length})` },
                { value: "results", label: `Resultados (${results.length})` },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="border-b-2 border-transparent data-[state=active]:border-blue-700 data-[state=active]:text-blue-700 rounded-none h-12 text-sm text-gray-500"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex items-center gap-2 py-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input placeholder="Buscar..." className="pl-8 h-8 text-sm w-48" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              {activeTab === "apartments" && (
                <Button size="sm" className="h-8 bg-blue-700 hover:bg-blue-800 text-white gap-1.5" onClick={() => { setEditingApt(null); setNewApt({ hasVehicle: true, floor: 1, block: "A" }); setShowAptModal(true); }}>
                  <Plus className="w-3.5 h-3.5" /> Apartamento
                </Button>
              )}
              {activeTab === "spots" && (
                <Button size="sm" className="h-8 bg-blue-700 hover:bg-blue-800 text-white gap-1.5" onClick={() => { setEditingSpot(null); setNewSpot({ type: "Padrão", covered: false }); setShowSpotModal(true); }}>
                  <Plus className="w-3.5 h-3.5" /> Vaga
                </Button>
              )}
            </div>
          </div>

          {/* Apartments tab */}
          <TabsContent value="apartments" className="m-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Unidade</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Responsável</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Telefone</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Andar</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Veículo</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Status sorteio</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredApts.map((apt) => {
                    const result = results.find((r) => r.apartmentId === apt.id);
                    return (
                      <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-blue-700">{apt.block}</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">Apto {apt.unit}</div>
                              <div className="text-xs text-gray-400">Bloco {apt.block}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            {apt.ownerName}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {apt.phone}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span className="text-sm text-gray-600">{apt.floor}º andar</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", apt.hasVehicle ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200")}>
                            {apt.hasVehicle ? "Sim" : "Não"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          {result ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Vaga {result.spotNumber}
                            </span>
                          ) : apt.hasVehicle ? (
                            <span className="text-xs text-amber-500">Aguardando sorteio</span>
                          ) : (
                            <span className="text-xs text-gray-400">Não participa</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => { setEditingApt(apt); setNewApt(apt); setShowAptModal(true); }}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                              onClick={() => removeApartment(apt.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Spots tab */}
          <TabsContent value="spots" className="m-0">
            <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {spots.map((spot) => {
                const result = results.find((r) => r.spotId === spot.id);
                return (
                  <div
                    key={spot.id}
                    className={cn(
                      "border rounded-xl p-4 relative",
                      result ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", result ? "bg-green-200" : "bg-blue-100")}>
                        <Car className={cn("w-5 h-5", result ? "text-green-700" : "text-blue-600")} />
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${spotTypeColors[spot.type]}`}>
                        {spot.type}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-gray-900 mb-1">Vaga {spot.number}</div>
                    <div className="text-xs text-gray-400 space-y-0.5">
                      <div>{spot.floor}</div>
                      <div>{spot.covered ? "Coberta" : "Descoberta"}</div>
                    </div>
                    {result ? (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <div className="text-xs font-medium text-green-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Apto {result.unit} - {result.ownerName.split(" ")[0]}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400">Disponível</span>
                      </div>
                    )}
                    {!result && (
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => { setEditingSpot(spot); setNewSpot(spot); setShowSpotModal(true); }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-600"
                          onClick={() => removeSpot(spot.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Results tab */}
          <TabsContent value="results" className="m-0">
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Trophy className="w-12 h-12 mb-3 opacity-30" />
                <p className="font-medium text-gray-500">Nenhum sorteio realizado</p>
                <p className="text-sm mt-1">Cadastre os apartamentos e vagas, depois realize o sorteio</p>
                <Button
                  className="mt-4 bg-blue-700 hover:bg-blue-800 text-white gap-2"
                  onClick={() => setShowLotteryModal(true)}
                  disabled={eligibleApts.length === 0 || availableSpots.length === 0}
                >
                  <Shuffle className="w-4 h-4" /> Realizar sorteio agora
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">{filteredResults.length} resultado(s) encontrado(s)</span>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" /> Exportar PDF
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Unidade</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Condômino</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Vaga</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Tipo</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Data do sorteio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredResults.map((result, index) => (
                        <motion.tr
                          key={result.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-blue-700">{result.block}</span>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">Apto {result.unit}</div>
                                <div className="text-xs text-gray-400">Bloco {result.block}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-sm text-gray-900">{result.ownerName}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                <Car className="w-4 h-4 text-green-600" />
                              </div>
                              <div className="text-sm font-semibold text-green-700">Vaga {result.spotNumber}</div>
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${spotTypeColors[result.spotType]}`}>
                              {result.spotType}
                            </span>
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell">
                            <span className="text-sm text-gray-500">{result.drawnAt}</span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Lottery Confirmation Modal */}
      <Dialog open={showLotteryModal} onOpenChange={(o) => !isRunningLottery && setShowLotteryModal(o)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-blue-600" />
              Confirmar sorteio
            </DialogTitle>
          </DialogHeader>
          {isRunningLottery ? (
            <div className="flex flex-col items-center py-8 gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              >
                <Shuffle className="w-12 h-12 text-blue-600" />
              </motion.div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">Realizando sorteio...</p>
                <p className="text-sm text-gray-500 mt-1">Sorteando vagas aleatoriamente</p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4 mt-2">
                <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Apartamentos participantes:</span>
                    <span className="font-semibold text-blue-700">{eligibleApts.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Vagas disponíveis:</span>
                    <span className="font-semibold text-blue-700">{availableSpots.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t border-blue-200 pt-2 mt-2">
                    <span className="text-gray-600">Pares a sortear:</span>
                    <span className="font-bold text-blue-700">{Math.min(eligibleApts.length, availableSpots.length)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  O sorteio será realizado de forma aleatória e os resultados serão salvos automaticamente. Esta ação não pode ser desfeita individualmente.
                </p>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setShowLotteryModal(false)}>Cancelar</Button>
                <Button className="bg-blue-700 hover:bg-blue-800 text-white gap-2" onClick={handleRunLottery}>
                  <Shuffle className="w-4 h-4" /> Sortear agora
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Apartment Modal */}
      <Dialog open={showAptModal} onOpenChange={setShowAptModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingApt ? "Editar apartamento" : "Cadastrar apartamento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Unidade *</Label>
                <Input placeholder="101" defaultValue={editingApt?.unit} onChange={(e) => setNewApt({ ...newApt, unit: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Bloco</Label>
                <Input placeholder="A" defaultValue={editingApt?.block || "A"} onChange={(e) => setNewApt({ ...newApt, block: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Andar</Label>
                <Input type="number" placeholder="1" defaultValue={editingApt?.floor} onChange={(e) => setNewApt({ ...newApt, floor: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Responsável *</Label>
              <Input placeholder="Nome completo" defaultValue={editingApt?.ownerName} onChange={(e) => setNewApt({ ...newApt, ownerName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Telefone *</Label>
                <Input placeholder="(11) 99999-0000" defaultValue={editingApt?.phone} onChange={(e) => setNewApt({ ...newApt, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input placeholder="email@ex.com" defaultValue={editingApt?.email} onChange={(e) => setNewApt({ ...newApt, email: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Possui veículo?</Label>
              <Select defaultValue={editingApt?.hasVehicle !== false ? "true" : "false"} onValueChange={(v) => setNewApt({ ...newApt, hasVehicle: v === "true" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Sim — participa do sorteio</SelectItem>
                  <SelectItem value="false">Não — não participa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowAptModal(false)}>Cancelar</Button>
            <Button className="bg-blue-700 hover:bg-blue-800 text-white" onClick={handleSaveApt}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Spot Modal */}
      <Dialog open={showSpotModal} onOpenChange={setShowSpotModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingSpot ? "Editar vaga" : "Cadastrar vaga"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Número da vaga *</Label>
                <Input placeholder="01" defaultValue={editingSpot?.number} onChange={(e) => setNewSpot({ ...newSpot, number: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo *</Label>
                <Select defaultValue={editingSpot?.type || "Padrão"} onValueChange={(v) => setNewSpot({ ...newSpot, type: v as ParkingSpot["type"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Padrão">Padrão</SelectItem>
                    <SelectItem value="Deficiente">Deficiente</SelectItem>
                    <SelectItem value="Moto">Moto</SelectItem>
                    <SelectItem value="Especial">Especial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Localização / Pavimento</Label>
              <Input placeholder="Subsolo 1" defaultValue={editingSpot?.floor} onChange={(e) => setNewSpot({ ...newSpot, floor: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Cobertura</Label>
              <Select defaultValue={editingSpot?.covered ? "true" : "false"} onValueChange={(v) => setNewSpot({ ...newSpot, covered: v === "true" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Coberta</SelectItem>
                  <SelectItem value="false">Descoberta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowSpotModal(false)}>Cancelar</Button>
            <Button className="bg-blue-700 hover:bg-blue-800 text-white" onClick={handleSaveSpot}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
