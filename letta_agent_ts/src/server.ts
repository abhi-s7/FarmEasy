import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { LettaAgent } from './agent';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize the Letta agent
let agent: LettaAgent;

async function initializeAgent() {
  agent = new LettaAgent(
    process.env.BRIGHTDATA_API_KEY!,
    process.env.LETTA_API_KEY!,
    process.env.SERP_ZONE,
    process.env.UNLOCKER_ZONE
  );

  await agent.initializeAgent();
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId = "default_user" } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    console.log(`Processing chat request for user: ${userId}`);
    const response = await agent.chat(message);
    console.log(`Chat response generated: ${response.substring(0, 100)}...`);
    res.json({ response });

  } catch (error: any) {
    console.error('Chat endpoint error:', error.message);
    res.status(500).json({
      error: 'Failed to get AI response',
      details: error.message
    });
  }
});

// Audio transcription endpoint (placeholder for speech-to-text)
app.post('/api/audio/transcribe', async (req, res) => {
  try {
    const { audioData } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

   
    const transcription = "This is a placeholder transcription. Audio processing would be implemented here.";

    res.json({ transcription });

  } catch (error) {
    console.error('Audio transcription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Text-to-speech endpoint (placeholder)
app.post('/api/audio/synthesize', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' });
    }

    // Placeholder for text-to-speech integration
    // In production, you would use a service like Google Text-to-Speech, AWS Polly, etc.
    const audioData = "placeholder_audio_data_base64";

    res.json({ audioData });

  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize and start server
initializeAgent().then(() => {
  console.log('Letta agent initialized successfully');
  app.listen(port, () => {
    console.log(`Letta Agent server running on port ${port}`);
  });
}).catch((error) => {
  console.error('Failed to initialize Letta agent, continuing with mock responses:', error);
  // Start server even if Letta initialization fails
  agent = new LettaAgent(
    process.env.BRIGHTDATA_API_KEY || '',
    process.env.LETTA_API_KEY || '',
    process.env.SERP_ZONE || '',
    process.env.UNLOCKER_ZONE || ''
  );
  app.listen(port, () => {
    console.log(`Letta Agent server running on port ${port} (with mock responses)`);
  });
});

export { app };
