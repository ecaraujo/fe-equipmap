export function onlyDigits(value?: string | null): string {
  return String(value ?? "").replace(/\D/g, "");
}

export function formatPhone(value?: string | null): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;

  const areaCode = digits.slice(0, 2);
  const local = digits.slice(2);
  if (local.length <= 5) return `(${areaCode})${local}`;

  return `(${areaCode})${local.slice(0, 5)}-${local.slice(5, 9)}`;
}

export function toDateInputValue(value?: string | null): string {
  if (!value) return "";

  const iso = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    return `${iso[1].padStart(4, "0")}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  }

  const pt = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (pt) {
    return `${pt[3]}-${pt[2].padStart(2, "0")}-${pt[1].padStart(2, "0")}`;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

export function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}
