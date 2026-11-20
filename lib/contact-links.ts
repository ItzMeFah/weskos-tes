export function whatsappUrl(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, "");
  const internationalNumber = digits.startsWith("0")
    ? `62${digits.slice(1)}`
    : digits.startsWith("8")
      ? `62${digits}`
      : digits;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${internationalNumber}${query}`;
}

export function instagramUrl(username: string) {
  return `https://instagram.com/${username.trim().replace(/^@+/, "")}`;
}
