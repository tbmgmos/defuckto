export function isoNow(): string {
  return new Date().toISOString();
}

/** yyyy-mm-dd, local-enough for a demo — used to reset daily quotas (free questions, streaks). */
export function localDayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isoMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export function isoHoursAgo(hours: number): string {
  return isoMinutesAgo(hours * 60);
}

export function isoDaysAgo(days: number): string {
  return isoHoursAgo(days * 24);
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} дн назад`;
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function formatClockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}
