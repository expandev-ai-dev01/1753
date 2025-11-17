/**
 * @summary
 * Main server entry point for the StockBox API.
 * Configures Express application with security, CORS, compression,
 * and error handling middleware.
 *
 * @module server
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { config } from '@/config';
import { errorMiddleware } from '@/middleware/error';
import { notFoundMiddleware } from '@/middleware/notFound';
import apiRoutes from '@/routes';

dotenv.config();

const app: Application = express();

/**
 * @rule {be-security-middleware}
 * Security middleware configuration
 */
app.use(helmet());
app.use(cors(config.api.cors));

/**
 * @rule {be-request-processing}
 * Request processing middleware
 */
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * @rule {be-health-check}
 * Health check endpoint (no versioning)
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'StockBox API',
  });
});

/**
 * @rule {be-api-versioning}
 * API Routes with versioning
 * Creates routes like:
 * - /api/v1/external/...
 * - /api/v1/internal/...
 */
app.use('/api', apiRoutes);

/**
 * @rule {be-error-handling}
 * 404 handler
 */
app.use(notFoundMiddleware);

/**
 * Error handling middleware
 */
app.use(errorMiddleware);

/**
 * @rule {be-server-startup}
 * Application startup
 */
const server = app.listen(config.api.port, () => {
  console.log(`Server running on port ${config.api.port} in ${process.env.NODE_ENV} mode`);
  console.log(`API available at http://localhost:${config.api.port}/api/${config.api.version}`);
});

/**
 * @rule {be-graceful-shutdown}
 * Graceful shutdown handler
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default server;
