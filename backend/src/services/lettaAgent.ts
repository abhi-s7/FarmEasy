import { spawn } from 'child_process';
import path from 'path';

/**
 * Letta Agent for fetching agricultural data
 * Orchestrates data collection from Bright Data workflows and Open-Meteo API
 */
export class LettaAgent {
  constructor(private brightDataApiKey: string, private serpZone?: string, private unlockerZone?: string) {}

  /**
   * Run a Bright Data workflow by spawning the bright-data npm script
   */
  private async runBrightWorkflow(query: string): Promise<any> {
    if (!this.serpZone || !this.unlockerZone) {
      // If no zones configured, return placeholder
      return { result: "No Bright Data zones configured, using placeholder data." };
    }
    
    return new Promise((resolve, reject) => {
      // Path to bright-data directory relative to backend
      const brightDataPath = path.join(__dirname, '../../../bright-data');
      
      // Spawn npm process to run bright-data workflow
      const child = spawn('npm', ['start', query], { cwd: brightDataPath, shell: true });
      let stdout = '';
      
      // Collect stdout data
      child.stdout.on('data', (data) => stdout += data.toString());
      
      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Process exited with code ${code}`));
        } else {
          // Extract JSON from the output
          // Workflow may output logs before JSON, so we need to find the JSON portion
          const lines = stdout.split('\n');
          const jsonStart = lines.findIndex((line: string) => line.includes('{'));
          let jsonEnd = -1;
          
          // Find the last closing brace
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

  /**
   * Fetch soil properties data for a given location
   */
  async fetchSoilData(location: string): Promise<any> {
    const query = `soil properties ${location} USDA`;
    return await this.runBrightWorkflow(query);
  }

  /**
   * Fetch rainfall data for a given location
   */
  async fetchRainfallData(location: string): Promise<any> {
    const query = `rainfall ${location} annual rainfall inches USDA`;
    return await this.runBrightWorkflow(query);
  }

  /**
   * Fetch crop profitability and yield data for a given location
   */
  async fetchCropData(location: string, crop: string): Promise<any> {
    const query = `crops ${location} USDA`;
    const result = await this.runBrightWorkflow(query);
    
    // Ensure queried crop is included in results
    return {
      ...result,
      location: location,
      top_crops: [
        ...(result.top_crops || []),
        { crop: crop, annual_profitability: "Approximate", yield_estimate: "Varies" }
      ]
    };
  }

  /**
   * Fetch real-time weather data from Open-Meteo API
   */
  async fetchWeather(lat: number, lon: number): Promise<any> {
    // Construct API URL with required weather parameters
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m`;
    
    const response = await fetch(url);
    const data: any = await response.json();
    
    // Extract current weather conditions
    const temp = data.current.temperature_2m;
    const condition = this.mapWeatherCode(data.current.weather_code);
    const humidity = data.current.relative_humidity_2m;
    const windSpeed = data.current.wind_speed_10m;
    const icon = "partly-cloudy";
    
    return {
      temp,
      condition,
      humidity,
      windSpeed,
      icon
    };
  }

  /**
   * Map Open-Meteo weather codes to human-readable conditions
   */
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

  /**
   * Fetch all agricultural data in parallel
   * Coordinates data collection from all sources for optimal performance
   */
  async getAllData(location: string, crop: string, lat: number, lon: number): Promise<any> {
    // Fetch all data sources in parallel for better performance
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
