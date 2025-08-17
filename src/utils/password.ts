export function generateTempPassword(): string {
  const letters = Array.from({ length: 6 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26)) // A-Z
  ).join('');

  const digits = Math.floor(1000 + Math.random() * 9000); // 4-digit number

  return `TEMP-${letters}-${digits}`;
}


// Utility to check if a password is in "temp password format"
export function isTempPasswordFormat(password: string): boolean {
    // Format: TEMP-XXXXXX-1234 (6 letters + 4 digits)
    const tempRegex = /^TEMP-[A-Z]{6}-\d{4}$/;
    return tempRegex.test(password);
}

