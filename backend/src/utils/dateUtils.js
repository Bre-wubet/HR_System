export function toDate(value) {
  return value instanceof Date ? value : new Date(value);
}

export function startOfDay(value) {
  const d = toDate(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(value) {
  const d = toDate(value);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function dateRange(from, to) {
  return { gte: from ? toDate(from) : undefined, lte: to ? toDate(to) : undefined };
}


