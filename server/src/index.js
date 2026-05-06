import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDb } from './lib/db.js';
import { validateEnv } from './lib/env.js';
import authRoutes from './routes/authRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import urlRoutes from './routes/urlRoutes.js';
import { redirectToOriginal } from './controllers/urlController.js';

dotenv.config();

validateEnv();

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = origin?.replace(/\/$/, '');
      if (!origin || allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 180,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'linknova-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/url', urlRoutes);
app.get('/:shortId', redirectToOriginal);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || 'Something went wrong' });
});

connectDb().then(() => {
  const server = app.listen(port, () => {
    console.log(`LinkNova API running on port ${port}`);
    console.log(`Allowed client origins: ${allowedOrigins.join(', ')}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Stop the existing server or set a different PORT in server/.env.`);
      process.exit(1);
    }

    throw error;
  });
}).catch((error) => {
  console.error('Failed to start LinkNova API.');
  console.error(`${error.name}: ${error.message}`);

  if (/querySrv|ENOTFOUND|ETIMEOUT|MongoServerSelectionError/i.test(error.message) || error.name === 'MongoServerSelectionError') {
    console.error('MongoDB troubleshooting: verify MONGO_URI in Render and allow Render access in MongoDB Atlas Network Access.');
  }

  process.exit(1);
});
