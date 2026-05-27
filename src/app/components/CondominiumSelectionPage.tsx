import { Building2 } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../../contexts/AuthContext";

export function CondominiumSelectionPage() {
  const { pendingCondominiums, switchCondominium, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
          <Building2 className="w-6 h-6" />
        </div>
        <h1 className="text-gray-900">Selecione o condomínio</h1>
        <p className="text-sm text-gray-500 mt-1">Escolha o contexto de trabalho para continuar.</p>
        <div className="space-y-2 mt-5">
          {pendingCondominiums.map((condominium) => (
            <Button
              key={condominium.id}
              variant="outline"
              className="w-full justify-start h-auto py-3"
              disabled={isLoading}
              onClick={() => switchCondominium(condominium.id)}
            >
              <span className="flex flex-col items-start">
                <span className="font-medium">{condominium.name}</span>
                {condominium.address && <span className="text-xs text-gray-400">{condominium.address}</span>}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
