// Dates are plain local 'YYYY-MM-DD' strings so they survive JSON and compare as text.

const pad = (n) => String(n).padStart(2, '0');

export function toStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromStr(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayStr() {
  return toStr(new Date());
}

export function addDays(s, n) {
  const d = fromStr(s);
  d.setDate(d.getDate() + n);
  return toStr(d);
}

export function diffDays(a, b) {
  return Math.round((fromStr(a) - fromStr(b)) / 86400000);
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function weekdayLabel(s) {
  return WEEKDAYS[fromStr(s).getDay()];
}

// Monday to Sunday of the week that contains `today`.
export function weekOf(today) {
  const day = fromStr(today).getDay();
  const monday = addDays(today, -((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

// How a date reads next to today: 오늘, 내일, 어제, this week's weekday, or a date.
export function relativeLabel(s, today) {
  const diff = diffDays(s, today);
  if (diff === 0) return '오늘';
  if (diff === 1) return '내일';
  if (diff === -1) return '어제';
  if (diff > 1 && diff < 7) return `${weekdayLabel(s)}요일`;
  const d = fromStr(s);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}
