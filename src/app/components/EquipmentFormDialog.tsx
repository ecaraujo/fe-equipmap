import type { Dispatch, SetStateAction } from "react";
import { Loader2 } from "lucide-react";
import type { CreateEquipmentDto, Equipment } from "../../graphql/models";
import { EQUIPMENT_TYPES } from "../../graphql/models";
import { Button } from "./ui/button";
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

interface EquipmentFormDialogProps {
  open: boolean;
  editingEquipment?: Equipment | null;
  form: Partial<CreateEquipmentDto>;
  setForm: Dispatch<SetStateAction<Partial<CreateEquipmentDto>>>;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function EquipmentFormDialog({
  open,
  editingEquipment,
  form,
  setForm,
  isSaving,
  onClose,
  onSave,
}: EquipmentFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? undefined : onClose())}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingEquipment ? "Editar equipamento" : "Cadastrar novo equipamento"}</DialogTitle>
          <DialogDescription className="sr-only">Formulario de equipamento.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="col-span-2 space-y-1.5">
            <Label>Nome do equipamento *</Label>
            <Input value={form.name ?? ""} placeholder="Ex: Ar-condicionado Split 12000 BTU" onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Marca *</Label>
            <Input value={form.brand ?? ""} placeholder="Ex: Midea" onChange={(event) => setForm({ ...form, brand: event.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Modelo</Label>
            <Input value={form.model ?? ""} placeholder="Ex: MSplit 12000" onChange={(event) => setForm({ ...form, model: event.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Numero de serie</Label>
            <Input value={form.serialNumber ?? ""} placeholder="Ex: MID-2024-001" onChange={(event) => setForm({ ...form, serialNumber: event.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo *</Label>
            <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value as Equipment["type"] })}>
              <SelectTrigger><SelectValue placeholder="Selecionar tipo" /></SelectTrigger>
              <SelectContent>
                {EQUIPMENT_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Localizacao *</Label>
            <Input value={form.location ?? ""} placeholder="Ex: Bloco A - Sala 01" onChange={(event) => setForm({ ...form, location: event.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status ?? "Ativo"} onValueChange={(value) => setForm({ ...form, status: value as Equipment["status"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="ManutenÃƒÂ§ÃƒÂ£o">Manutencao</SelectItem>
                <SelectItem value="Alerta">Alerta</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Data de aquisicao</Label>
            <Input type="date" value={form.acquisitionDate ?? ""} onChange={(event) => setForm({ ...form, acquisitionDate: event.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Vencimento da garantia</Label>
            <Input type="date" value={form.warrantyExpiry ?? ""} onChange={(event) => setForm({ ...form, warrantyExpiry: event.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Proxima manutencao</Label>
            <Input type="date" value={form.nextMaintenance ?? ""} onChange={(event) => setForm({ ...form, nextMaintenance: event.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Valor de aquisicao (R$)</Label>
            <Input type="number" value={form.value ?? ""} placeholder="0,00" onChange={(event) => setForm({ ...form, value: Number(event.target.value) })} />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button className="bg-blue-700 hover:bg-blue-800 text-white gap-2" onClick={onSave} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editingEquipment ? "Salvar alteracoes" : "Cadastrar equipamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
