export function isValidTimeFormat(time: string): boolean {
  // Regex para validar formato HH:mm (00:00 até 23:59)
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(time);
}

export function hasMinimumInterval(
  start: string,
  end: string,
  minMinutes = 15
): boolean {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;

  return endTotal - startTotal >= minMinutes;
}
