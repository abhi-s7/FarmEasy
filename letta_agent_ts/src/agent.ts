import { spawn } from 'child_process';

export class LettaAgent {
  constructor(private brightDataApiKey: string, private serpZone?: string, private unlockerZone?: string) {}

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
