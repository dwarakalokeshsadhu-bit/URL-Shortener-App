const allowedProtocols = new Set(['http:', 'https:']);

export function normalizeUrl(value) {
  const candidate = value?.trim();
  if (!candidate) throw Object.assign(new Error('URL is required'), { status: 400 });

  const withProtocol = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;
  let parsed;

  try {
    parsed = new URL(withProtocol);
  } catch {
    throw Object.assign(new Error('Enter a valid URL'), { status: 400 });
  }

  if (!allowedProtocols.has(parsed.protocol) || !parsed.hostname.includes('.')) {
    throw Object.assign(new Error('Enter a valid public URL'), { status: 400 });
  }

  return parsed.toString();
}

export function validateAlias(alias) {
  if (!alias) return null;
  const clean = alias.trim();
  if (!/^[a-zA-Z0-9_-]{3,32}$/.test(clean)) {
    throw Object.assign(new Error('Alias must be 3-32 letters, numbers, hyphens, or underscores'), { status: 400 });
  }
  return clean;
}
