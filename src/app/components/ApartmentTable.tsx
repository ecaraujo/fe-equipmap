import {
  Edit,
  Trash2,
  User,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";
import type { Apartment, LotteryResult } from "../../graphql/models";

export interface ApartmentTableProps {
  apartments: Apartment[];
  results?: LotteryResult[];
  onEdit: (apartment: Apartment) => void;
  onDelete: (id: string) => void;
  showLotteryStatus?: boolean;
}

export function ApartmentTable({ apartments, results = [], onEdit, onDelete, showLotteryStatus = false }: ApartmentTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Unidade</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Responsável</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Telefone</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Andar</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Veículo</th>
            {showLotteryStatus && (
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Status sorteio</th>
            )}
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {apartments.map((apt) => {
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
                    {apt.ownerPhone ?? "Não informado"}
                  </div>
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell">
                  <span className="text-sm text-gray-600">{apt.floor != null ? `${apt.floor}º andar` : "Não informado"}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", apt.hasVehicle ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200")}>
                    {apt.hasVehicle ? "Sim" : "Não"}
                  </span>
                </td>
                {showLotteryStatus && (
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
                )}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => onEdit(apt)}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                      onClick={() => onDelete(apt.id)}
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
  );
}
