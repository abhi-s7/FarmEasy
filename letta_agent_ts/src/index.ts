import 'dotenv/config';

import { LettaAgent } from './agent';

async function main() {
const agent = new LettaAgent(
  process.env.BRIGHTDATA_API_KEY!,
  process.env.LETTA_API_KEY!,
  process.env.SERP_ZONE,
  process.env.UNLOCKER_ZONE
);

  // Initialize the agent
  await agent.initializeAgent();

  // Test chat functionality
  console.log("Testing chat with: 'How is my crop yield doing?'");
  const response = await agent.chat("How is my crop yield doing?");
  console.log("Agent response:", response);

  // Demo values for data fetching (existing functionality)
  const data = await agent.getAllData("95926 California", "wheat", 37.8267, -122.4233);
  console.log("Farm data:", JSON.stringify(data, null, 2));

  // Cleanup when done
  await agent.cleanup();
}

main().catch(console.error);
