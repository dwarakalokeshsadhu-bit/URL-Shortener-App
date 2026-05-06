export function validateEnv() {
  const required = ['JWT_SECRET'];

  if (process.env.NODE_ENV === 'production') {
    required.push('MONGO_URI', 'APP_URL', 'CLIENT_URL');
  }

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (process.env.MONGO_URI?.startsWith('MONGO_URI=')) {
    throw new Error('MONGO_URI value is invalid. Paste only the MongoDB URI, not "MONGO_URI=...".');
  }

  if (process.env.NODE_ENV === 'production' && /localhost|127\.0\.0\.1/i.test(process.env.APP_URL || '')) {
    throw new Error('Production APP_URL must be your deployed backend URL, not localhost.');
  }

  if (process.env.NODE_ENV === 'production' && /localhost|127\.0\.0\.1/i.test(process.env.CLIENT_URL || '')) {
    throw new Error('Production CLIENT_URL must be your deployed frontend URL, not localhost.');
  }
}
