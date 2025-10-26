import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getProfile, updateProfile, getKpiData, getSuitability, getInsights, getRevenueData, getRainfallData } from './store';
import { Profile } from './types';
import { checkAuth } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { createLogger } from './logger';

// Load environment variables
dotenv.config();

// Create logger for server
const logger = createLogger('server');

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5137';

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', 'middleware', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });
  next();
});

// Basic health check endpoint (no auth required)
app.get('/', (req: Request, res: Response) => {
  logger.info('Health check endpoint accessed', 'GET /');
  res.json({
    status: 'ok',
    message: 'Farm Easy Backend API',
    timestamp: new Date().toISOString()
  });
});

// POST /api/setup - Handles onboarding data submission (no auth required)
app.post('/api/setup', (req: Request, res: Response) => {
  logger.info('Setup endpoint called', 'POST /api/setup', { email: req.body.email });
  try {
    const onboardingData = req.body;
    
    // Validate required fields
    if (!onboardingData.name || !onboardingData.email) {
      logger.warn('Setup validation failed: missing name or email', 'POST /api/setup');
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    if (!onboardingData.location || !onboardingData.location.lat || !onboardingData.location.lon) {
      logger.warn('Setup validation failed: missing location data', 'POST /api/setup');
      return res.status(400).json({ error: 'Location with latitude and longitude is required' });
    }
    
    if (!onboardingData.crops || onboardingData.crops.length === 0) {
      logger.warn('Setup validation failed: no crops selected', 'POST /api/setup');
      return res.status(400).json({ error: 'At least one crop must be selected' });
    }
    
    // Transform onboarding data to Profile format
    const profileData: Partial<Profile> = {
      name: onboardingData.name,
      email: onboardingData.email,
      phone: onboardingData.phone || '',
      location: {
        lat: onboardingData.location.lat,
        lon: onboardingData.location.lon,
        place: onboardingData.location.county || onboardingData.location.place || 'Unknown'
      },
      language: onboardingData.language || 'en',
      soil: onboardingData.soilType || onboardingData.soil || 'Unknown',
      irrigation: onboardingData.irrigationType || onboardingData.irrigation || 'Unknown',
      farmSize: onboardingData.farmSize || { value: 0, unit: 'ac' },
      crops: onboardingData.crops || onboardingData.preferredCrops || [],
      selectedCrop: onboardingData.crops?.[0] || onboardingData.preferredCrops?.[0] || ''
    };
    
    // Update profile in store
    const updatedProfile = updateProfile(profileData);
    
    logger.info('Setup completed successfully', 'POST /api/setup', { email: updatedProfile.email });
    
    // Return success response
    res.json({
      success: true,
      profile: updatedProfile
    });
  } catch (error) {
    logger.error('Error processing setup data', 'POST /api/setup', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to process setup data' });
  }
});

// Apply authentication middleware to all routes below this point
app.use(checkAuth);

// API Endpoints (protected by optional auth)

// GET /api/profile - Returns the user's farm profile
app.get('/api/profile', (req: Request, res: Response) => {
  logger.info('Get profile endpoint called', 'GET /api/profile');
  try {
    const profile = getProfile();
    logger.info('Profile retrieved successfully', 'GET /api/profile');
    res.json(profile);
  } catch (error) {
    logger.error('Failed to retrieve profile', 'GET /api/profile', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// POST /api/profile - Updates the user's farm profile
app.post('/api/profile', (req: Request, res: Response) => {
  logger.info('Update profile endpoint called');
  try {
    const updates: Partial<Profile> = req.body;
    const updatedProfile = updateProfile(updates);
    logger.info('Profile updated successfully', { email: updatedProfile.email });
    res.json(updatedProfile);
  } catch (error) {
    logger.error('Failed to update profile', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/kpi - Returns KPI data
app.get('/api/kpi', (req: Request, res: Response) => {
  logger.info('Get KPI data endpoint called', 'GET /api/kpi');
  try {
    const kpiData = getKpiData();
    logger.info('KPI data retrieved successfully', 'GET /api/kpi');
    res.json(kpiData);
  } catch (error) {
    logger.error('Failed to retrieve KPI data', 'GET /api/kpi', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to retrieve KPI data' });
  }
});

// GET /api/suitability - Returns crop suitability data
app.get('/api/suitability', (req: Request, res: Response) => {
  logger.info('Get suitability data endpoint called');
  try {
    const suitability = getSuitability();
    logger.info('Suitability data retrieved successfully');
    res.json(suitability);
  } catch (error) {
    logger.error('Failed to retrieve suitability data', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to retrieve suitability data' });
  }
});

// GET /api/insights - Returns insights array
app.get('/api/insights', (req: Request, res: Response) => {
  logger.info('Get insights endpoint called');
  try {
    const insights = getInsights();
    logger.info('Insights retrieved successfully', { count: insights.length });
    res.json(insights);
  } catch (error) {
    logger.error('Failed to retrieve insights', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to retrieve insights' });
  }
});

// GET /api/revenue - Returns revenue data
app.get('/api/revenue', (req: Request, res: Response) => {
  logger.info('Get revenue data endpoint called');
  try {
    const revenueData = getRevenueData();
    logger.info('Revenue data retrieved successfully', { count: revenueData.length });
    res.json(revenueData);
  } catch (error) {
    logger.error('Failed to retrieve revenue data', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to retrieve revenue data' });
  }
});

// GET /api/rainfall - Returns rainfall data
app.get('/api/rainfall', (req: Request, res: Response) => {
  logger.info('Get rainfall data endpoint called');
  try {
    const rainfallData = getRainfallData();
    logger.info('Rainfall data retrieved successfully', { count: rainfallData.length });
    res.json(rainfallData);
  } catch (error) {
    logger.error('Failed to retrieve rainfall data', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to retrieve rainfall data' });
  }
});

// Sprint 4: Placeholder endpoints for future integrations (protected by optional auth)

// POST /api/chat - Placeholder for Letta AI integration
app.post('/api/chat', (req: Request, res: Response) => {
  logger.info('Chat endpoint called');
  try {
    const { message } = req.body;
    
    if (!message) {
      logger.warn('Chat request missing message');
      return res.status(400).json({ error: 'Message is required' });
    }
    
    logger.info('Processing chat message', { messageLength: message.length });
    
    // Mock response for now
    res.json({
      reply: "This is a mock response from the AI assistant."
    });
  } catch (error) {
    logger.error('Error in chat endpoint', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

// POST /api/voice - Placeholder for VAPI/Deepgram/Fish Audio integration
app.post('/api/voice', (req: Request, res: Response) => {
  logger.info('Voice endpoint called');
  try {
    // Mock response for now
    res.json({
      text: "This is a mock voice transcription."
    });
    logger.info('Voice transcription completed (mock)');
  } catch (error) {
    logger.error('Error in voice endpoint', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to process voice request' });
  }
});

// GET /api/farm-data - Placeholder for Bright Data integration
app.get('/api/farm-data', (req: Request, res: Response) => {
  logger.info('Farm data endpoint called');
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      logger.warn('Farm data request missing coordinates');
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    logger.info('Fetching farm data', { lat, lon });
    
    // Mock response for now
    res.json({
      mockData: "some farm data based on location"
    });
  } catch (error) {
    logger.error('Error in farm-data endpoint', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to retrieve farm data' });
  }
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info('Server started', 'app.listen', {
    port: PORT,
    corsOrigin: CORS_ORIGIN,
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});