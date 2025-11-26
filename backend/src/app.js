import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// --- Import API Routes ---
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import cropRoutes from './routes/crop.routes.js';
import diseaseReportRoutes from './routes/diseaseReport.routes.js';
import agronomistRoutes from './routes/agronomist.routes.js';
import adminRoutes from './routes/admin.routes.js';
import locationRoutes from './routes/location.routes.js';
import mediaRoutes from './routes/media.routes.js';
import weatherRoutes from './routes/weather.routes.js';
import advisoryRoutes from './routes/advisory.routes.js';

// --- Import Error Middleware ---
import { errorHandler } from './middleware/error.middleware.js';

// --- Load environment variables ---
dotenv.config();

// --- Initialize Express ---
const app = express();

// --- Core Middleware ---
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health Check Endpoint ---
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// --- API Routes ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/crops', cropRoutes);
app.use('/api/v1/disease-reports', diseaseReportRoutes);
app.use('/api/v1/agronomists', agronomistRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/advisories', advisoryRoutes);


// --- Error Middleware ---
app.use(errorHandler);

export default app;
