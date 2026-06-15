import { useState } from "react";
import { Building, Plus, Search, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ApartmentTable } from "./ApartmentTable";
import { ApartmentFormDialog } from "./ApartmentFormDialog";
import { useApartments } from "../../hooks/useApartments";
import type { Apartment, CreateApartmentDto, UpdateApartmentDto } from "../../graphql/models";

export function ApartmentsPage() {
  const { apartments, isLoading, error, createApartment, updateApartment, removeApartment } = useApartments();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingApt, setEditingApt] = useState<Apartment | null>(null);

  const filtered = apartments.filter(
    (a) =>
      a.unit.includes(search) ||
      a.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      a.block.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p className="text-sm">Carregando apartamentos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-8 h-8 mb-3" />
        <p className="text-sm font-medium">Erro ao carregar apartamentos</p>
        <p className="text-xs text-red-400 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-900">Apartamentos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {apartments.length} unidade{apartments.length !== 1 ? "s" : ""} cadastrada{apartments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          size="sm"
          className="bg-blue-700 hover:bg-blue-800 text-white gap-2"
          onClick={() => { setEditingApt(null); setShowModal(true); }}
        >
          <Plus className="w-4 h-4" /> Novo apartamento
        </Button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              placeholder="Buscar por unidade, bloco ou proprietário..."
              className="pl-8 h-8 text-sm w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="text-xs text-gray-400">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {apartments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Building className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium text-gray-500">Nenhum apartamento cadastrado</p>
            <p className="text-sm mt-1">Cadastre o primeiro apartamento para começar</p>
            <Button
              className="mt-4 bg-blue-700 hover:bg-blue-800 text-white gap-2"
              onClick={() => { setEditingApt(null); setShowModal(true); }}
            >
              <Plus className="w-4 h-4" /> Cadastrar apartamento
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Search className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">Nenhum resultado para &ldquo;{search}&rdquo;</p>
          </div>
        ) : (
          <ApartmentTable
            apartments={filtered}
            onEdit={(apt) => { setEditingApt(apt); setShowModal(true); }}
            onDelete={(id) => removeApartment(id)}
          />
        )}
      </div>

      <ApartmentFormDialog
        open={showModal}
        onOpenChange={setShowModal}
        apartment={editingApt}
        onSave={async (dto) => {
          if (editingApt) {
            await updateApartment(editingApt.id, dto as UpdateApartmentDto);
          } else {
            await createApartment(dto as CreateApartmentDto);
          }
          setEditingApt(null);
        }}
      />
    </div>
  );
}
