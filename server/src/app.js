import express from 'express';
import cors from 'cors';
import config from './config/environment.js';
import apiRouter from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Configure CORS
const allowedOrigins = [config.clientUrl, 'http://localhost:5173', 'http://localhost:3000'];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman) or matching allowed list
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root API discovery route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Resume Analyzer API Server',
    version: '0.1.0',
    docs: '/api/health',
  });
});

// Mount main API routes
app.use('/api', apiRouter);

// 404 Handler for unrecognized routes
app.use(notFoundHandler);

// Global Centralized Error Handler
app.use(errorHandler);

export default app;
