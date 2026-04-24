export function maskNationalId(value: string | undefined): string | undefined {
  if (!value) {
    return value;
  }

  const trimmed = value.trim();
  if (trimmed.length <= 4) {
    return `${'*'.repeat(Math.max(trimmed.length - 1, 0))}${trimmed.slice(-1)}`;
  }

  return `${'*'.repeat(trimmed.length - 4)}${trimmed.slice(-4)}`;
}

export function maskEmail(value: string | undefined): string | undefined {
  if (!value) {
    return value;
  }

  const trimmed = value.trim();
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 1) {
    return '***';
  }

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex);
  return `${local[0]}***${domain}`;
}
