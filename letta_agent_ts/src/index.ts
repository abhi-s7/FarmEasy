import 'dotenv/config';

import { LettaAgent } from './agent';

const agent = new LettaAgent(
  process.env.BRIGHTDATA_API_KEY!,
  process.env.SERP_ZONE,
  process.env.UNLOCKER_ZONE
);

// Demo values; in production, get from form data
agent.getAllData("95926 California", "wheat", 37.8267, -122.4233).then(data => {
  console.log(JSON.stringify(data, null, 2));
}).catch(console.error);
