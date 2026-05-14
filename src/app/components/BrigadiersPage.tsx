import { useState } from "react";
import {
  Plus,
  Search,
  ShieldCheck,
  Phone,
  MessageSquare,
  Send,
  Edit,
  Trash2,
  User,
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  Megaphone,
  X,
  Check,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Checkbox } from "./ui/checkbox";
import { cn } from "./ui/utils";
import { useBrigadiers } from "../../hooks/useBrigadiers";
import type { Brigadier, CreateBrigadierDto, UpdateBrigadierDto, NotificationChannel } from "../../types";

const roleColors: Record<string, string> = {
  "Brigadista Chefe": "bg-red-100 text-red-700 border-red-200",
  "Sub-Chefe": "bg-orange-100 text-orange-700 border-orange-200",
  "Brigadista": "bg-blue-100 text-blue-700 border-blue-200",
};

function certificationStatus(expiry: string): "valid" | "expiring" | "expired" {
  const [d, m, y] = expiry.split("/").map(Number);
  const date = new Date(y, m - 1, d);
  const now = new Date();
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "expired";
  if (diff <= 90) return "expiring";
  return "valid";
}

const certStatusConfig = {
  valid: { label: "Válida", className: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  expiring: { label: "Vencendo", className: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertTriangle },
  expired: { label: "Vencida", className: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle },
};

const messageTemplates = [
  {
    id: "t1",
    label: "Simulado de evacuação",
    text: "🚨 *Comunicado - Brigada de Incêndio* 🚨\n\nPrezado(a) brigadista,\n\nInformamos que será realizado um *simulado de evacuação* no Residencial Park.\n\n📅 Data: [DATA]\n⏰ Horário: [HORA]\n📍 Local: Área comum do condomínio\n\nSua presença é *obrigatória*. Por favor, confirme o recebimento.\n\nGestão do Condomínio",
  },
  {
    id: "t2",
    label: "Renovação de certificação",
    text: "⚠️ *Aviso de Certificação* ⚠️\n\nOlá [NOME],\n\nSua certificação de brigadista está prestes a vencer em [DATA_VENCIMENTO].\n\nPor favor, providencie a renovação o quanto antes para manter suas habilitações.\n\nDúvidas? Entre em contato com a administração.\n\nGestão do Condomínio - Residencial Park",
  },
  {
    id: "t3",
    label: "Reunião de brigadistas",
    text: "📋 *Reunião de Brigadistas*\n\nConvocamos todos os brigadistas para reunião:\n\n📅 Data: [DATA]\n⏰ Hora: [HORA]\n📍 Local: Salão de festas\n\nPauta: Revisão dos procedimentos de emergência e atualização do plano de evacuação.\n\nPresença confirmada? Responda SIM ou NÃO.\n\nBrigada de Incêndio - Residencial Park",
  },
  {
    id: "t4",
    label: "Emergência",
    text: "🚨 *ATENÇÃO - SITUAÇÃO DE EMERGÊNCIA* 🚨\n\nTodos os brigadistas devem se apresentar IMEDIATAMENTE em seus postos.\n\nSituação: [DESCRIÇÃO]\nLocal: [LOCAL]\n\nAtue conforme o plano de emergência.\n\nCentral de Controle - Residencial Park",
  },
];

export function BrigadiersPage() {
  const { brigadiers, logs, create, update, remove, sendNotification } = useBrigadiers();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [editingBr, setEditingBr] = useState<Brigadier | null>(null);
  const [newBr, setNewBr] = useState<Partial<CreateBrigadierDto>>({ role: "Brigadista", active: true });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [notifyChannel, setNotifyChannel] = useState<NotificationChannel>("whatsapp");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("brigadiers");

  const filtered = brigadiers.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.apartment.includes(search) ||
    b.role.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((b) => b.id)));
    }
  };

  const openNotify = () => {
    if (selectedIds.size === 0) {
      setSelectedIds(new Set(brigadiers.filter((b) => b.active).map((b) => b.id)));
    }
    setShowNotifyModal(true);
    setSentSuccess(false);
  };

  const handleSendNotification = async () => {
    if (notifyChannel === "whatsapp") {
      const firstBr = brigadiers.find((b) => selectedIds.has(b.id));
      if (firstBr) {
        const phone = firstBr.phone.replace(/\D/g, "");
        window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(notifyMessage)}`, "_blank");
      }
    }

    await sendNotification({
      channel: notifyChannel,
      recipientIds: Array.from(selectedIds),
      message: notifyMessage,
    });

    setSentSuccess(true);
    setTimeout(() => {
      setShowNotifyModal(false);
      setSentSuccess(false);
      setNotifyMessage("");
    }, 2000);
  };

  const handleSave = async () => {
    if (editingBr) {
      await update(editingBr.id, newBr as UpdateBrigadierDto);
    } else {
      await create(newBr as CreateBrigadierDto);
    }
    setShowAddModal(false);
    setEditingBr(null);
    setNewBr({ role: "Brigadista", active: true });
  };

  const counts = {
    active: brigadiers.filter((b) => b.active).length,
    inactive: brigadiers.filter((b) => !b.active).length,
    expiring: brigadiers.filter((b) => b.certificationExpiry && certificationStatus(b.certificationExpiry) === "expiring").length,
    expired: brigadiers.filter((b) => b.certificationExpiry && certificationStatus(b.certificationExpiry) === "expired").length,
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-900">Brigadistas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cadastro e comunicação da brigada de incêndio</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-green-700 border-green-300 hover:bg-green-50"
            onClick={openNotify}
          >
            <Megaphone className="w-4 h-4" />
            Enviar notificação
          </Button>
          <Button
            size="sm"
            className="bg-blue-700 hover:bg-blue-800 text-white gap-2"
            onClick={() => { setEditingBr(null); setNewBr({ role: "Brigadista", active: true }); setShowAddModal(true); }}
          >
            <Plus className="w-4 h-4" /> Novo brigadista
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ativos", value: counts.active, color: "text-green-600", bg: "bg-green-50", icon: ShieldCheck },
          { label: "Inativos", value: counts.inactive, color: "text-gray-500", bg: "bg-gray-50", icon: User },
          { label: "Cert. vencendo", value: counts.expiring, color: "text-amber-600", bg: "bg-amber-50", icon: AlertTriangle },
          { label: "Cert. vencidas", value: counts.expired, color: "text-red-600", bg: "bg-red-50", icon: AlertTriangle },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <div className="bg-white rounded-xl border border-gray-200">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between px-4 border-b border-gray-100 flex-wrap gap-2">
            <TabsList className="bg-transparent border-none rounded-none h-12 gap-4 p-0">
              <TabsTrigger value="brigadiers" className="border-b-2 border-transparent data-[state=active]:border-blue-700 data-[state=active]:text-blue-700 rounded-none h-12 text-sm text-gray-500">
                Brigadistas ({brigadiers.length})
              </TabsTrigger>
              <TabsTrigger value="logs" className="border-b-2 border-transparent data-[state=active]:border-blue-700 data-[state=active]:text-blue-700 rounded-none h-12 text-sm text-gray-500">
                Histórico de envios ({logs.length})
              </TabsTrigger>
            </TabsList>
            <div className="relative py-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input placeholder="Buscar brigadista..." className="pl-8 h-8 text-sm w-52" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {/* Brigadiers list */}
          <TabsContent value="brigadiers" className="m-0">
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-3 px-5 py-2.5 bg-blue-50 border-b border-blue-100">
                <span className="text-sm text-blue-700 font-medium">{selectedIds.size} selecionado(s)</span>
                <Button size="sm" className="h-7 gap-1.5 bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowNotifyModal(true)}>
                  <MessageSquare className="w-3.5 h-3.5" /> Notificar selecionados
                </Button>
                <button className="text-xs text-blue-500 hover:text-blue-700 ml-auto" onClick={() => setSelectedIds(new Set())}>
                  Limpar seleção
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-3 w-10">
                      <Checkbox
                        checked={selectedIds.size === filtered.length && filtered.length > 0}
                        onCheckedChange={selectAll}
                      />
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Brigadista</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Unidade</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Telefone</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Função</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Certificação</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Status cert.</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((br) => {
                    const certSt = certificationStatus(br.certificationExpiry);
                    const certCfg = certStatusConfig[certSt];
                    const CertIcon = certCfg.icon;
                    const isSelected = selectedIds.has(br.id);
                    return (
                      <tr
                        key={br.id}
                        className={cn("transition-colors", isSelected ? "bg-blue-50" : "hover:bg-gray-50")}
                      >
                        <td className="px-5 py-4">
                          <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(br.id)} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold",
                              br.active ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"
                            )}>
                              {br.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{br.name}</div>
                              {!br.active && <span className="text-xs text-gray-400">Inativo</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="text-sm text-gray-600">Apto {br.apartment} - Bl. {br.block}</span>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{br.phone}</span>
                            <div className="flex gap-1">
                              <button
                                title="WhatsApp"
                                onClick={() => window.open(`https://wa.me/55${br.phone.replace(/\D/g, "")}`, "_blank")}
                                className="w-6 h-6 rounded-md bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                              </button>
                              <button
                                title="SMS"
                                onClick={() => window.open(`sms:${br.phone.replace(/\D/g, "")}`, "_self")}
                                className="w-6 h-6 rounded-md bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${roleColors[br.role]}`}>
                            {br.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <div className="text-sm text-gray-600">
                            <div>Vence: {br.certificationExpiry}</div>
                            <div className="text-xs text-gray-400">{br.certificationBody}</div>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${certCfg.className}`}>
                            <CertIcon className="w-3 h-3" />
                            {certCfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => { setEditingBr(br); setNewBr({ ...br }); setShowAddModal(true); }}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                              onClick={() => remove(br.id)}
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
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Nenhum brigadista encontrado</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Logs tab */}
          <TabsContent value="logs" className="m-0">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Send className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Nenhum envio registrado ainda</p>
                <p className="text-sm mt-1">Os envios de notificações aparecerão aqui</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <div key={log.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", log.channel === "whatsapp" ? "bg-green-100" : "bg-blue-100")}>
                        {log.channel === "whatsapp" ? (
                          <MessageCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-900">
                            {log.channel === "whatsapp" ? "WhatsApp" : "SMS"} · {log.recipients.length} destinatário(s)
                          </span>
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", log.status === "sent" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200")}>
                            {log.status === "sent" ? <><Check className="w-3 h-3" /> Enviado</> : "Falhou"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{log.message}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                          <span>{log.sentAt}</span>
                          <span>Para: {log.recipients.slice(0, 3).join(", ")}{log.recipients.length > 3 ? ` +${log.recipients.length - 3}` : ""}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Notification Modal */}
      <Dialog open={showNotifyModal} onOpenChange={(o) => { if (!o) { setShowNotifyModal(false); setSentSuccess(false); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              Enviar notificação
            </DialogTitle>
          </DialogHeader>

          {sentSuccess ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <p className="font-semibold text-gray-900">Notificação enviada!</p>
              <p className="text-sm text-gray-500">Registrado no histórico de envios</p>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Canal de envio</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setNotifyChannel("whatsapp")}
                    className={cn(
                      "flex items-center gap-2.5 p-3 rounded-xl border-2 transition-colors",
                      notifyChannel === "whatsapp" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">WhatsApp</div>
                      <div className="text-xs text-gray-400">Abre wa.me</div>
                    </div>
                    {notifyChannel === "whatsapp" && <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />}
                  </button>
                  <button
                    onClick={() => setNotifyChannel("sms")}
                    className={cn(
                      "flex items-center gap-2.5 p-3 rounded-xl border-2 transition-colors",
                      notifyChannel === "sms" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">SMS</div>
                      <div className="text-xs text-gray-400">Abre app de SMS</div>
                    </div>
                    {notifyChannel === "sms" && <CheckCircle2 className="w-4 h-4 text-blue-600 ml-auto" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Destinatários ({selectedIds.size})</Label>
                <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-20 overflow-y-auto">
                  {brigadiers.filter((b) => selectedIds.has(b.id)).map((b) => (
                    <span key={b.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700">
                      {b.name.split(" ")[0]}
                      <button onClick={() => toggleSelect(b.id)}><X className="w-3 h-3 text-gray-400" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Modelo de mensagem</Label>
                <div className="grid grid-cols-2 gap-2">
                  {messageTemplates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setNotifyMessage(t.text)}
                      className="text-left px-3 py-2 text-xs border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Mensagem *</Label>
                <Textarea
                  placeholder="Digite a mensagem ou selecione um modelo acima..."
                  className="min-h-28 resize-none"
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                />
                <div className="text-xs text-gray-400 text-right">{notifyMessage.length} caracteres</div>
              </div>
            </div>
          )}

          {!sentSuccess && (
            <DialogFooter className="mt-2">
              <Button variant="outline" onClick={() => setShowNotifyModal(false)}>Cancelar</Button>
              <Button
                className={cn("gap-2 text-white", notifyChannel === "whatsapp" ? "bg-green-600 hover:bg-green-700" : "bg-blue-700 hover:bg-blue-800")}
                onClick={handleSendNotification}
                disabled={!notifyMessage.trim() || selectedIds.size === 0}
              >
                <Send className="w-4 h-4" />
                Enviar via {notifyChannel === "whatsapp" ? "WhatsApp" : "SMS"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Brigadier Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBr ? "Editar brigadista" : "Cadastrar brigadista"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Nome completo *</Label>
              <Input placeholder="Nome do brigadista" defaultValue={editingBr?.name} onChange={(e) => setNewBr({ ...newBr, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Apartamento *</Label>
                <Input placeholder="101" defaultValue={editingBr?.apartment} onChange={(e) => setNewBr({ ...newBr, apartment: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Bloco</Label>
                <Input placeholder="A" defaultValue={editingBr?.block} onChange={(e) => setNewBr({ ...newBr, block: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Telefone / WhatsApp *</Label>
                <Input placeholder="(11) 99999-0000" defaultValue={editingBr?.phone} onChange={(e) => setNewBr({ ...newBr, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Função *</Label>
                <Select defaultValue={editingBr?.role || "Brigadista"} onValueChange={(v) => setNewBr({ ...newBr, role: v as Brigadier["role"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brigadista Chefe">Brigadista Chefe</SelectItem>
                    <SelectItem value="Sub-Chefe">Sub-Chefe</SelectItem>
                    <SelectItem value="Brigadista">Brigadista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Data da certificação</Label>
                <Input type="date" defaultValue={editingBr?.certificationDate ? editingBr.certificationDate.split("/").reverse().join("-") : ""} onChange={(e) => setNewBr({ ...newBr, certificationDate: new Date(e.target.value).toLocaleDateString("pt-BR") })} />
              </div>
              <div className="space-y-1.5">
                <Label>Vencimento da cert.</Label>
                <Input type="date" defaultValue={editingBr?.certificationExpiry ? editingBr.certificationExpiry.split("/").reverse().join("-") : ""} onChange={(e) => setNewBr({ ...newBr, certificationExpiry: new Date(e.target.value).toLocaleDateString("pt-BR") })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Órgão certificador</Label>
              <Input placeholder="Ex: Corpo de Bombeiros, SESMT..." defaultValue={editingBr?.certificationBody} onChange={(e) => setNewBr({ ...newBr, certificationBody: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Input placeholder="Observações adicionais" defaultValue={editingBr?.observations} onChange={(e) => setNewBr({ ...newBr, observations: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="active"
                checked={newBr.active !== false}
                onCheckedChange={(v) => setNewBr({ ...newBr, active: !!v })}
              />
              <label htmlFor="active" className="text-sm text-gray-700 cursor-pointer">Brigadista ativo</label>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancelar</Button>
            <Button className="bg-blue-700 hover:bg-blue-800 text-white" onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
