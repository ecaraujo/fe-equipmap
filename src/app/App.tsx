import { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./components/DashboardPage";
import { InventoryPage } from "./components/InventoryPage";
import { MaintenancePage } from "./components/MaintenancePage";
import { WarrantyPage } from "./components/WarrantyPage";
import { ParkingLotteryPage } from "./components/ParkingLotteryPage";
import { BrigadiersPage } from "./components/BrigadiersPage";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { NotificationProvider } from "../contexts/NotificationContext";

type Page =
  | "dashboard"
  | "inventory"
  | "locations"
  | "maintenance"
  | "warranties"
  | "checklists"
  | "documents"
  | "qrcodes"
  | "reports"
  | "parking"
  | "brigadiers";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-96 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-gray-700">{title}</h2>
      <p className="text-sm text-gray-400 mt-2">Esta seção está em desenvolvimento</p>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":    return <DashboardPage />;
      case "inventory":    return <InventoryPage />;
      case "maintenance":  return <MaintenancePage />;
      case "warranties":   return <WarrantyPage />;
      case "parking":      return <ParkingLotteryPage />;
      case "brigadiers":   return <BrigadiersPage />;
      case "locations":    return <PlaceholderPage title="Locais" />;
      case "checklists":   return <PlaceholderPage title="Checklists" />;
      case "documents":    return <PlaceholderPage title="Documentos" />;
      case "qrcodes":      return <PlaceholderPage title="QR Codes" />;
      case "reports":      return <PlaceholderPage title="Relatórios" />;
      default:             return <DashboardPage />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}
