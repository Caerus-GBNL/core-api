const express = require('express');
const httpStatus = require('http-status');
const { checkDatabaseHealth, getDatabaseStats } = require('../../utils/db-health');

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check endpoint
 *     description: Returns overall service health status including database connectivity
 *     parameters:
 *       - $ref: '#/components/parameters/CorrelationId'
 *     responses:
 *       200:
 *         description: Service is healthy
 *         headers:
 *           X-Correlation-ID:
 *             $ref: '#/components/headers/X-Correlation-ID'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *             examples:
 *               healthy:
 *                 summary: Service is healthy
 *                 value:
 *                   status: "UP"
 *                   timestamp: "2025-08-21T10:30:00.000Z"
 *                   correlationId: "550e8400-e29b-41d4-a716-446655440000"
 *                   checks:
 *                     database:
 *                       status: "healthy"
 *                       connection: true
 *                       pool:
 *                         max: 10
 *                         min: 2
 *                         acquire: 30000
 *                         idle: 10000
 *                       responseTime: "25ms"
 *                       timestamp: "2025-08-21T10:30:00.000Z"
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */

/**
 * GET /health - Basic health check
 * Returns overall service health status
 */
router.get('/', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();

    const health = {
      status: dbHealth.status === 'healthy' ? 'UP' : 'DOWN',
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId,
      checks: {
        database: dbHealth,
      },
    };

    const statusCode = health.status === 'UP' ? httpStatus.OK : httpStatus.SERVICE_UNAVAILABLE;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(httpStatus.SERVICE_UNAVAILABLE).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     tags: [Health]
 *     summary: Readiness check endpoint
 *     description: Returns whether service is ready to accept traffic (Kubernetes readiness probe)
 *     parameters:
 *       - $ref: '#/components/parameters/CorrelationId'
 *     responses:
 *       200:
 *         description: Service is ready
 *         headers:
 *           X-Correlation-ID:
 *             $ref: '#/components/headers/X-Correlation-ID'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReadinessCheck'
 *             examples:
 *               ready:
 *                 summary: Service is ready
 *                 value:
 *                   status: "READY"
 *                   timestamp: "2025-08-21T10:30:00.000Z"
 *                   correlationId: "550e8400-e29b-41d4-a716-446655440000"
 *       503:
 *         description: Service is not ready
 *         headers:
 *           X-Correlation-ID:
 *             $ref: '#/components/headers/X-Correlation-ID'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReadinessCheck'
 *             examples:
 *               not_ready:
 *                 summary: Service is not ready
 *                 value:
 *                   status: "NOT_READY"
 *                   timestamp: "2025-08-21T10:30:00.000Z"
 *                   correlationId: "550e8400-e29b-41d4-a716-446655440000"
 *                   reason: "Database not available"
 */
router.get('/ready', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();

    if (dbHealth.status === 'healthy') {
      res.status(httpStatus.OK).json({
        status: 'READY',
        timestamp: new Date().toISOString(),
        correlationId: req.correlationId,
      });
    } else {
      res.status(httpStatus.SERVICE_UNAVAILABLE).json({
        status: 'NOT_READY',
        timestamp: new Date().toISOString(),
        correlationId: req.correlationId,
        reason: 'Database not available',
      });
    }
  } catch (error) {
    res.status(httpStatus.SERVICE_UNAVAILABLE).json({
      status: 'NOT_READY',
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     tags: [Health]
 *     summary: Liveness check endpoint
 *     description: Returns whether service is running and alive (Kubernetes liveness probe)
 *     parameters:
 *       - $ref: '#/components/parameters/CorrelationId'
 *     responses:
 *       200:
 *         description: Service is alive
 *         headers:
 *           X-Correlation-ID:
 *             $ref: '#/components/headers/X-Correlation-ID'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LivenessCheck'
 *             examples:
 *               alive:
 *                 summary: Service is alive
 *                 value:
 *                   status: "ALIVE"
 *                   timestamp: "2025-08-21T10:30:00.000Z"
 *                   correlationId: "550e8400-e29b-41d4-a716-446655440000"
 */
router.get('/live', (req, res) => {
  res.status(httpStatus.OK).json({
    status: 'ALIVE',
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId,
  });
});

/**
 * @swagger
 * /health/stats:
 *   get:
 *     tags: [Health]
 *     summary: Database statistics endpoint
 *     description: Returns detailed database connection pool statistics
 *     parameters:
 *       - $ref: '#/components/parameters/CorrelationId'
 *     responses:
 *       200:
 *         description: Database statistics retrieved successfully
 *         headers:
 *           X-Correlation-ID:
 *             $ref: '#/components/headers/X-Correlation-ID'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DatabaseStats'
 *             examples:
 *               stats:
 *                 summary: Database statistics
 *                 value:
 *                   database:
 *                     pool:
 *                       max: 10
 *                       min: 2
 *                       acquire: 30000
 *                       idle: 10000
 *                     dialect: "postgres"
 *                     version: "6.32.1"
 *                   timestamp: "2025-08-21T10:30:00.000Z"
 *                   correlationId: "550e8400-e29b-41d4-a716-446655440000"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/stats', (req, res) => {
  try {
    const stats = getDatabaseStats();

    res.status(httpStatus.OK).json({
      database: stats,
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: error.message,
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId,
    });
  }
});

module.exports = router;
