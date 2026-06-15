import { useState } from "react";
import {
  Building,
  Building2,
  LayoutDashboard,
  Package,
  Wrench,
  Shield,
  LogOut,
  ChevronDown,
  Bell,
  Search,
  Menu,
  X,
  Settings,
  User,
  Car,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ShieldOff,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "./ui/utils";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import { useDashboardSummaryQuery } from "../../graphql/generated";
import type { AppNotification } from "../../graphql/models";

type Page =
  | "dashboard"
  | "inventory"
  | "maintenance"
  | "warranties"
  | "apartments"
  | "parking"
  | "brigadiers";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems = [
  {
    section: "Principal",
    items: [
      { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
      { id: "inventory" as Page, label: "Inventário", icon: Package },
      { id: "maintenance" as Page, label: "Manutenções", icon: Wrench },
      { id: "warranties" as Page, label: "Garantias", icon: Shield },
      { id: "apartments" as Page, label: "Apartamentos", icon: Building },
    ],
  },
  {
    section: "Operação",
    items: [
      { id: "parking" as Page, label: "Sorteio de Vagas", icon: Car },
      { id: "brigadiers" as Page, label: "Brigadistas", icon: ShieldCheck },
    ],
  },
];

const notifIcons: Record<AppNotification["type"], { icon: React.ElementType; color: string; bg: string }> = {
  maintenance_overdue: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
  maintenance_pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
  warranty_expiring: { icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-100" },
  warranty_expired: { icon: ShieldOff, color: "text-red-600", bg: "bg-red-100" },
};

const notifLabels: Record<AppNotification["type"], string> = {
  maintenance_overdue: "Manutenção atrasada",
  maintenance_pending: "Manutenção pendente",
  warranty_expiring: "Garantia vencendo",
  warranty_expired: "Garantia vencida",
};

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { data: dashboardData } = useDashboardSummaryQuery({ errorPolicy: "all" });

  const maintenanceNotifs = notifications.filter((n) => n.type === "maintenance_overdue" || n.type === "maintenance_pending");
  const warrantyNotifs = notifications.filter((n) => n.type === "warranty_expired" || n.type === "warranty_expiring");

  const markAllRead = markAllAsRead;
  const onLogout = logout;
  const selectedCondominiumName =
    user?.condominiumName ??
    user?.condominiums?.find((condominium) => condominium.id === user.condominiumId)?.name ??
    dashboardData?.dashboardSummary.condominiumName ??
    "Condominio";
  const navBadges: Partial<Record<Page, number>> = {
    inventory: dashboardData?.dashboardSummary.equipmentTotal,
    maintenance: dashboardData?.dashboardSummary.maintenancePendingTotal,
    warranties: dashboardData?.dashboardSummary.warrantyExpiringTotal,
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200">
          <div className="w-9 h-9 bg-blue-700 rounded-xl flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-semibold text-gray-900">EquipMap</span>
            <div className="text-xs text-gray-400">Gestão de Condomínios</div>
          </div>
          <button className="ml-auto lg:hidden text-gray-400 hover:text-gray-600" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 py-3 border-b border-gray-100">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-sm font-medium text-blue-900 truncate flex-1 text-left">{selectedCondominiumName}</span>
            <ChevronDown className="w-4 h-4 text-blue-500 shrink-0" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {navItems.map((section) => (
            <div key={section.section}>
              <div className="px-3 mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.section}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  const badge = navBadges[item.id];
                  const badgeVariant = item.id === "maintenance" || item.id === "warranties" ? "destructive" : "secondary";
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                        isActive ? "bg-blue-700 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {badge !== undefined && (
                        <Badge
                          variant={badgeVariant}
                          className={cn(
                            "text-xs h-5 px-1.5",
                            isActive && badgeVariant !== "destructive" && "bg-blue-600 text-white border-blue-600"
                          )}
                        >
                          {badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-semibold">
                    {user?.name.split(" ").map((n) => n[0]).slice(0, 2).join("") ?? "?"}
                  </span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{user?.name ?? "Usuário"}</div>
                  <div className="text-xs text-gray-400 truncate capitalize">{user?.role ?? "—"}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2"><User className="w-4 h-4" /> Meu perfil</DropdownMenuItem>
              <DropdownMenuItem className="gap-2"><Settings className="w-4 h-4" /> Configurações</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-red-600" onClick={onLogout}>
                <LogOut className="w-4 h-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-4 shrink-0">
          <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-3 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar equipamento, local ou documento..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notification Bell */}
          <div className="flex items-center gap-2 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96 p-0" sideOffset={8}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div>
                    <span className="font-semibold text-gray-900">Notificações</span>
                    {unreadCount > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">{unreadCount} novas</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button className="text-xs text-blue-600 hover:text-blue-700" onClick={markAllRead}>
                      Marcar todas como lidas
                    </button>
                  )}
                </div>

                <ScrollArea className="max-h-[420px]">
                  {/* Maintenance section */}
                  {maintenanceNotifs.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Wrench className="w-3 h-3" />
                          Manutenções — {maintenanceNotifs.filter((n) => !n.read).length} pendentes
                        </span>
                      </div>
                      {maintenanceNotifs.map((notif) => {
                        const cfg = notifIcons[notif.type];
                        const Icon = cfg.icon;
                        const isRead = !!notif.read;
                        return (
                          <div
                            key={notif.id}
                            className={cn("flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 cursor-pointer", isRead && "opacity-60")}
                            onClick={() => markAsRead(notif.id)}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                              <Icon className={`w-4 h-4 ${cfg.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium text-gray-900 truncate">{notif.title}</span>
                                {!isRead && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">{notif.description}</p>
                              <span className={`text-xs font-medium mt-1 inline-block ${cfg.color}`}>{notifLabels[notif.type]}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Warranty section */}
                  {warrantyNotifs.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Shield className="w-3 h-3" />
                          Garantias — {warrantyNotifs.filter((n) => !n.read).length} alertas
                        </span>
                      </div>
                      {warrantyNotifs.map((notif) => {
                        const cfg = notifIcons[notif.type];
                        const Icon = cfg.icon;
                        const isRead = !!notif.read;
                        return (
                          <div
                            key={notif.id}
                            className={cn("flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 cursor-pointer", isRead && "opacity-60")}
                            onClick={() => markAsRead(notif.id)}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                              <Icon className={`w-4 h-4 ${cfg.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium text-gray-900 truncate">{notif.title}</span>
                                {!isRead && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">{notif.description}</p>
                              <span className={`text-xs font-medium mt-1 inline-block ${cfg.color}`}>{notifLabels[notif.type]}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {notifications.length === 0 && (
                    <div className="px-4 py-8 text-center text-gray-400">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Sem notificações</p>
                    </div>
                  )}
                </ScrollArea>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                  <button
                    className="w-full text-sm text-blue-600 hover:text-blue-700 text-center"
                    onClick={() => onNavigate("maintenance")}
                  >
                    Ver todas as manutenções →
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
