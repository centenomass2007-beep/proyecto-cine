import { CINEMA_TIME_ZONE } from "@/lib/cinema-datetime";

export function formatCurrency(value: number | string | { toString(): string } | null | undefined) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: CINEMA_TIME_ZONE,
  }).format(new Date(value));
}

export function formatDateOnly(value: Date | string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeZone: CINEMA_TIME_ZONE,
  }).format(new Date(value));
}

export function formatOccupancy(soldSeats: number, capacity: number) {
  if (capacity <= 0) {
    return "0%";
  }

  return `${Math.round((soldSeats / capacity) * 100)}%`;
}
