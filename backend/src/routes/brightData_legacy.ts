import { Router } from 'express';
import { getBrightData } from '../controllers/brightData_legacy';

const router = Router();

/**
 * GET /api/brightdata-legacy
 * Legacy endpoint for Bright Data API integration
 * Query parameters: lat (latitude), lon (longitude)
 */
router.get('/', getBrightData);

export default router;