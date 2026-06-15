import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { Apartment, CreateApartmentDto, UpdateApartmentDto } from "../../graphql/models";
import { formatPhone } from "../../utils/format";

interface ValidationDetail {
  field: string;
  message: string;
}

function extractValidationDetails(err: unknown): Record<string, string> | null {
  if (!err || typeof err !== "object") return null;
  // Handle single GraphQLError (from errorPolicy: "all")
  const extensions = (err as { extensions?: { details?: ValidationDetail[]; code?: string } }).extensions;
  if (extensions?.details && extensions.details.length > 0) {
    const mapped: Record<string, string> = {};
    for (const d of extensions.details) {
      mapped[d.field] = d.message;
    }
    return mapped;
  }
  // Handle CombinedGraphQLErrors (legacy)
  const graphqlErrors = (err as { graphQLErrors?: Array<{ extensions?: { details?: ValidationDetail[] }; message?: string }> }).graphQLErrors;
  if (graphqlErrors?.length) {
    const details = graphqlErrors[0].extensions?.details;
    if (details && details.length > 0) {
      const mapped: Record<string, string> = {};
      for (const d of details) {
        mapped[d.field] = d.message;
      }
      return mapped;
    }
    const msg = graphqlErrors[0].message;
    if (msg) return { _form: msg };
  }
  return null;
}

export interface ApartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apartment?: Apartment | null;
  onSave: (dto: CreateApartmentDto | UpdateApartmentDto) => Promise<void>;
}

interface FormState {
  unit: string;
  block: string;
  floor: string;
  ownerName: string;
  ownerDocument: string;
  ownerPhone: string;
  ownerEmail: string;
  isRented: boolean;
  tenantName: string;
  tenantDocument: string;
  tenantPhone: string;
  tenantEmail: string;
  rentalStart: string;
  rentalEnd: string;
  hasVehicle: boolean;
  observations: string;
}

function defaultForm(): FormState {
  return {
    unit: "",
    block: "A",
    floor: "",
    ownerName: "",
    ownerDocument: "",
    ownerPhone: "",
    ownerEmail: "",
    isRented: false,
    tenantName: "",
    tenantDocument: "",
    tenantPhone: "",
    tenantEmail: "",
    rentalStart: "",
    rentalEnd: "",
    hasVehicle: true,
    observations: "",
  };
}

function fromApartment(apt: Apartment): FormState {
  return {
    unit: apt.unit,
    block: apt.block,
    floor: apt.floor != null ? String(apt.floor) : "",
    ownerName: apt.ownerName,
    ownerDocument: apt.ownerDocument ?? "",
    ownerPhone: apt.ownerPhone ?? "",
    ownerEmail: apt.ownerEmail ?? "",
    isRented: apt.isRented,
    tenantName: apt.tenantName ?? "",
    tenantDocument: apt.tenantDocument ?? "",
    tenantPhone: apt.tenantPhone ?? "",
    tenantEmail: apt.tenantEmail ?? "",
    rentalStart: apt.rentalStart ?? "",
    rentalEnd: apt.rentalEnd ?? "",
    hasVehicle: apt.hasVehicle,
    observations: apt.observations ?? "",
  };
}

