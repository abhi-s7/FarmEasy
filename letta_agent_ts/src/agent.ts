import { spawn } from 'child_process';

export class LettaAgent {
  private readonly agentId: string = 'agent-1974a387-c19b-4a29-a196-03cc73b149d3';
  private readonly baseUrl = 'https://api.letta.com/v1';

  constructor(
    private brightDataApiKey: string,
    private lettaApiKey: string,
    private serpZone?: string,
    private unlockerZone?: string
  ) {}

  async initializeAgent(userId: string = "default_user"): Promise<void> {
    try {
      console.log(`Using existing Letta agent: ${this.agentId} with Claude 3.5 Haiku`);
      console.log(`API Key present: ${this.lettaApiKey ? 'Yes' : 'No'}`);
      console.log(`Base URL: ${this.baseUrl}`);

      // Verify the agent exists and is accessible with increased timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${this.baseUrl}/agents/${this.agentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.lettaApiKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`Verification response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Verification failed: ${response.status} - ${errorText}`);
        throw new Error(`Agent verification failed with HTTP ${response.status}: ${errorText}`);
      }

      const agentData = await response.json();
      console.log(`Agent verified successfully: ${agentData.name || 'Farm Assistant'}`);

    } catch (error: any) {
      const errorMessage = error.name === 'AbortError' ? 'Request timed out' : error.message;
      console.error('Error verifying Letta agent:', errorMessage);
      throw new Error(`Failed to verify Letta agent: ${errorMessage}`);
    }
  }

  async chat(message: string): Promise<string> {
    try {
      console.log(`Sending message to Letta agent: ${message.substring(0, 50)}...`);

      // Add timeout for chat requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

      const response = await fetch(`${this.baseUrl}/agents/${this.agentId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.lettaApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: message
            }
          ],
          stream: false,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`API Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2));

      // Extract assistant message from Letta's response format
      if (data.messages && data.messages.length > 1) {
        // Find the assistant message (usually the last one)
        const assistantMessage = data.messages.find((msg: any) => msg.message_type === 'assistant_message');
        if (assistantMessage && assistantMessage.content) {
          return assistantMessage.content;
        }
      }

      // Fallback to looking for any response field
      return data.response || data.content || "I apologize, but I couldn't generate a response at this time.";

    } catch (error: any) {
      const errorMessage = error.name === 'AbortError' ? 'Request timed out after 45 seconds' : error.message;
      console.error('Error chatting with Letta agent:', errorMessage);
      throw new Error(`Failed to get response: ${errorMessage}`);
    }
  }

  async cleanup(): Promise<void> {
    if (this.agentId) {
      try {
        const response = await fetch(`${this.baseUrl}/agents/${this.agentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.lettaApiKey}`
          }
        });

        if (response.ok) {
          console.log(`Successfully deleted Letta agent: ${this.agentId}`);
        } else {
          console.error(`Failed to delete agent: HTTP ${response.status}`);
        }
      } catch (error: any) {
        console.error('Error cleaning up Letta agent:', error);
      }
    }
  }

  private async fetchBrightData(url: string, zone: string, format: string = 'raw'): Promise<string> {
    if (!zone) return 'Mock response'; // If no zone, return mock
    const endpoint = 'https://api.brightdata.com/request';
    const response = await globalThis.fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.brightDataApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        zone,
        url,
        format
      })
    });
    return response.text();
  }

  private async runBrightWorkflow(query: string): Promise<any> {
    if (!this.serpZone || !this.unlockerZone) {
      // If no zones, return placeholder
      return {
        result: "No Bright Data zones configured, using placeholder data."
      };
    }
    return new Promise((resolve, reject) => {
      // Assume bright-data dir is adjacent
      const child = spawn('npm', ['start', query], { cwd: '../bright-data', shell: true });
      let stdout = '';
      child.stdout.on('data', (data) => stdout += data.toString());
      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Process exited with code ${code}`));
        } else {
          // Extract JSON from the output
          const lines = stdout.split('\n');
      const jsonStart = lines.findIndex((line: string) => line.includes('{'));
      let jsonEnd = -1;
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes('}')) {
          jsonEnd = i;
          break;
        }
      }
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = lines.slice(jsonStart, jsonEnd + 1).join('\n');
        try {
          resolve(JSON.parse(jsonStr));
        } catch (e) {
          resolve({ error: 'Failed to parse JSON', raw: jsonStr });
        }
      } else {
        resolve({ error: 'No JSON found in output', raw: stdout });
      }
        }
      });
      child.on('error', reject);
    });
  }

  async fetchSoilData(location: string): Promise<any> {
    const query = `soil properties ${location} USDA`;
    return await this.runBrightWorkflow(query);
  }

  async fetchRainfallData(location: string): Promise<any> {
    const query = `rainfall ${location} annual rainfall inches USDA`;
    return await this.runBrightWorkflow(query);
  }

  async fetchCropData(location: string, crop: string): Promise<any> {
    const query = `crops ${location} USDA`;
    const result = await this.runBrightWorkflow(query);
    return {
      ...result,
      location: location,
      top_crops: [
        ...(result.top_crops || []),
        // Add the queried crop if not already
        { crop: crop, annual_profitability: "Approximate", yield_estimate: "Varies" }
      ]
    };
  }

  async fetchWeather(lat: number, lon: number): Promise<any> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m`;
    const response = await fetch(url);
    const data = await response.json();
    const temp = data.current.temperature_2m;
    const condition = this.mapWeatherCode(data.current.weather_code);
    const humidity = data.current.relative_humidity_2m;
    const windSpeed = data.current.wind_speed_10m;
    const icon = "partly-cloudy"; // Fixed for simplicity
    return {
      temp,
      condition,
      humidity,
      windSpeed,
      icon
    };
  }

  private mapWeatherCode(code: number): string {
    const map: { [key: number]: string } = {
      0: "Clear",
      1: "Mainly Clear",
      2: "Partly Cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Rime Fog",
      61: "Light Rain",
      63: "Rain",
      65: "Heavy Rain",
      80: "Light Showers",
      81: "Showers",
      82: "Heavy Showers"
    };
    return map[code] || "Partly Cloudy";
  }

  async getAllData(location: string, crop: string, lat: number, lon: number): Promise<any> {
    const [soilData, rainfallData, cropData, weather] = await Promise.all([
      this.fetchSoilData(location),
      this.fetchRainfallData(location),
      this.fetchCropData(location, crop),
      this.fetchWeather(lat, lon)
    ]);
    return {
      soilData,
      rainfallData,
      cropData,
      weather
    };
  }
}
