import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import filingRoutes from './routes/filingRoutes';
import userRouter from './routes/userRoutes';
import authRouter from './routes/authRoutes';
import { requireAuth, requireAdmin } from './middleware/requireAuth';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', async (_req, res) => {
  try {
    await prisma.$connect();
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ status: 'error', error: e });
  } finally {
    await prisma.$disconnect();
  }
});

app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
// User routes
app.use('/api/filings', requireAuth, filingRoutes);

// Admin routes
app.use('/api/admin/filings', requireAuth, requireAdmin, filingRoutes);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
