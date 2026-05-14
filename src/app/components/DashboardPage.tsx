import { useState } from "react";
import {
  Package,
  Wrench,
  AlertTriangle,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  Shield,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const maintenanceData = [
  { month: "Jan", realizadas: 12, pendentes: 4 },
  { month: "Fev", realizadas: 15, pendentes: 3 },
  { month: "Mar", realizadas: 18, pendentes: 6 },
  { month: "Abr", realizadas: 14, pendentes: 5 },
  { month: "Mai", realizadas: 22, pendentes: 8 },
  { month: "Jun", realizadas: 19, pendentes: 4 },
];

const recentEquipment = [
  { id: "EQ-001", name: "Ar-condicionado Split", type: "Climatização", location: "Bloco A - Sala 01", status: "Ativo", nextMaintenance: "15/06/2026" },
  { id: "EQ-002", name: "Elevador Social", type: "Transporte", location: "Torre Principal", status: "Manutenção", nextMaintenance: "02/06/2026" },
  { id: "EQ-003", name: "Gerador 150kVA", type: "Elétrica", location: "Casa de Máquinas", status: "Ativo", nextMaintenance: "20/07/2026" },
  { id: "EQ-004", name: "Bomba d'água 1", type: "Hidráulica", location: "Subsolo", status: "Ativo", nextMaintenance: "10/06/2026" },
  { id: "EQ-005", name: "CFTV - Câmera 03", type: "Segurança", location: "Portaria", status: "Alerta", nextMaintenance: "05/06/2026" },
];

const upcomingMaintenance = [
  { date: "02 Jun", equipment: "Elevador Social", type: "Preventiva", priority: "alta" },
  { date: "05 Jun", equipment: "CFTV - Câmera 03", type: "Corretiva", priority: "alta" },
  { date: "10 Jun", equipment: "Bomba d'água 1", type: "Preventiva", priority: "media" },
  { date: "15 Jun", equipment: "Ar-condicionado Split", type: "Preventiva", priority: "baixa" },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  Ativo: { label: "Ativo", className: "bg-green-100 text-green-700 border-green-200" },
  Manutenção: { label: "Manutenção", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  Alerta: { label: "Alerta", className: "bg-red-100 text-red-700 border-red-200" },
  Inativo: { label: "Inativo", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

const priorityConfig: Record<string, { className: string }> = {
  alta: { className: "bg-red-500" },
  media: { className: "bg-yellow-500" },
  baixa: { className: "bg-green-500" },
};

export function DashboardPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Visão Geral</h1>
          <p className="text-sm text-gray-500 mt-0.5">Residencial Park · Atualizado agora</p>
        </div>
        <Button className="bg-blue-700 hover:bg-blue-800 text-white gap-2 hidden sm:flex">
          <Package className="w-4 h-4" />
          Novo equipamento
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Equipamentos"
          value="248"
          subtitle="cadastrados"
          icon={Package}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
          trend="+12 este mês"
        />
        <StatCard
          title="Manutenções"
          value="18"
          subtitle="pendentes"
          icon={Wrench}
          iconColor="text-amber-600"
          iconBg="bg-amber-100"
          trend="Próx. 7 dias"
          trendType="warning"
        />
        <StatCard
          title="Atrasadas"
          value="6"
          subtitle="manutenções"
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBg="bg-red-100"
          trend="Atenção necessária"
          trendType="danger"
        />
        <StatCard
          title="Garantias"
          value="9"
          subtitle="vencendo em 30 dias"
          icon={Shield}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
          trend="29 dias restantes"
          trendType="warning"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-gray-900">Manutenções</h3>
              <p className="text-sm text-gray-500">Últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />Realizadas</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />Pendentes</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={maintenanceData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                cursor={{ fill: "#f9fafb" }}
              />
              <Bar dataKey="realizadas" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pendentes" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming maintenance */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Próximas manutenções</h3>
            <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Ver agenda <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {upcomingMaintenance.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-10 text-center shrink-0">
                  <div className="text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg px-1 py-1.5 leading-tight">
                    {item.date.split(" ")[0]}
                    <br />
                    <span className="font-normal text-blue-500">{item.date.split(" ")[1]}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{item.equipment}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{item.type}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig[item.priority].className}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent equipment table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-gray-900">Equipamentos recentes</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Ver inventário <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Equipamento</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Tipo</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Localização</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Próx. Manutenção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentEquipment.map((eq) => {
                const status = statusConfig[eq.status];
                return (
                  <tr key={eq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{eq.name}</div>
                        <div className="text-xs text-gray-400">{eq.id}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{eq.type}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-gray-600">{eq.location}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {eq.nextMaintenance}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend: string;
  trendType?: "default" | "warning" | "danger";
}

function StatCard({ title, value, subtitle, icon: Icon, iconColor, iconBg, trend, trendType = "default" }: StatCardProps) {
  const trendColors = {
    default: "text-green-600",
    warning: "text-amber-600",
    danger: "text-red-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{title} <span className="text-gray-400">{subtitle}</span></div>
      <div className={`text-xs mt-2 ${trendColors[trendType]}`}>{trend}</div>
    </div>
  );
}
