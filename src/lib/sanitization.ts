const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
};

export function sanitizeHtml(input: string): string {
  return input.replace(/[&<>"'`/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .slice(0, 10000);
}

export function sanitizeEmail(email: string): string {
  return email
    .trim()
    .toLowerCase()
    .replace(/[^\w@.\-+]/g, '')
    .slice(0, 320);
}

export function sanitizeName(name: string): string {
  return name
    .trim()
    .replace(/[^\w\s\-'.]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 100);
}

export function sanitizePhone(phone: string): string {
  return phone
    .trim()
    .replace(/[^\d\s\-+()]/g, '')
    .slice(0, 20);
}

export function sanitizeAddress(address: string): string {
  return sanitizeInput(address).slice(0, 500);
}

export function containsSqlInjection(input: string): boolean {
  const patterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|FETCH|DECLARE|TRUNCATE)\b)/i,
    /(--|;|\/\*|\*\/|xp_|sp_)/i,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
    /(CHAR\s*\(|CONCAT\s*\(|0x[0-9a-f]+)/i,
  ];

  return patterns.some((pattern) => pattern.test(input));
}

export function validateInputLength(
  input: string,
  maxLength: number,
  fieldName: string
): { valid: boolean; error?: string } {
  if (input.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} must be less than ${maxLength} characters`,
    };
  }
  return { valid: true };
}

export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(array);
  } else {
    throw new Error('No secure random number generator available');
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const maxLen = Math.max(a.length, b.length);
  let result = a.length ^ b.length;
  for (let i = 0; i < maxLen; i++) {
    result |= (a.charCodeAt(i % a.length) || 0) ^ (b.charCodeAt(i % b.length) || 0);
  }
  return result === 0;
}
