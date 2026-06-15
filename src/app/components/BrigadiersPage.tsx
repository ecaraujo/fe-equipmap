import { useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Edit,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  User,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { useBrigadiers } from "../../hooks/useBrigadiers";
import { formatPhone, toDateInputValue } from "../../utils/format";
import type {
  Brigadier,
  CreateBrigadierDto,
  NotificationChannel,
  NotificationLog,
  UpdateBrigadierDto,
} from "../../graphql/models";
import { cn } from "./ui/utils";

const roleColors: Record<string, string> = {
  "Brigadista Chefe": "bg-red-100 text-red-700 border-red-200",
  "Sub-Chefe": "bg-orange-100 text-orange-700 border-orange-200",
  Brigadista: "bg-blue-100 text-blue-700 border-blue-200",
};

const certStatusConfig = {
  valid: { label: "Valida", className: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  expiring: { label: "Vencendo", className: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertTriangle },
  expired: { label: "Vencida", className: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle },
};

// UI presets only. Delivery and logging are owned by the BFF notifyBrigadiers flow.
const messageTemplates = [
  {
    id: "evacuation-drill",
    label: "Simulado de evacuacao",
    text: "*Comunicado - Brigada de Incendio*\n\nPrezado(a) brigadista,\n\nInformamos que sera realizado um simulado de evacuacao.\n\nData: [DATA]\nHorario: [HORA]\nLocal: [LOCAL]\n\nSua presenca e obrigatoria. Por favor, confirme o recebimento.\n\nGestao do Condominio",
  },
  {
    id: "certification-renewal",
    label: "Renovacao de certificacao",
    text: "*Aviso de Certificacao*\n\nOla [NOME],\n\nSua certificacao de brigadista esta prestes a vencer em [DATA_VENCIMENTO].\n\nProvidencie a renovacao para manter suas habilitacoes.\n\nGestao do Condominio",
  },
  {
    id: "brigade-meeting",
    label: "Reuniao de brigadistas",
    text: "*Reuniao de Brigadistas*\n\nConvocamos todos os brigadistas para reuniao.\n\nData: [DATA]\nHora: [HORA]\nLocal: [LOCAL]\n\nPauta: revisao dos procedimentos de emergencia e atualizacao do plano de evacuacao.",
  },
  {
    id: "emergency",
    label: "Emergencia",
    text: "*ATENCAO - SITUACAO DE EMERGENCIA*\n\nTodos os brigadistas devem se apresentar imediatamente em seus postos.\n\nSituacao: [DESCRICAO]\nLocal: [LOCAL]\n\nAtue conforme o plano de emergencia.",
  },
];

const defaultBrigadierForm: Partial<CreateBrigadierDto> = {
  role: "Brigadista",
  block: "A",
  active: true,
};

function brigadierToForm(brigadier: Brigadier): Partial<CreateBrigadierDto> {
  return {
    name: brigadier.name,
    apartment: brigadier.apartment,
    block: brigadier.block || "A",
    phone: formatPhone(brigadier.phone),
    role: brigadier.role,
    certificationDate: toDateInput(brigadier.certificationDate),
    certificationExpiry: toDateInput(brigadier.certificationExpiry),
    certificationBody: brigadier.certificationBody,
    active: brigadier.active,
    observations: brigadier.observations,
  };
}

function parseDate(value?: string): Date | null {
  if (!value) return null;

  const iso = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const [, year, month, day] = iso;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const pt = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (pt) {
    const [, day, month, year] = pt;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function certificationStatus(expiry: string): "valid" | "expiring" | "expired" {
  const date = parseDate(expiry);
  if (!date) return "expired";
  const diff = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "expired";
  if (diff <= 90) return "expiring";
  return "valid";
}

function toDateInput(value?: string): string {
  return toDateInputValue(value);
}

function fromDateInput(value: string): string {
  return value;
}

function validateBrigadierForm(form: Partial<CreateBrigadierDto>, isEditing: boolean): string | null {
  const requiredFields: Array<[keyof CreateBrigadierDto, string]> = [
    ["name", "nome completo"],
    ["apartment", "apartamento"],
    ["block", "bloco"],
    ["phone", "telefone"],
    ["role", "funcao"],
    ["certificationDate", "data da certificacao"],
    ["certificationExpiry", "vencimento da certificacao"],
    ["certificationBody", "orgao certificador"],
  ];

  for (const [field, label] of requiredFields) {
    if (!String(form[field] ?? "").trim()) {
      return `Informe o ${label}.`;
    }
  }

  const certificationDate = parseDate(form.certificationDate);
  const certificationExpiry = parseDate(form.certificationExpiry);
  if (!certificationDate || !certificationExpiry) {
    return "Informe datas de certificacao validas.";
  }

  if (certificationExpiry.getTime() < certificationDate.getTime()) {
    return "O vencimento da certificacao deve ser igual ou posterior a data da certificacao.";
  }

  if (!isEditing && form.active === undefined) {
    return "Informe se o brigadista esta ativo.";
  }

  return null;
}

export function BrigadiersPage() {
  const { brigadiers, logs, create, update, remove, sendNotification, isLoading, error } = useBrigadiers();
  const [activeTab, setActiveTab] = useState("brigadiers");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [editingBr, setEditingBr] = useState<Brigadier | null>(null);
  const [form, setForm] = useState<Partial<CreateBrigadierDto>>(defaultBrigadierForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notifyChannel, setNotifyChannel] = useState<NotificationChannel>("whatsapp");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [sentLog, setSentLog] = useState<NotificationLog | null>(null);
  const [notifyError, setNotifyError] = useState<string | null>(null);
  const [isSendingNotify, setIsSendingNotify] = useState(false);

  const filtered = brigadiers.filter((brigadier) => {
    const term = search.toLowerCase();
    return (
      brigadier.name.toLowerCase().includes(term) ||
      brigadier.apartment.includes(search) ||
      brigadier.role.toLowerCase().includes(term)
    );
  });

  const counts = {
    active: brigadiers.filter((b) => b.active).length,
    inactive: brigadiers.filter((b) => !b.active).length,
    expiring: brigadiers.filter((b) => b.certificationExpiry && certificationStatus(b.certificationExpiry) === "expiring").length,
    expired: brigadiers.filter((b) => b.certificationExpiry && certificationStatus(b.certificationExpiry) === "expired").length,
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    setSelectedIds(selectedIds.size === filtered.length ? new Set() : new Set(filtered.map((b) => b.id)));
  };

  const openNotify = () => {
    const nextIds = selectedIds.size > 0 ? selectedIds : new Set(brigadiers.filter((b) => b.active).map((b) => b.id));
    setSelectedIds(nextIds);
    setSentLog(null);
    setNotifyError(null);
    setShowNotifyModal(true);
  };

  const handleSendNotification = async () => {
    setIsSendingNotify(true);
    setNotifyError(null);
    try {
      const log = await sendNotification({
        channel: notifyChannel,
        recipientIds: Array.from(selectedIds),
        message: notifyMessage,
      });
      setSentLog(log);
      setNotifyMessage("");
      setSelectedIds(new Set());
    } catch (err) {
      setNotifyError((err as Error).message);
    } finally {
      setIsSendingNotify(false);
    }
  };

  const openCreate = () => {
    setEditingBr(null);
    setForm(defaultBrigadierForm);
    setFormError(null);
    setShowAddModal(true);
  };

  const openEdit = (brigadier: Brigadier) => {
    setEditingBr(brigadier);
    setForm(brigadierToForm(brigadier));
    setFormError(null);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    const validationError = validateBrigadierForm(form, !!editingBr);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSaving(true);
    setFormError(null);
    try {
      const normalizedForm = {
        name: form.name?.trim(),
        apartment: form.apartment?.trim(),
        block: form.block?.trim() || "A",
        phone: formatPhone(form.phone),
        role: form.role,
        certificationDate: form.certificationDate,
        certificationExpiry: form.certificationExpiry,
        certificationBody: form.certificationBody?.trim(),
        active: form.active,
        observations: form.observations,
      };

      if (editingBr) {
        await update(editingBr.id, normalizedForm as UpdateBrigadierDto);
      } else {
        await create({ ...defaultBrigadierForm, ...normalizedForm } as CreateBrigadierDto);
      }
      setShowAddModal(false);
      setEditingBr(null);
      setForm(defaultBrigadierForm);
    } catch (err) {
      setFormError((err as Error).message || "Nao foi possivel salvar o brigadista.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-900">Brigadistas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cadastro e comunicacao da brigada de incendio</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-green-700 border-green-300 hover:bg-green-50" onClick={openNotify}>
            <Megaphone className="w-4 h-4" />
            Enviar notificacao
          </Button>
          <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white gap-2" onClick={openCreate}>
            <Plus className="w-4 h-4" /> Novo brigadista
          </Button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ativos", value: counts.active, color: "text-green-600", bg: "bg-green-50", icon: ShieldCheck },
          { label: "Inativos", value: counts.inactive, color: "text-gray-500", bg: "bg-gray-50", icon: User },
          { label: "Cert. vencendo", value: counts.expiring, color: "text-amber-600", bg: "bg-amber-50", icon: AlertTriangle },
          { label: "Cert. vencidas", value: counts.expired, color: "text-red-600", bg: "bg-red-50", icon: AlertTriangle },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between px-4 border-b border-gray-100 flex-wrap gap-2">
            <TabsList className="bg-transparent border-none rounded-none h-12 gap-4 p-0">
              <TabsTrigger value="brigadiers" className="border-b-2 border-transparent data-[state=active]:border-blue-700 data-[state=active]:text-blue-700 rounded-none h-12 text-sm text-gray-500">
                Brigadistas ({brigadiers.length})
              </TabsTrigger>
              <TabsTrigger value="logs" className="border-b-2 border-transparent data-[state=active]:border-blue-700 data-[state=active]:text-blue-700 rounded-none h-12 text-sm text-gray-500">
                Historico de envios ({logs.length})
              </TabsTrigger>
            </TabsList>
            <div className="relative py-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input placeholder="Buscar brigadista..." className="pl-8 h-8 text-sm w-52" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <TabsContent value="brigadiers" className="m-0">
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-3 px-5 py-2.5 bg-blue-50 border-b border-blue-100">
                <span className="text-sm text-blue-700 font-medium">{selectedIds.size} selecionado(s)</span>
                <Button size="sm" className="h-7 gap-1.5 bg-green-600 hover:bg-green-700 text-white" onClick={openNotify}>
                  <MessageSquare className="w-3.5 h-3.5" /> Notificar selecionados
                </Button>
                <button className="text-xs text-blue-500 hover:text-blue-700 ml-auto" onClick={() => setSelectedIds(new Set())}>
                  Limpar selecao
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-3 w-10">
                      <Checkbox checked={selectedIds.size === filtered.length && filtered.length > 0} onCheckedChange={selectAll} />
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Brigadista</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Unidade</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Telefone</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Funcao</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Certificacao</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Status cert.</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((brigadier) => {
                    const status = certificationStatus(brigadier.certificationExpiry);
                    const cfg = certStatusConfig[status];
                    const CertIcon = cfg.icon;
                    const isSelected = selectedIds.has(brigadier.id);
                    return (
                      <tr key={brigadier.id} className={cn("transition-colors", isSelected ? "bg-blue-50" : "hover:bg-gray-50")}>
                        <td className="px-5 py-4">
                          <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(brigadier.id)} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold", brigadier.active ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400")}>
                              {brigadier.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{brigadier.name}</div>
                              {!brigadier.active && <span className="text-xs text-gray-400">Inativo</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="text-sm text-gray-600">Apto {brigadier.apartment} - Bl. {brigadier.block}</span>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className="text-sm text-gray-600">{formatPhone(brigadier.phone)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${roleColors[brigadier.role]}`}>
                            {brigadier.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <div className="text-sm text-gray-600">
                            <div>Vence: {brigadier.certificationExpiry}</div>
                            <div className="text-xs text-gray-400">{brigadier.certificationBody}</div>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}>
                            <CertIcon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(brigadier)}>
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-600" onClick={() => remove(brigadier.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!isLoading && filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Nenhum brigadista encontrado</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="logs" className="m-0">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Send className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Nenhum envio registrado ainda</p>
                <p className="text-sm mt-1">Os envios retornados pelo backend aparecerao aqui</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <div key={log.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", log.channel === "whatsapp" ? "bg-green-100" : "bg-blue-100")}>
                        {log.channel === "whatsapp" ? <MessageCircle className="w-4 h-4 text-green-600" /> : <MessageSquare className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-900">
                            {log.channel === "whatsapp" ? "WhatsApp" : "SMS"} - {log.recipients.length} destinatario(s)
                          </span>
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                            log.status === "sent"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : log.status === "queued"
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : "bg-red-100 text-red-700 border-red-200",
                          )}>
                            {log.status === "sent" ? <><Check className="w-3 h-3" /> Enviado</> : log.status === "queued" ? "Na fila" : "Falhou"}
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

      <Dialog open={showNotifyModal} onOpenChange={(open) => { if (!open) { setShowNotifyModal(false); setSentLog(null); setNotifyError(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              Enviar notificacao
            </DialogTitle>
            <DialogDescription>
              Envie uma mensagem pelos canais registrados no backend para os brigadistas selecionados.
            </DialogDescription>
          </DialogHeader>

          {sentLog ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className={cn("w-14 h-14 rounded-full flex items-center justify-center", sentLog.status === "sent" ? "bg-green-100" : "bg-red-100")}>
                {sentLog.status === "sent" ? <CheckCircle2 className="w-8 h-8 text-green-600" /> : <AlertTriangle className="w-8 h-8 text-red-600" />}
              </div>
              <p className="font-semibold text-gray-900">{sentLog.status === "sent" ? "Notificacao enviada pelo backend" : "Envio registrado com falha"}</p>
              <p className="text-sm text-gray-500">Registro {sentLog.id} atualizado no historico de envios</p>
              <Button variant="outline" onClick={() => { setShowNotifyModal(false); setSentLog(null); }}>
                Fechar
              </Button>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              {notifyError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{notifyError}</div>}
              <div className="space-y-1.5">
                <Label>Canal de envio</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(["whatsapp", "sms"] as NotificationChannel[]).map((channel) => (
                    <button
                      key={channel}
                      onClick={() => setNotifyChannel(channel)}
                      className={cn(
                        "flex items-center gap-2.5 p-3 rounded-xl border-2 transition-colors",
                        notifyChannel === channel ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300",
                      )}
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        {channel === "whatsapp" ? <MessageCircle className="w-5 h-5 text-green-600" /> : <MessageSquare className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">{channel === "whatsapp" ? "WhatsApp" : "SMS"}</div>
                        <div className="text-xs text-gray-400">Enviado pelo backend</div>
                      </div>
                      {notifyChannel === channel && <CheckCircle2 className="w-4 h-4 text-blue-600 ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Destinatarios ({selectedIds.size})</Label>
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
                <Label>Preset de mensagem</Label>
                <div className="grid grid-cols-2 gap-2">
                  {messageTemplates.map((template) => (
                    <button key={template.id} onClick={() => setNotifyMessage(template.text)} className="text-left px-3 py-2 text-xs border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                      {template.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Mensagem *</Label>
                <Textarea
                  placeholder="Digite a mensagem ou selecione um preset acima..."
                  className="min-h-28 resize-none"
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                />
                <div className="text-xs text-gray-400 text-right">{notifyMessage.length} caracteres</div>
              </div>
            </div>
          )}

          {!sentLog && (
            <DialogFooter className="mt-2">
              <Button variant="outline" onClick={() => setShowNotifyModal(false)}>Cancelar</Button>
              <Button
                className="gap-2 text-white bg-blue-700 hover:bg-blue-800"
                onClick={handleSendNotification}
                disabled={!notifyMessage.trim() || selectedIds.size === 0 || isSendingNotify}
              >
                <Send className="w-4 h-4" />
                {isSendingNotify ? "Enviando..." : `Enviar via ${notifyChannel === "whatsapp" ? "WhatsApp" : "SMS"}`}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBr ? "Editar brigadista" : "Cadastrar brigadista"}</DialogTitle>
            <DialogDescription className="sr-only">Cadastro de brigadista.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {formError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}
            <div className="space-y-1.5">
              <Label>Nome completo *</Label>
              <Input placeholder="Nome do brigadista" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Apartamento *</Label>
                <Input placeholder="101" value={form.apartment ?? ""} onChange={(e) => setForm({ ...form, apartment: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Bloco *</Label>
                <Input placeholder="A" value={form.block ?? ""} onChange={(e) => setForm({ ...form, block: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Telefone *</Label>
                <Input
                  inputMode="numeric"
                  maxLength={14}
                  placeholder="(11)99999-0000"
                  value={form.phone ?? ""}
                  onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Funcao *</Label>
                <Select value={form.role ?? "Brigadista"} onValueChange={(value) => setForm({ ...form, role: value as Brigadier["role"] })}>
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
                <Label>Data da certificacao *</Label>
                <Input type="date" value={toDateInput(form.certificationDate)} onChange={(e) => setForm({ ...form, certificationDate: fromDateInput(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Vencimento da cert. *</Label>
                <Input type="date" value={toDateInput(form.certificationExpiry)} onChange={(e) => setForm({ ...form, certificationExpiry: fromDateInput(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Orgao certificador *</Label>
              <Input placeholder="Ex: Corpo de Bombeiros, SESMT..." value={form.certificationBody ?? ""} onChange={(e) => setForm({ ...form, certificationBody: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Observacoes</Label>
              <Input placeholder="Observacoes adicionais" value={form.observations ?? ""} onChange={(e) => setForm({ ...form, observations: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="active" checked={form.active !== false} onCheckedChange={(value) => setForm({ ...form, active: !!value })} />
              <label htmlFor="active" className="text-sm text-gray-700 cursor-pointer">Brigadista ativo</label>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={isSaving}>Cancelar</Button>
            <Button className="bg-blue-700 hover:bg-blue-800 text-white" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
