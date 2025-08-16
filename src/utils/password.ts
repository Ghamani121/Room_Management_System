export function generateTempPassword(): string {
  const letters = Array.from({ length: 6 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26)) // A-Z
  ).join('');

  const digits = Math.floor(1000 + Math.random() * 9000); // 4-digit number

  return `TEMP-${letters}-${digits}`;
}
