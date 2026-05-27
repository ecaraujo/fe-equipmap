import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Package,
  Shield,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboardSummaryQuery } from "../../graphql/generated";
import { mapDashboardSummary } from "../../graphql/mappers";
import type { DashboardMaintenance, DashboardSummary } from "../../graphql/models";
import { Button } from "./ui/button";

const statusConfig: Record<string, { label: string; className: string }> = {
  Ativo: { label: "Ativo", className: "bg-green-100 text-green-700 border-green-200" },
  "Manutencao": { label: "Manutencao", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  "Manutenção": { label: "Manutenção", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  Alerta: { label: "Alerta", className: "bg-red-100 text-red-700 border-red-200" },
  Inativo: { label: "Inativo", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

const maintenancePriorityConfig: Record<string, { className: string }> = {
  Atrasada: { className: "bg-red-500" },
  Pendente: { className: "bg-amber-500" },
  "Em andamento": { className: "bg-blue-500" },
  Concluida: { className: "bg-green-500" },
  "Concluída": { className: "bg-green-500" },
  Cancelada: { className: "bg-gray-400" },
};

function generatedAtLabel(value?: string): string {
  if (!value) return "Atualizando";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Atualizado";
  return `Atualizado ${date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}`;
}

function splitShortDate(value: string): { day: string; month: string } {
  const dateParts = value.match(/^(\d{2})\/(\d{2})\/\d{4}$/);
  if (dateParts) {
    const month = Number(dateParts[2]);
    return { day: dateParts[1], month: monthLabel(month - 1) };
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return { day: String(parsed.getDate()).padStart(2, "0"), month: monthLabel(parsed.getMonth()) };
  }

  return { day: "--", month: "---" };
}

function monthLabel(index: number): string {
  const labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return labels[index] ?? "---";
}

function EmptyState({ message }: { message: string }) {
  return <div className="py-8 text-center text-sm text-gray-400">{message}</div>;
}

function DashboardLoading() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-36 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-56 rounded bg-gray-100 animate-pulse mt-2" />
        </div>
        <div className="h-9 w-40 rounded-md bg-gray-100 animate-pulse hidden sm:block" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 lg:p-5">
            <div className="h-10 w-10 rounded-xl bg-gray-100 animate-pulse mb-3" />
            <div className="h-8 w-16 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-32 rounded bg-gray-100 animate-pulse mt-2" />
            <div className="h-3 w-24 rounded bg-gray-100 animate-pulse mt-3" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 bg-white rounded-xl border border-gray-200 animate-pulse" />
        <div className="h-72 bg-white rounded-xl border border-gray-200 animate-pulse" />
      </div>
    </div>
  );
}

function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="p-4 lg:p-6">
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-gray-900">Nao foi possivel carregar o Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
            <Button className="mt-4 bg-blue-700 hover:bg-blue-800 text-white" onClick={onRetry}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data, loading, error, refetch } = useDashboardSummaryQuery();

  if (loading && !data) {
    return <DashboardLoading />;
  }

  if (error || !data) {
    return (
      <DashboardError
        message={error?.message ?? "O BFF nao retornou dados para o resumo operacional."}
        onRetry={() => void refetch()}
      />
    );
  }

  const summary = mapDashboardSummary(data.dashboardSummary);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Visao Geral</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {[summary.condominiumName, generatedAtLabel(summary.generatedAt)].filter(Boolean).join(" - ")}
          </p>
        </div>
        <Button className="bg-blue-700 hover:bg-blue-800 text-white gap-2 hidden sm:flex">
          <Package className="w-4 h-4" />
          Novo equipamento
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Equipamentos"
          value={summary.equipmentTotal}
          subtitle="cadastrados"
          icon={Package}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
          trend="Total atual"
        />
        <StatCard
          title="Manutencoes"
          value={summary.maintenancePendingTotal}
          subtitle="pendentes"
          icon={Wrench}
          iconColor="text-amber-600"
          iconBg="bg-amber-100"
          trend="Abertas no backend"
          trendType="warning"
        />
        <StatCard
          title="Atrasadas"
          value={summary.maintenanceOverdueTotal}
          subtitle="manutencoes"
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBg="bg-red-100"
          trend="Atencao necessaria"
          trendType="danger"
        />
        <StatCard
          title="Garantias"
          value={summary.warrantyExpiringTotal}
          subtitle="vencendo"
          icon={Shield}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
          trend="Status vigente"
          trendType="warning"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-gray-900">Manutencoes</h3>
              <p className="text-sm text-gray-500">Ultimos 6 meses</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />Realizadas</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />Pendentes</span>
            </div>
          </div>
          {summary.maintenanceChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={summary.maintenanceChart} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                  cursor={{ fill: "#f9fafb" }}
                />
                <Bar dataKey="completed" name="Realizadas" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pendentes" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Sem dados de manutencao para o periodo." />
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Proximas manutencoes</h3>
            <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Ver agenda <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {summary.upcomingMaintenances.length > 0 ? (
              summary.upcomingMaintenances.map((item) => <UpcomingMaintenanceItem key={item.id} item={item} />)
            ) : (
              <EmptyState message="Nenhuma manutencao pendente." />
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-gray-900">Equipamentos recentes</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Ver inventario <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <RecentEquipmentTable summary={summary} />
      </div>
    </div>
  );
}

function UpcomingMaintenanceItem({ item }: { item: DashboardMaintenance }) {
  const date = splitShortDate(item.scheduledDate);
  const priority = maintenancePriorityConfig[item.status] ?? maintenancePriorityConfig.Pendente;

  return (
    <div className="flex items-start gap-3">
      <div className="w-10 text-center shrink-0">
        <div className="text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg px-1 py-1.5 leading-tight">
          {date.day}
          <br />
          <span className="font-normal text-blue-500">{date.month}</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{item.equipment}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500">{item.type}</span>
          <span className={`w-1.5 h-1.5 rounded-full ${priority.className}`} />
        </div>
      </div>
    </div>
  );
}

function RecentEquipmentTable({ summary }: { summary: DashboardSummary }) {
  if (summary.recentEquipment.length === 0) {
    return <EmptyState message="Nenhum equipamento encontrado." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Equipamento</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Tipo</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Localizacao</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Prox. manutencao</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {summary.recentEquipment.map((eq) => {
            const status = statusConfig[eq.status] ?? { label: eq.status, className: "bg-gray-100 text-gray-600 border-gray-200" };
            return (
              <tr key={eq.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{eq.name}</div>
                    <div className="text-xs text-gray-400">{eq.patrimonyCode}</div>
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
  );
}

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
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
      <div className="text-2xl font-bold text-gray-900">{value.toLocaleString("pt-BR")}</div>
      <div className="text-sm text-gray-500 mt-0.5">{title} <span className="text-gray-400">{subtitle}</span></div>
      <div className={`text-xs mt-2 ${trendColors[trendType]}`}>{trend}</div>
    </div>
  );
}
