import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger.js';
import { env } from '../config/env.js';

const router = Router();

/**
 * Swagger UI Options
 */
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: `${env.APP_NAME} API Documentation`,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
  },
};

/**
 * @route GET /docs
 * @desc API Documentation (Swagger UI)
 * @access Public
 */
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, swaggerUiOptions));

/**
 * @route GET /docs/json
 * @desc OpenAPI Specification (JSON)
 * @access Public
 */
router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

export default router;
