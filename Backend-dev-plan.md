# Backend Development Plan - Farm Easy Hackathon Edition

## Executive Summary

**What:** Minimal Express + TypeScript backend with in-memory storage for Farm Easy dashboard
**Why:** Rapid hackathon development - get frontend working with real endpoints in 30 minutes
**Constraints:**
- Express + TypeScript with ts-node-dev (no build step)
- Port 5000 with CORS for http://localhost:5173
- In-memory storage (JavaScript object) - no database
- Skip auth or use simple Bearer token
- Mock data first, swap integrations later

**Timeline:** 30-45 minutes to working backend with mock data

---

## In-Scope & Success Criteria

**In Scope:**
- GET /api/profile → returns Profile
- POST /api/profile → saves to memory
- GET /api/kpi → returns KpiData
- GET /api/suitability → returns Suitability[]
- GET /api/insights → returns Insight[]
- POST /api/chat → placeholder for Letta integration
- POST /api/voice → placeholder for VAPI/Deepgram/Fish Audio
- POST /api/setup → onboarding data submission

**Success Criteria:**
- Backend runs on port 5000 with CORS enabled
- All endpoints return mock data matching frontend types
- Frontend can fetch and display data from backend
- Placeholder endpoints ready for API key integration

---

## API Design

**Base Path:** `/api`

**Error Envelope:** `{ "error": "message" }`

### Core Endpoints

**GET /api/profile**
- Purpose: Return user farm profile
- Response: Profile object
- Mock: Return hardcoded profile with farm details

**POST /api/profile**
- Purpose: Update profile in memory
- Request: Partial<Profile>
- Response: Updated Profile
- Mock: Merge with in-memory profile

**GET /api/kpi**
- Purpose: Return dashboard KPI metrics
- Response: KpiData object
- Mock: Return weather, soil health, irrigation, suitability, revenue

**GET /api/suitability**
- Purpose: Return crop suitability scores
- Query: ?whatIfRainfall=number (optional)
- Response: Suitability[]
- Mock: Return 5 crops with scores

**GET /api/insights**
- Purpose: Return farm insights/alerts
- Response: Insight[]
- Mock: Return 4 insights with severity levels

**POST /api/setup**
- Purpose: Save onboarding data
- Request: OnboardingData (name, email, phone, lat, lon, county, crops, soil, irrigation, farmSize, language, interactionMode)
- Response: { success: true, profile: Profile }
- Mock: Store in memory, return success

### Integration Placeholders

**POST /api/chat**
- Purpose: Chat with Letta AI assistant
- Request: { message: string, conversationId?: string }
- Response: { reply: string, conversationId: string }
- Mock: Return canned responses
- TODO: Integrate Letta API when key available

**POST /api/voice**
- Purpose: Voice interaction endpoint
- Request: { audio?: string, text?: string, action: "transcribe" | "synthesize" }
- Response: { text?: string, audio?: string }
- Mock: Return placeholder responses
- TODO: Integrate VAPI/Deepgram/Fish Audio when keys available

**GET /api/farm-data**
- Purpose: Fetch external farm data
- Query: ?lat=number&lon=number
- Response: { data: any }
- Mock: Return placeholder farm data
- TODO: Integrate Bright Data when key available

---

## Data Model (In-Memory)

**Storage Structure:**
```typescript
const store = {
  profile: Profile | null,
  kpiData: KpiData,
  suitability: Suitability[],
  insights: Insight[],
  conversations: Map<string, Message[]>
}
```

**Profile:**
```json
{
  "name": "John Farmer",
  "email": "john@farm.com",
  "phone": "+1234567890",
  "location": { "lat": 40.7128, "lon": -74.006, "place": "Sample County" },
  "language": "en",
  "soil": "Loam",
  "irrigation": "Drip",
  "farmSize": { "value": 50, "unit": "ac" },
  "crops": ["Wheat", "Corn", "Soybeans"],
  "selectedCrop": "Wheat"
}
```

**KpiData:**
```json
{
  "weather": {
    "temp": 72,
    "condition": "Partly Cloudy",
    "humidity": 65,
    "windSpeed": 8,
    "icon": "partly-cloudy"
  },
  "soilHealth": 85,
  "irrigationEfficiency": 78,
  "cropSuitability": 92,
  "estimatedRevenue": 12500
}
```

**Suitability:**
```json
[
  {
    "crop": "Wheat",
    "score": 92,
    "subScores": { "soil": 95, "climate": 90, "water": 88, "market": 95 }
  }
]
```

**Insight:**
```json
{
  "id": "1",
  "severity": "critical",
  "text": "Heavy rainfall expected in 3 days",
  "action": { "label": "View Details", "href": "#" }
}
```

---

## Frontend Audit & Feature Map

