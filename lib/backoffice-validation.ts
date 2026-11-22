export function isValidOfficeLoginName(value: string) {
  if (value.length < 3 || value.length > 254) return false;
  if (/^[A-Za-z0-9._-]{3,40}$/.test(value)) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
