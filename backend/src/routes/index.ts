/**
 * @summary
 * Main API router with version management
 * Handles routing for different API versions
 *
 * @module routes
 */

import { Router } from 'express';
import v1Routes from './v1';

const router = Router();

/**
 * @rule {be-api-versioning}
 * Version 1 routes (current stable)
 */
router.use('/v1', v1Routes);

export default router;
