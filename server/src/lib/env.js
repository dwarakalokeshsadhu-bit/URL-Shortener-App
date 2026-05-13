export function validateEnv() {
  const required = ['JWT_SECRET'];

  if (process.env.NODE_ENV === 'production') {
    required.push('MONGO_URI', 'APP_URL');
  }

  const missing = required.filter((key) => !process.env[key]);
  if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL && !process.env.CLIENT_URLS) {
    missing.push('CLIENT_URL or CLIENT_URLS');
  }

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (process.env.MONGO_URI?.startsWith('MONGO_URI=')) {
    throw new Error('MONGO_URI value is invalid. Paste only the MongoDB URI, not "MONGO_URI=...".');
  }

  if (process.env.NODE_ENV === 'production' && /^mongodb(\+srv)?:\/\/.+\/local(\?|$)/i.test(process.env.MONGO_URI || '')) {
    throw new Error('MONGO_URI is using the MongoDB "local" database. Use an app database name like "linknova" instead.');
  }

  if (process.env.NODE_ENV === 'production' && /localhost|127\.0\.0\.1/i.test(process.env.APP_URL || '')) {
    throw new Error('Production APP_URL must be your deployed backend URL, not localhost.');
  }

  const isLocalUrl = (value) => /localhost|127\.0\.0\.1/i.test(value || '');

  if (process.env.NODE_ENV === 'production' && isLocalUrl(process.env.CLIENT_URL)) {
    throw new Error('Production CLIENT_URL must be your deployed frontend URL, not localhost.');
  }

  const clientOrigins = [process.env.CLIENT_URL, ...(process.env.CLIENT_URLS || '').split(',')]
    .filter(Boolean)
    .map((origin) => origin.trim());

  const hasDeployedClientOrigin = clientOrigins.some((origin) => !isLocalUrl(origin));

  if (process.env.NODE_ENV === 'production' && !hasDeployedClientOrigin) {
    throw new Error('Production CLIENT_URL or CLIENT_URLS must include your deployed frontend URL.');
  }
}
