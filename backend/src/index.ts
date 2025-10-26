import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getProfile, updateProfile, getKpiData, getSuitability, getInsights, getRevenueData, getRainfallData, initializeStore } from './store';
import { Profile } from './types';
import { checkAuth } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { createLogger } from './logger';
import { lettaBrightData } from './mockData';
import brightDataRouterLegacy from './routes/brightData_legacy';
import { LettaAgent } from './services/lettaAgent';
import { saveDataToFile, getLatestDataForLocation } from './services/storageService';
import { transformLettaResponse } from './services/dataTransformer';

// Load environment variables
dotenv.config();

// Create logger for server
const logger = createLogger('server');

const app = express();
const PORT = process.env.PORT || 3001;
// Remove trailing slash from CORS_ORIGIN to prevent mismatch issues across platforms
const CORS_ORIGIN = (process.env.CORS_ORIGIN || 'http://localhost:5137').replace(/\/$/, '');

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

// Mount Bright Data Legacy router
app.use('/api/brightdata-legacy', brightDataRouterLegacy);

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

// GET /api/kpi - Returns KPI data (REAL DATA ONLY)
app.get('/api/kpi', async (req: Request, res: Response) => {
  logger.info('Get KPI data endpoint called', 'GET /api/kpi');
  try {
    const profile = getProfile();
    
    if (!profile || !profile.location) {
      logger.error('No profile found', 'GET /api/kpi');
      return res.status(400).json({ error: 'Profile not configured' });
    }
    
    const { lat, lon } = profile.location;
    const latestData = await getLatestDataForLocation(lat, lon);
    
    if (!latestData || !latestData.data) {
      logger.error('No data found for location', 'GET /api/kpi', { lat, lon });
      return res.status(404).json({ error: 'No data available. Please fetch data first.' });
    }
    
    // Build KPI data from real data
    const kpiData = {
      weather: latestData.data.weather || {
        temp: 0,
        condition: "N/A",
        humidity: 0,
        windSpeed: 0,
        icon: "partly-cloudy"
      },
      soilpH: latestData.data.soilData?.properties?.pH || 6.5,
      drainage: latestData.data.soilData?.properties?.drainage || "N/A",
      estimatedRevenue: 0 // Keep as 0 per user request
    };
    
    logger.info('KPI data retrieved successfully from real data', 'GET /api/kpi');
    res.json(kpiData);
  } catch (error) {
    logger.error('Failed to retrieve KPI data', 'GET /api/kpi', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to retrieve KPI data' });
  }
});

// GET /api/suitability - Returns crop suitability data (REAL DATA ONLY)
app.get('/api/suitability', async (req: Request, res: Response) => {
  logger.info('Get suitability data endpoint called');
  try {
    const profile = getProfile();
    
    if (!profile || !profile.location) {
      logger.error('No profile found', 'GET /api/suitability');
      return res.status(400).json({ error: 'Profile not configured' });
    }
    
    const { lat, lon } = profile.location;
    const latestData = await getLatestDataForLocation(lat, lon);
    
    if (!latestData || !latestData.data || !latestData.data.cropData) {
      logger.error('No crop data found for location', 'GET /api/suitability', { lat, lon });
      return res.status(404).json({ error: 'No data available. Please fetch data first.' });
    }
    
    // Transform crop data to suitability format
    const topCrops = latestData.data.cropData.top_crops || [];
    const suitability = topCrops.map((crop: any, index: number) => {
      // Calculate score based on position (top crops = higher score)
      const score = Math.max(60, 95 - (index * 5));
      
      return {
        crop: crop.crop,
        score: score,
        subScores: {
          soil: score >= 90 ? 95 : score >= 70 ? 85 : 75,
          climate: score >= 90 ? 92 : score >= 70 ? 82 : 72,
          water: score >= 90 ? 88 : score >= 70 ? 78 : 68,
          market: score
        },
        profitability: crop.annual_profitability,
        yield_estimate: crop.yield_estimate,
        reason: crop.reason
      };
    });
    
    logger.info('Suitability data retrieved successfully from real data', { count: suitability.length });
    res.json(suitability);
  } catch (error) {
    logger.error('Failed to retrieve suitability data', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to retrieve suitability data' });
  }
});

// GET /api/insights - Returns insights array (REAL DATA ONLY)
app.get('/api/insights', async (req: Request, res: Response) => {
  logger.info('Get insights endpoint called');
  try {
    // Get profile to find latest data file
    const profile = getProfile();
    
    if (!profile || !profile.location) {
      logger.error('No profile found', 'GET /api/insights');
      return res.status(400).json({ error: 'Profile not configured' });
    }
    
    const { lat, lon } = profile.location;
    
    // Read latest data from file
    const latestData = await getLatestDataForLocation(lat, lon);
    
    if (!latestData || !latestData.data) {
      logger.error('No data found for location', 'GET /api/insights', { lat, lon });
      return res.status(404).json({ error: 'No data available. Please fetch data first.' });
    }
    
    const insights: any[] = [];
    let id = 1;
    
    // Add rainfall insights
    if (Array.isArray(latestData.data.rainfallData?.key_findings)) {
      latestData.data.rainfallData.key_findings.slice(0, 2).forEach((finding: string) => {
        insights.push({
          id: String(id++),
          severity: "info",
          text: finding
        });
      });
    }
    
    // Add crop insights
    if (Array.isArray(latestData.data.cropData?.key_findings)) {
      latestData.data.cropData.key_findings.slice(0, 2).forEach((finding: string) => {
        insights.push({
          id: String(id++),
          severity: finding.includes("limited") || finding.includes("minimal") ? "warn" : "info",
          text: finding
        });
      });
    }
    
    // Return insights or error if none found
    if (insights.length > 0) {
      logger.info('Insights retrieved successfully from file', { count: insights.length });
      res.json(insights.slice(0, 5));
    } else {
      logger.error('No insights found in data', 'GET /api/insights');
      res.status(404).json({ error: 'No insights available' });
    }
    
  } catch (error) {
    logger.error('Failed to retrieve insights', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
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

// GET /api/rainfall - Returns rainfall data (REAL DATA ONLY)
app.get('/api/rainfall', async (req: Request, res: Response) => {
  logger.info('Get rainfall data endpoint called', 'GET /api/rainfall');
  try {
    // Get profile to find latest data file
    const profile = getProfile();
    
    if (!profile || !profile.location) {
      logger.error('No profile found', 'GET /api/rainfall');
      return res.status(400).json({ error: 'Profile not configured' });
    }
    
    const { lat, lon } = profile.location;
    
    // Read latest data from file
    const latestData = await getLatestDataForLocation(lat, lon);
    
    if (!latestData || !latestData.data || !latestData.data.rainfallData) {
      logger.error('No rainfall data found for location', 'GET /api/rainfall', { lat, lon });
      return res.status(404).json({ error: 'No data available. Please fetch data first.' });
    }
    
    const rawRainfall = latestData.data.rainfallData;
    
    // Transform monthly rainfall to the format frontend expects
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const fullMonthNames = ["January", "February", "March", "April", "May", "June", 
                            "July", "August", "September", "October", "November", "December"];
    
    let months;
    
    // Check if monthly_rainfall is an object (has month names) or string
    if (typeof rawRainfall.monthly_rainfall === 'object' && rawRainfall.monthly_rainfall !== null) {
      // Format 1: Object with month names (e.g., San Francisco)
      months = monthNames.map((shortName, index) => {
        const fullName = fullMonthNames[index];
        const rainfallStr = rawRainfall.monthly_rainfall[fullName] || "0 inches";
        const rainfallInches = parseFloat(rainfallStr.match(/([\d.]+)/)?.[1] || "0");
        const mm = Math.round(rainfallInches * 25.4);
        
        // Calculate yield index based on rainfall
        const yieldIndex = rainfallInches >= 2 && rainfallInches <= 4 ? 90 + Math.round(Math.random() * 10) :
                           rainfallInches > 4 ? 80 + Math.round(Math.random() * 10) :
                           60 + Math.round(Math.random() * 20);
        
        return {
          month: shortName,
          mm: mm,
          yieldIndex: yieldIndex
        };
      });
    } else {
      // Format 2: No monthly breakdown available (e.g., Assam) - use annual average
      const annualRainfall = rawRainfall.annual_rainfall?.state_average || 
                             rawRainfall.annual_rainfall || 
                             "0 inches";
      const annualInches = parseFloat(annualRainfall.match(/([\d.]+)/)?.[1] || "0");
      const monthlyAverage = annualInches / 12;
      
      months = monthNames.map((shortName) => {
        // Distribute with some variation (monsoon pattern)
        const variation = Math.random() * 0.4 + 0.8; // 0.8 to 1.2 multiplier
        const mm = Math.round(monthlyAverage * 25.4 * variation);
        const yieldIndex = mm >= 50 && mm <= 100 ? 90 + Math.round(Math.random() * 10) :
                          mm > 100 ? 80 + Math.round(Math.random() * 10) :
                          60 + Math.round(Math.random() * 20);
        
        return {
          month: shortName,
          mm: mm,
          yieldIndex: yieldIndex
        };
      });
    }
    
    const response = {
      months: months,
      keyFindings: rawRainfall.key_findings || []
    };
    
    logger.info('Rainfall data transformed and retrieved successfully from file', 'GET /api/rainfall');
    res.json(response);
  } catch (error) {
    logger.error('Failed to retrieve rainfall data', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to retrieve rainfall data' });
  }
});

// GET /api/soil - Returns soil data (REAL DATA ONLY)
app.get('/api/soil', async (req: Request, res: Response) => {
  logger.info('Get soil data endpoint called', 'GET /api/soil');
  try {
    // Get profile to find latest data file
    const profile = getProfile();
    
    if (!profile || !profile.location) {
      logger.error('No profile found', 'GET /api/soil');
      return res.status(400).json({ error: 'Profile not configured' });
    }
    
    const { lat, lon } = profile.location;
    
    // Read latest data from file
    const latestData = await getLatestDataForLocation(lat, lon);
    
    if (!latestData || !latestData.data || !latestData.data.soilData) {
      logger.error('No soil data found for location', 'GET /api/soil', { lat, lon });
      return res.status(404).json({ error: 'No data available. Please fetch data first.' });
    }
    
    const rawSoil = latestData.data.soilData;
    
    // Handle both formats: 'properties' or 'soil_properties'
    const props = rawSoil.soil_properties || rawSoil.properties || {};
    
    // Extract location string (handle multiple formats)
    let locationStr = "N/A";
    if (typeof rawSoil.location === 'object' && rawSoil.location !== null) {
      // Format 2 (Jaipur): location is object with city/state
      locationStr = rawSoil.location.city || rawSoil.location.state || "N/A";
    } else if (typeof rawSoil.location === 'string') {
      // Format 1 (Chico): location is string
      locationStr = rawSoil.location;
    } else if (rawSoil.pincode) {
      // Format 1 (Chico): location is null, use pincode
      locationStr = rawSoil.pincode;
    }
    
    // Helper function to estimate composition from texture if not provided
    function getCompositionFromTexture(texture: string) {
      const textureMap: { [key: string]: { sand: string, silt: string, clay: string } } = {
        'sandy loam': { sand: '60%', silt: '30%', clay: '10%' },
        'loam': { sand: '40%', silt: '40%', clay: '20%' },
        'clay loam': { sand: '30%', silt: '35%', clay: '35%' },
        'silt loam': { sand: '20%', silt: '60%', clay: '20%' },
        'clay': { sand: '20%', silt: '30%', clay: '50%' },
        'sandy': { sand: '85%', silt: '10%', clay: '5%' },
        'silty': { sand: '10%', silt: '80%', clay: '10%' }
      };
      
      const lowerTexture = texture.toLowerCase();
      for (const [key, composition] of Object.entries(textureMap)) {
        if (lowerTexture.includes(key)) {
          return composition;
        }
      }
      // Default if not found
      return { sand: '40%', silt: '40%', clay: '20%' };
    }
    
    const texture = props.texture || "Loam";
    const composition = getCompositionFromTexture(texture);
    
    // Transform to match frontend expectations
    const transformedSoil = {
      pincode: latestData.location.place || "N/A",
      properties: {
        soilSeries: locationStr,
        drainage: props.drainage || "Well drained",
        texture: texture,
        pH: props.pH || 6.5,
        organicMatter: props.organicMatter || props.organic_carbon || "2%",
        permeability: "Moderate",
        parentMaterial: props.minerals?.join(", ") || "Mixed minerals",
        // Add sand/silt/clay composition (real data first, then estimate)
        sandContent: props.sandContent || composition.sand,
        siltContent: props.siltContent || composition.silt,
        clayContent: props.clayContent || composition.clay
      },
      keyInsights: rawSoil.keyFindings || (Array.isArray(rawSoil.key_insights) ? rawSoil.key_insights.join(" ") : "No insights available"),
      sources: rawSoil.sources || []
    };
    
    logger.info('Soil data transformed and retrieved successfully from file', 'GET /api/soil');
    res.json(transformedSoil);
  } catch (error) {
    logger.error('Failed to retrieve soil data', 'GET /api/soil', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to retrieve soil data' });
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

// GET /api/dashboard-data - Fetch data using profile settings
app.get('/api/dashboard-data', async (req: Request, res: Response) => {
  logger.info('Dashboard data endpoint called');
  
  try {
    // Get profile from store
    const profile = getProfile();
    
    if (!profile || !profile.location || !profile.location.lat || !profile.location.lon) {
      logger.warn('Dashboard data request: profile not set or missing location');
      return res.status(400).json({ 
        error: 'Profile not configured. Please complete settings first.' 
      });
    }
    
    const { lat, lon, place } = profile.location;
    const crop = profile.selectedCrop || profile.crops?.[0] || 'wheat';
    const location = place || `${lat} ${lon}`;
    
    logger.info('Fetching dashboard data from profile', { lat, lon, location, crop });
    
    // Initialize Letta Agent with Bright Data credentials
    const agent = new LettaAgent(
      process.env.BRIGHTDATA_API_KEY || '',
      process.env.SERP_ZONE,
      process.env.UNLOCKER_ZONE
    );
    
    // Fetch all data (soil, rainfall, crop, weather) in parallel
    const data = await agent.getAllData(
      location,
      crop,
      lat,
      lon
    );
    
    logger.info('Dashboard data request completed', { location, crop });
    
    // Prepare response data (RAW data for frontend caching)
    const responseData = {
      success: true,
      location: { lat, lon, place: location },
      crop,
      timestamp: new Date().toISOString(),
      data
    };
    
    // Save data to file
    try {
      const savedFilePath = await saveDataToFile(responseData, lat, lon);
      logger.info('Dashboard data saved to file', { filePath: savedFilePath });
    } catch (saveError) {
      logger.error('Failed to save dashboard data to file', {
        error: saveError instanceof Error ? saveError.message : String(saveError)
      });
    }
    
    // Return RAW data (frontend will transform it)
    res.json(responseData);
  } catch (error) {
    logger.error('Error in dashboard-data endpoint', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({ error: 'Failed to retrieve dashboard data' });
  }
});

// GET /api/letta-data - Fetch agricultural data using Letta Agent
app.get('/api/letta-data', async (req: Request, res: Response) => {
  logger.info('Letta data endpoint called');
  
  try {
    const { lat, lon, location, crop = 'wheat' } = req.query;
    
    // Validate required parameters
    if (!lat || !lon || !location) {
      logger.warn('Letta data request missing parameters');
      return res.status(400).json({ error: 'Latitude, longitude, and location are required' });
    }
    
    logger.info('Processing Letta data request', { lat, lon, location, crop });
    
    // Initialize Letta Agent with Bright Data credentials
    const agent = new LettaAgent(
      process.env.BRIGHTDATA_API_KEY || '',
      process.env.SERP_ZONE,
      process.env.UNLOCKER_ZONE
    );
    
    // Fetch all data (soil, rainfall, crop, weather) in parallel
    const data = await agent.getAllData(
      location as string,
      crop as string,
      parseFloat(lat as string),
      parseFloat(lon as string)
    );
    
    logger.info('Letta data request completed', { location, crop });
    
    // Prepare response data
    const responseData = {
      success: true,
      location: { lat: parseFloat(lat as string), lon: parseFloat(lon as string), place: location },
      crop,
      timestamp: new Date().toISOString(),
      data
    };
    
    // Save data to file
    try {
      const savedFilePath = await saveDataToFile(responseData, lat as string, lon as string);
      logger.info('Data saved to file', 'letta-data', { filePath: savedFilePath });
    } catch (saveError) {
      // Log error but don't fail the request
      logger.error('Failed to save data to file', 'letta-data', {
        error: saveError instanceof Error ? saveError.message : String(saveError)
      });
    }
    
    // Return aggregated results
    res.json(responseData);
  } catch (error) {
    logger.error('Error in letta-data endpoint', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to retrieve letta data' });
  }
});

// Global error handler (must be last)
app.use(errorHandler);

// Initialize store and start server
async function startServer() {
  try {
    // Wait for profile to load before starting server
    await initializeStore();
    logger.info('Store initialized, starting server...', 'startServer');

// Start server
app.listen(PORT, () => {
  logger.info('Server started', 'app.listen', {
    port: PORT,
    corsOrigin: CORS_ORIGIN,
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});
  } catch (error) {
    logger.error('Failed to start server', 'startServer', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    process.exit(1);
  }
}

// Start the server
startServer();