import fs from 'fs/promises';
import path from 'path';
import { createLogger } from '../logger';

const logger = createLogger('storageService');

// Directory where data files will be stored
const DATA_DIR = path.join(__dirname, '../../data');

/**
 * Ensure the data directory exists
 */
async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
    logger.info('Data directory exists', 'ensureDataDirectory', { path: DATA_DIR });
  } catch {
    logger.info('Creating data directory', 'ensureDataDirectory', { path: DATA_DIR });
    await fs.mkdir(DATA_DIR, { recursive: true });
    logger.info('Data directory created successfully', 'ensureDataDirectory');
  }
}

/**
 * Generate a unique filename based on location and timestamp
 * Format: lat_lon_timestamp.json
 * Example: 37.7749_-122.4194_1698765432123.json
 */
function generateFilename(lat: string | number, lon: string | number): string {
  const timestamp = Date.now();
  const sanitizedLat = String(lat).replace(/[^0-9.-]/g, '');
  const sanitizedLon = String(lon).replace(/[^0-9.-]/g, '');
  return `${sanitizedLat}_${sanitizedLon}_${timestamp}.json`;
}

/**
 * Save JSON data to a file in the data directory
 * @param data - The JSON data to save
 * @param lat - Latitude coordinate
 * @param lon - Longitude coordinate
 * @returns The path to the saved file
 */
export async function saveDataToFile(
  data: any,
  lat: string | number,
  lon: string | number
): Promise<string> {
  try {
    // Ensure data directory exists
    await ensureDataDirectory();

    // Generate unique filename
    const filename = generateFilename(lat, lon);
    const filePath = path.join(DATA_DIR, filename);

    // Convert data to formatted JSON string
    const jsonContent = JSON.stringify(data, null, 2);

    // Write to file
    await fs.writeFile(filePath, jsonContent, 'utf-8');

    logger.info('Data saved successfully', 'saveDataToFile', {
      filename,
      path: filePath,
      size: jsonContent.length
    });

    return filePath;
  } catch (error) {
    logger.error('Failed to save data to file', 'saveDataToFile', {
      lat,
      lon,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(`Failed to save data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Read data from a file in the data directory
 * @param filename - The name of the file to read
 * @returns The parsed JSON data
 */
export async function readDataFromFile(filename: string): Promise<any> {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    logger.info('Data read successfully', 'readDataFromFile', {
      filename,
      path: filePath
    });

    return data;
  } catch (error) {
    logger.error('Failed to read data from file', 'readDataFromFile', {
      filename,
      error: error instanceof Error ? error.message : String(error)
    });
    throw new Error(`Failed to read data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * List all data files in the data directory
 * @returns Array of filenames
 */
export async function listDataFiles(): Promise<string[]> {
  try {
    await ensureDataDirectory();
    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    logger.info('Listed data files', 'listDataFiles', {
      count: jsonFiles.length
    });

    return jsonFiles;
  } catch (error) {
    logger.error('Failed to list data files', 'listDataFiles', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw new Error(`Failed to list data files: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Delete a data file from the data directory
 * @param filename - The name of the file to delete
 */
export async function deleteDataFile(filename: string): Promise<void> {
  try {
    const filePath = path.join(DATA_DIR, filename);
    await fs.unlink(filePath);

    logger.info('Data file deleted successfully', 'deleteDataFile', {
      filename,
      path: filePath
    });
  } catch (error) {
    logger.error('Failed to delete data file', 'deleteDataFile', {
      filename,
      error: error instanceof Error ? error.message : String(error)
    });
    throw new Error(`Failed to delete data file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get the latest data file for given coordinates
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns The parsed JSON data from the latest file, or null if not found
 */
export async function getLatestDataForLocation(lat: number, lon: number): Promise<any | null> {
  try {
    const files = await listDataFiles();
    
    // Filter files matching this location (with some tolerance for floating point comparison)
    const locationFiles = files.filter(file => {
      const parts = file.split('_');
      if (parts.length < 2) return false;
      
      const fileLat = parseFloat(parts[0]);
      const fileLon = parseFloat(parts[1]);
      
      // Match with small tolerance (0.0001 degrees ~ 11 meters)
      return Math.abs(fileLat - lat) < 0.0001 && Math.abs(fileLon - lon) < 0.0001;
    });
    
    if (locationFiles.length === 0) {
      logger.info('No data files found for location', 'getLatestDataForLocation', { lat, lon });
      return null;
    }
    
    // Sort by timestamp (most recent first)
    locationFiles.sort((a, b) => {
      const timestampA = parseInt(a.split('_')[2]?.replace('.json', '') || '0');
      const timestampB = parseInt(b.split('_')[2]?.replace('.json', '') || '0');
      return timestampB - timestampA;
    });
    
    // Read the most recent file
    const latestFile = locationFiles[0];
    const data = await readDataFromFile(latestFile);
    
    logger.info('Latest data retrieved for location', 'getLatestDataForLocation', {
      lat,
      lon,
      filename: latestFile
    });
    
    return data;
  } catch (error) {
    logger.error('Failed to get latest data for location', 'getLatestDataForLocation', {
      lat,
      lon,
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}