function toDto(form: FormState): CreateApartmentDto {
  return {
    unit: form.unit,
    block: form.block,
    floor: form.floor ? Number(form.floor) : undefined,
    ownerName: form.ownerName,
    ownerDocument: form.ownerDocument || undefined,
    ownerPhone: form.ownerPhone || undefined,
    ownerEmail: form.ownerEmail || undefined,
    isRented: form.isRented,
    tenantName: form.isRented ? form.tenantName || undefined : undefined,
    tenantDocument: form.isRented ? form.tenantDocument || undefined : undefined,
    tenantPhone: form.isRented ? form.tenantPhone || undefined : undefined,
    tenantEmail: form.isRented ? form.tenantEmail || undefined : undefined,
    rentalStart: form.isRented ? form.rentalStart || undefined : undefined,
    rentalEnd: form.isRented ? form.rentalEnd || undefined : undefined,
    hasVehicle: form.hasVehicle,
    observations: form.observations || undefined,
  };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hasPhoneDigits(value: string): boolean {
  return value.replace(/\D/g, "").length > 0;
}

export function validateApartmentForm(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.unit.trim()) errors.unit = "Unidade é obrigatória";
  if (!form.block.trim()) errors.block = "Bloco é obrigatório";
  if (!form.ownerName.trim()) errors.ownerName = "Nome do proprietário é obrigatório";
  if (!hasPhoneDigits(form.ownerPhone) && !form.ownerEmail) {
    errors.ownerContact = "Telefone ou e-mail do proprietário é obrigatório";
  }
  if (form.ownerPhone && form.ownerPhone.replace(/\D/g, "").length > 0) {
    const digits = form.ownerPhone.replace(/\D/g, "").length;
    if (digits < 10 || digits > 11) errors.ownerPhone = "Telefone deve ter 10 ou 11 dígitos";
  }
  if (form.ownerEmail && !EMAIL_REGEX.test(form.ownerEmail)) {
    errors.ownerEmail = "E-mail do proprietário inválido";
  }
  if (form.isRented) {
    if (!form.tenantName.trim()) errors.tenantName = "Nome do inquilino é obrigatório quando alugado";
    if (!hasPhoneDigits(form.tenantPhone) && !form.tenantEmail) {
      errors.tenantContact = "Telefone ou e-mail do inquilino é obrigatório quando alugado";
    }
    if (form.tenantPhone && form.tenantPhone.replace(/\D/g, "").length > 0) {
      const digits = form.tenantPhone.replace(/\D/g, "").length;
      if (digits < 10 || digits > 11) errors.tenantPhone = "Telefone deve ter 10 ou 11 dígitos";
    }
    if (form.tenantEmail && !EMAIL_REGEX.test(form.tenantEmail)) {
      errors.tenantEmail = "E-mail do inquilino inválido";
    }
    if (form.rentalStart && form.rentalEnd && form.rentalEnd < form.rentalStart) {
      errors.rentalEnd = "Data fim deve ser posterior à data início";
    }
  }
  return errors;
}

function applyPhoneMask(value: string): string {
  return formatPhone(value);
}

