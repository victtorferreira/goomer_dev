export function getCurrentDayAndTimeInTimezone(timezone: string) {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour12: false,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);
  const parts = formatter.formatToParts(date);

  const dayMap: Record<string, number> = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };

  const day =
    parts
      .find((p) => p.type === "weekday")
      ?.value?.toLowerCase()
      .slice(0, 3) ?? "sun";
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";

  return {
    currentDay: dayMap[day],
    currentTime: `${hour}:${minute}`,
  };
}
