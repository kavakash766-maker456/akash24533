// src/app.ts
// Main Express application setup

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

// Route imports
import authRoutes         from './modules/auth/auth.routes';
import usersRoutes        from './modules/users/users.routes';
import jobsRoutes         from './modules/jobs/jobs.routes';
import submissionsRoutes  from './modules/submissions/submissions.routes';
import walletRoutes       from './modules/wallet/wallet.routes';
import withdrawalRoutes   from './modules/withdrawals/withdrawals.routes';
import notificationRoutes from './modules/notifications/notifications.routes';
import adminRoutes        from './modules/admin/admin.routes';
import categoriesRoutes   from './modules/categories/categories.routes';
import referralRoutes     from './modules/referrals/referrals.routes';
import reviewRoutes       from './modules/reviews/reviews.routes';
import supportRoutes      from './modules/support/support.routes';
import membershipRoutes   from './modules/memberships/memberships.routes';

import { errorHandler } from './middleware/errorHandler';

const app = express();

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts, please try again later.' },
});

// ── Swagger API Docs ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const swaggerSpec = swaggerJSDoc({
    definition: {
      openapi: '3.0.0',
      info: { title: 'TaskEarn Pro API', version: '1.0.0' },
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
        }
      },
      security: [{ bearerAuth: [] }]
    },
    apis: ['./src/modules/**/*.routes.ts'],
  });
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`,          authLimiter, authRoutes);
app.use(`${API}/users`,         usersRoutes);
app.use(`${API}/jobs`,          jobsRoutes);
app.use(`${API}/submissions`,   submissionsRoutes);
app.use(`${API}/wallet`,        walletRoutes);
app.use(`${API}/withdrawals`,   withdrawalRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/admin`,         adminRoutes);
app.use(`${API}/categories`,    categoriesRoutes);
app.use(`${API}/referrals`,     referralRoutes);
app.use(`${API}/reviews`,       reviewRoutes);
app.use(`${API}/support`,       supportRoutes);
app.use(`${API}/memberships`,   membershipRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