export function ApartmentFormDialog({ open, onOpenChange, apartment, onSave }: ApartmentFormDialogProps) {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(apartment ? fromApartment(apartment) : defaultForm());
      setErrors({});
    }
  }, [open, apartment]);

  const update = (field: keyof FormState, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      delete next.ownerContact;
      delete next.tenantContact;
      return next;
    });
  };

  const handleSave = async () => {
    const validationErrors = validateApartmentForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSaving(true);
    try {
      await onSave(toDto(form));
      onOpenChange(false);
    } catch (err: unknown) {
      const details = extractValidationDetails(err);
      if (details) {
        setErrors(details);
      } else {
        setErrors({ _form: err instanceof Error ? err.message : "Erro ao salvar" });
      }
    } finally {
      setSaving(false);
    }
  };

  const isEditing = !!apartment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar apartamento" : "Cadastrar apartamento"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados cadastrais do apartamento/unidade."
              : "Informe os dados do apartamento/unidade para cadastro."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {errors._form && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{errors._form}</p>
          )}
          {/* Unit identification */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Unidade *</Label>
              <Input
                placeholder="101"
                value={form.unit}
                onChange={(e) => update("unit", e.target.value)}
                className={errors.unit ? "border-red-300" : ""}
              />
              {errors.unit && <p className="text-xs text-red-500">{errors.unit}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Bloco *</Label>
              <Input
                placeholder="A"
                value={form.block}
                onChange={(e) => update("block", e.target.value)}
                className={errors.block ? "border-red-300" : ""}
              />
              {errors.block && <p className="text-xs text-red-500">{errors.block}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Andar</Label>
              <Input
                type="number"
                placeholder="1"
                value={form.floor}
                onChange={(e) => update("floor", e.target.value)}
              />
            </div>
          </div>

          {/* Owner data */}
          <fieldset className="border border-gray-200 rounded-lg p-3 space-y-3">
            <legend className="text-sm font-medium text-gray-700 px-1">Proprietário</legend>
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input
                placeholder="Nome completo"
                value={form.ownerName}
                onChange={(e) => update("ownerName", e.target.value)}
                className={errors.ownerName ? "border-red-300" : ""}
              />
              {errors.ownerName && <p className="text-xs text-red-500">{errors.ownerName}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <Input
                  placeholder="(11)99999-9999"
                  value={applyPhoneMask(form.ownerPhone)}
                  onChange={(e) => update("ownerPhone", e.target.value)}
                  className={errors.ownerPhone || errors.ownerContact ? "border-red-300" : ""}
                />
                {errors.ownerPhone && <p className="text-xs text-red-500">{errors.ownerPhone}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={form.ownerEmail}
                  onChange={(e) => update("ownerEmail", e.target.value)}
                  className={errors.ownerEmail ? "border-red-300" : ""}
                />
                {errors.ownerEmail && <p className="text-xs text-red-500">{errors.ownerEmail}</p>}
              </div>
            </div>
            {errors.ownerContact && <p className="text-xs text-red-500">{errors.ownerContact}</p>}
            <div className="space-y-1.5">
              <Label>Documento (CPF/CNPJ)</Label>
              <Input
                placeholder="000.000.000-00"
                value={form.ownerDocument}
                onChange={(e) => update("ownerDocument", e.target.value)}
              />
            </div>
          </fieldset>

          {/* Rental & vehicle */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Alugado?</Label>
              <Select
                value={form.isRented ? "true" : "false"}
                onValueChange={(v) => update("isRented", v === "true")}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Não</SelectItem>
                  <SelectItem value="true">Sim</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Possui veículo?</Label>
              <Select
                value={form.hasVehicle ? "true" : "false"}
                onValueChange={(v) => update("hasVehicle", v === "true")}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Sim — participa do sorteio</SelectItem>
                  <SelectItem value="false">Não — não participa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tenant data - conditionally shown */}
          {form.isRented && (
            <fieldset className="border border-gray-200 rounded-lg p-3 space-y-3">
              <legend className="text-sm font-medium text-gray-700 px-1">Inquilino</legend>
              <div className="space-y-1.5">
                <Label>Nome *</Label>
                <Input
                  placeholder="Nome completo"
                  value={form.tenantName}
                  onChange={(e) => update("tenantName", e.target.value)}
                  className={errors.tenantName ? "border-red-300" : ""}
                />
                {errors.tenantName && <p className="text-xs text-red-500">{errors.tenantName}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Telefone</Label>
                  <Input
                    placeholder="(11)99999-9999"
                    value={applyPhoneMask(form.tenantPhone)}
                    onChange={(e) => update("tenantPhone", e.target.value)}
                    className={errors.tenantPhone || errors.tenantContact ? "border-red-300" : ""}
                  />
                  {errors.tenantPhone && <p className="text-xs text-red-500">{errors.tenantPhone}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={form.tenantEmail}
                    onChange={(e) => update("tenantEmail", e.target.value)}
                  />
                </div>
              </div>
              {errors.tenantContact && <p className="text-xs text-red-500">{errors.tenantContact}</p>}
              <div className="space-y-1.5">
                <Label>Documento (CPF/CNPJ)</Label>
                <Input
                  placeholder="000.000.000-00"
                  value={form.tenantDocument}
                  onChange={(e) => update("tenantDocument", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Início locação</Label>
                  <Input
                    type="date"
                    value={form.rentalStart}
                    onChange={(e) => update("rentalStart", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Fim locação</Label>
                  <Input
                    type="date"
                    value={form.rentalEnd}
                    onChange={(e) => update("rentalEnd", e.target.value)}
                    className={errors.rentalEnd ? "border-red-300" : ""}
                  />
                  {errors.rentalEnd && <p className="text-xs text-red-500">{errors.rentalEnd}</p>}
                </div>
              </div>
            </fieldset>
          )}

          {/* Observations */}
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Input
              placeholder="Informações adicionais"
              value={form.observations}
              onChange={(e) => update("observations", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            className="bg-blue-700 hover:bg-blue-800 text-white"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