**Dashboard Page** (`/dashboard`)
- Purpose: Main farm dashboard with KPIs and charts
- Data needed: Profile, KpiData, Suitability, Insights
- Endpoints: GET /api/profile, GET /api/kpi, GET /api/suitability, GET /api/insights
- Auth: Optional Bearer token check

**Onboarding Page** (`/onboarding`)
- Purpose: Multi-step farm setup wizard
- Data needed: None (submits data)
- Endpoints: POST /api/setup
- Auth: None

**Chat Interface** (AssistantDrawer component)
- Purpose: AI assistant chat
- Data needed: Conversation history
- Endpoints: POST /api/chat
- Auth: Optional Bearer token check

---

## Configuration & ENV Vars

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
AUTH_TOKEN=hackathon-token-2024
LETTA_API_KEY=your-key-here
VAPI_API_KEY=your-key-here
BRIGHT_DATA_API_KEY=your-key-here
```

---

## Background Work

Not required for MVP - all operations synchronous

---

## Integrations (Placeholder Strategy)

**Letta AI (Chat):**
- Trigger: POST /api/chat
- Mock: Return canned responses based on keywords
- Real: Call Letta API with conversation context
- Env: LETTA_API_KEY

**VAPI/Deepgram/Fish Audio (Voice):**
- Trigger: POST /api/voice
- Mock: Return placeholder audio/text
- Real: Transcribe audio or synthesize speech
- Env: VAPI_API_KEY

**Bright Data (Farm Data):**
- Trigger: GET /api/farm-data
- Mock: Return static farm data
- Real: Fetch real-time farm/weather data
- Env: BRIGHT_DATA_API_KEY

---

## Testing Strategy (Manual via Frontend)

**Every endpoint must be tested via frontend UI:**
- Start backend: `npm run dev`
- Start frontend: `npm run dev` (in frontend folder)
- Test each feature through browser

---

## S0 – Project Setup (5 minutes)

**Objectives:**
- Initialize Express + TypeScript project
- Configure ts-node-dev for hot reload
- Enable CORS for frontend
- Create basic server structure

**Tasks:**

1. Initialize project
   - Manual Test: Run `npm init -y` and verify package.json created
   - User Test: "Check that package.json exists in backend folder"

2. Install dependencies
   - Manual Test: Run install command and verify node_modules created
   - User Test: "Run `npm install express cors dotenv typescript ts-node-dev @types/node @types/express @types/cors`"

3. Create tsconfig.json
   - Manual Test: Verify TypeScript compiles without errors
   - User Test: "Check that tsconfig.json exists with proper settings"

4. Create src/index.ts with basic Express server
   - Manual Test: Start server and visit http://localhost:5000
   - User Test: "Start backend with `npm run dev` and confirm 'Server running on port 5000' message"

5. Add CORS middleware
   - Manual Test: Check browser console for CORS errors (should be none)
   - User Test: "Open frontend and check Network tab - no CORS errors"

**Definition of Done:**
- Server runs on port 5000
- CORS enabled for http://localhost:5173
- Hot reload working with ts-node-dev

---

## S1 – Type Definitions & Mock Data (5 minutes)

**Objectives:**
- Copy types from frontend
- Create mock data store
- Set up in-memory storage

**Tasks:**

1. Create src/types.ts with all frontend types
   - Manual Test: TypeScript compiles without type errors
   - User Test: "Verify types.ts contains Profile, KpiData, Suitability, Insight, etc."

2. Create src/mockData.ts with initial data
   - Manual Test: Import mockData in index.ts without errors
   - User Test: "Check mockData.ts exports profile, kpiData, suitability, insights"

3. Create src/store.ts for in-memory storage
   - Manual Test: Store initializes with mock data
   - User Test: "Verify store.ts exports getProfile, setProfile, etc."

**Definition of Done:**
- All types copied from frontend
- Mock data matches frontend expectations
- In-memory store ready for CRUD operations

---

## S2 – Core API Endpoints (10 minutes)

**Objectives:**
- Implement GET /api/profile
- Implement POST /api/profile
- Implement GET /api/kpi
- Implement GET /api/suitability
- Implement GET /api/insights

**Tasks:**

1. Create GET /api/profile endpoint
   - Manual Test: Open http://localhost:5000/api/profile in browser, see JSON
   - User Test: "Visit /api/profile and confirm profile data displays"

2. Create POST /api/profile endpoint
   - Manual Test: Use Postman/curl to POST data, verify response
   - User Test: "Update profile from frontend settings, check Network tab for 200 OK"

3. Create GET /api/kpi endpoint
   - Manual Test: Visit /api/kpi, see weather and metrics
   - User Test: "Dashboard KPI cards should load data from backend"

4. Create GET /api/suitability endpoint
   - Manual Test: Visit /api/suitability, see crop scores
   - User Test: "Dashboard suitability chart should display crop data"

5. Create GET /api/insights endpoint
   - Manual Test: Visit /api/insights, see alerts array
   - User Test: "Dashboard insights list should show alerts from backend"

**Definition of Done:**
- All 5 core endpoints working
- Frontend dashboard loads data from backend
- No CORS or network errors

---

## S3 – Onboarding & Setup (5 minutes)

**Objectives:**
- Implement POST /api/setup
- Save onboarding data to memory
- Return success response

**Tasks:**

1. Create POST /api/setup endpoint
   - Manual Test: POST onboarding data, verify 200 response
   - User Test: "Complete onboarding flow, check Network tab for successful POST"

2. Update store with onboarding data
   - Manual Test: After setup, GET /api/profile returns new data
   - User Test: "After onboarding, dashboard should show your farm name and location"

3. Add validation for required fields
   - Manual Test: POST incomplete data, verify error response
   - User Test: "Try submitting onboarding without crops - should show error"

**Definition of Done:**
- Onboarding flow saves data to backend
- Profile updates reflect in dashboard
- Basic validation prevents bad data

---

## S4 – Integration Placeholders (5 minutes)

**Objectives:**
- Create POST /api/chat with mock responses
- Create POST /api/voice with placeholders
- Create GET /api/farm-data with mock data
- Add TODO comments for real integrations

**Tasks:**

1. Create POST /api/chat endpoint
   - Manual Test: POST message, receive canned response
   - User Test: "Open chat drawer, send message, see mock reply"

2. Create POST /api/voice endpoint
   - Manual Test: POST request returns placeholder
   - User Test: "Voice endpoint returns 200 OK with mock data"

3. Create GET /api/farm-data endpoint
   - Manual Test: Visit /api/farm-data?lat=40&lon=-74, see mock data
   - User Test: "Endpoint returns farm data structure"

4. Add integration helper functions
   - Manual Test: Functions exist with TODO comments
   - User Test: "Check src/integrations.ts for Letta, VAPI, Bright Data stubs"

**Definition of Done:**
- All placeholder endpoints working
- Mock responses match expected structure
- Clear TODO comments for real API integration

---

## S5 – Optional Auth & Polish (5 minutes)

**Objectives:**
- Add simple Bearer token check (optional)
- Add error handling middleware
- Add request logging

**Tasks:**

1. Create optional auth middleware
   - Manual Test: Send request with/without token, verify behavior
   - User Test: "If AUTH_TOKEN set, protected endpoints require Bearer token"

2. Add global error handler
   - Manual Test: Trigger error, verify JSON error response
   - User Test: "Invalid requests return proper error JSON"

3. Add request logging
   - Manual Test: Make requests, see logs in terminal
   - User Test: "Terminal shows request method, path, and status code"

**Definition of Done:**
- Optional auth working if enabled
- Errors return consistent JSON format
- Request logging helps debugging

---

## Style & Compliance

- TypeScript strict mode enabled
- ESLint configured for Express
- Consistent error responses: `{ error: "message" }`
- All endpoints return JSON
- CORS properly configured
- Environment variables in .env file
- Hot reload with ts-node-dev

---

## Quick Start Commands

```bash
# Setup
npm init -y
npm install express cors dotenv typescript ts-node-dev @types/node @types/express @types/cors

