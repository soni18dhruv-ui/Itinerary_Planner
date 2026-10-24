export function formatLongDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatRange(start: string, end: string) {
  return `${formatLongDate(start)} – ${formatLongDate(end)}`;
}

export function tripLength(start: string, end: string) {
  const from = new Date(`${start}T00:00:00`);
  const to = new Date(`${end}T00:00:00`);
  return Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1);
}

export function formatMoney(amount: number | null, currency: string) {
  if (amount == null) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function timeLabel(value: string | null) {
  if (!value) return "";
  return value.slice(0, 5);
}
