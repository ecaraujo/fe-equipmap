import { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./components/DashboardPage";
import { InventoryPage } from "./components/InventoryPage";
import { MaintenancePage } from "./components/MaintenancePage";
import { WarrantyPage } from "./components/WarrantyPage";
import { ParkingLotteryPage } from "./components/ParkingLotteryPage";
import { BrigadiersPage } from "./components/BrigadiersPage";
import { CondominiumSelectionPage } from "./components/CondominiumSelectionPage";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import { ApolloClientProvider } from "../graphql/client";

type Page = "dashboard" | "inventory" | "maintenance" | "warranties" | "parking" | "brigadiers";

function AppContent() {
  const { isAuthenticated, pendingCondominiums } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (pendingCondominiums.length > 1) {
    return <CondominiumSelectionPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":    return <DashboardPage />;
      case "inventory":    return <InventoryPage />;
      case "maintenance":  return <MaintenancePage />;
      case "warranties":   return <WarrantyPage />;
      case "parking":      return <ParkingLotteryPage />;
      case "brigadiers":   return <BrigadiersPage />;
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
    <ApolloClientProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </ApolloClientProvider>
  );
}