# Add to package.json scripts
"dev": "ts-node-dev --respawn --transpile-only src/index.ts"
"build": "tsc"
"start": "node dist/index.js"

# Run
npm run dev
```

---

## Integration Swap Strategy

**Phase 1 (Now):** All endpoints use mock data
**Phase 2 (When keys ready):** Swap one integration at a time

**Example - Letta Integration:**
1. Get Letta API key
2. Update .env with LETTA_API_KEY
3. Modify src/integrations/letta.ts to call real API
4. Test chat endpoint with real responses
5. Keep mock as fallback if API fails

**Same pattern for VAPI, Bright Data, etc.**

---

## File Structure

```
backend/
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts          # Express app & routes
    ├── types.ts          # TypeScript interfaces
    ├── mockData.ts       # Mock data
    ├── store.ts          # In-memory storage
    ├── middleware/
    │   ├── auth.ts       # Optional Bearer token check
    │   └── errorHandler.ts
    └── integrations/
        ├── letta.ts      # Letta AI placeholder
        ├── voice.ts      # VAPI/Deepgram/Fish Audio
        └── brightData.ts # Bright Data placeholder
```

---

## Next Steps After Hackathon

1. Add MongoDB for persistent storage
2. Implement real authentication (JWT)
3. Integrate Letta AI with conversation memory
4. Add VAPI voice capabilities
5. Connect Bright Data for real farm data
6. Add rate limiting and security headers
7. Deploy to production (Render, Railway, etc.)