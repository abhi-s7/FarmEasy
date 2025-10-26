import { Request, Response } from 'express';
import axios from 'axios';
import { createLogger } from '../logger';
import { saveDataToFile } from '../services/storageService';

const logger = createLogger('brightData');

// Configuration
const CONFIG = {
  apiKey: process.env.BRIGHTDATA_API_KEY,
  serpZone: process.env.SERP_ZONE,
  unlockerZone: process.env.UNLOCKER_ZONE,
  endpoint: 'https://api.brightdata.com/request'
};

// Content limits
const CONTENT_LIMITS = {
  MAX_RESULTS: 3,
  MAX_DOMAINS_PER_SOURCE: 2,
};

interface SearchResult {
  title?: string;
  link?: string;
  url?: string;
  href?: string;
  snippet?: string;
}

interface SearchResponse {
  organic?: SearchResult[];
}

interface ScrapedContent {
  url: string;
  domain: string;
  content: string;
}

/**
 * Select diverse URLs from search results
 * Strategy: Limit pages per domain to ensure variety of sources
 */
function selectDiverseUrls(searchData: SearchResponse, maxResults: number): { urls: string[]; domainCount: number } {
  const urls: string[] = [];
  const perDomain: Record<string, number> = {};

  if (searchData.organic && Array.isArray(searchData.organic)) {
    for (const result of searchData.organic) {
      const link = result.link || result.url || result.href;
      if (link && urls.length < maxResults) {
        try {
          const domain = new URL(link).hostname.replace('www.', '');

          // Limit pages per domain for diversity
          if ((perDomain[domain] || 0) < CONTENT_LIMITS.MAX_DOMAINS_PER_SOURCE) {
            urls.push(link);
            perDomain[domain] = (perDomain[domain] || 0) + 1;
          }
        } catch {
          // Skip invalid URLs
        }
      }
    }
  }

  return { urls, domainCount: Object.keys(perDomain).length };
}

/**
 * Perform a search using Bright Data SERP API
 */
async function performSearch(query: string): Promise<SearchResponse> {
  logger.info('Performing search', 'performSearch', { query });
  
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&brd_json=1`;
  
  const response = await axios.post(CONFIG.endpoint, {
    zone: CONFIG.serpZone,
    url: searchUrl,
    format: 'raw'
  }, {
    headers: {
      'Authorization': `Bearer ${CONFIG.apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}

/**
 * Scrape content from a URL using Bright Data Unlocker
 */
async function scrapeUrl(url: string): Promise<string> {
  logger.info('Scraping URL', 'scrapeUrl', { url });
  
  const response = await axios.post(CONFIG.endpoint, {
    zone: CONFIG.unlockerZone,
    url,
    format: 'raw',
    data_format: 'html'
  }, {
    headers: {
      'Authorization': `Bearer ${CONFIG.apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}

/**
 * Main controller for Bright Data API integration
 * Replicates the functionality of main_workflow.js
 */
export const getBrightData = async (req: Request, res: Response): Promise<void> => {
  logger.info('Bright Data endpoint called', 'getBrightData');
  
  try {
    const { lat, lon } = req.query;
    
    // Validate required parameters
    if (!lat || !lon) {
      logger.warn('Bright Data request missing coordinates', 'getBrightData');
      res.status(400).json({ error: 'Latitude and longitude are required' });
      return;
    }

    // Validate environment variables
    if (!CONFIG.apiKey || !CONFIG.serpZone || !CONFIG.unlockerZone) {
      logger.error('Missing required environment variables', 'getBrightData');
      res.status(500).json({
        error: 'Server configuration error: Missing Bright Data credentials'
      });
      return;
    }
    
    logger.info('Processing Bright Data request', 'getBrightData', { lat, lon });
    
    const startTime = Date.now();
    
    // Step 1: Construct search queries based on location
    const queries = [
      `rainfall data ${lat} ${lon}`,
      `profitable crops ${lat} ${lon}`,
      `soil properties ${lat} ${lon}`
    ];
    
    const results: Record<string, any> = {};
    
    // Step 2: Process each query
    for (const query of queries) {
      try {
        logger.info('Processing query', 'getBrightData', { query });
        
        // Perform search
        const searchData = await performSearch(query);
        
        // Select diverse URLs
        const { urls, domainCount } = selectDiverseUrls(searchData, CONTENT_LIMITS.MAX_RESULTS);
        logger.info('Selected URLs', 'getBrightData', {
          count: urls.length,
          domains: domainCount
        });
        
        if (urls.length === 0) {
          logger.warn('No URLs found for query', 'getBrightData', { query });
          continue;
        }
        
        // Step 3: Scrape selected URLs
        const scrapedContent: ScrapedContent[] = [];
        
        for (const url of urls) {
          try {
            const domain = new URL(url).hostname.replace('www.', '');
            const content = await scrapeUrl(url);
            
            scrapedContent.push({
              url,
              domain,
              content: typeof content === 'string' ? content : JSON.stringify(content)
            });
            
            logger.info('Successfully scraped URL', 'getBrightData', { url, domain });
          } catch (error) {
            logger.warn('Failed to scrape URL', 'getBrightData', {
              url,
              error: error instanceof Error ? error.message : String(error)
            });
          }
        }
        
        // Store results for this query
        const queryType = query.split(' ')[0]; // 'rainfall', 'profitable', or 'soil'
        results[queryType] = {
          query,
          sourcesAnalyzed: scrapedContent.length,
          sources: scrapedContent.map(s => ({
            url: s.url,
            domain: s.domain,
            contentLength: s.content.length
          })),
          // Include raw content for further processing
          rawContent: scrapedContent
        };
        
      } catch (error) {
        logger.error('Error processing query', 'getBrightData', {
          query,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    const executionTime = Math.round((Date.now() - startTime) / 1000);
    
    logger.info('Bright Data request completed', 'getBrightData', {
      executionTime,
      queriesProcessed: Object.keys(results).length
    });
    
    // Prepare response data
    const responseData = {
      success: true,
      location: { lat, lon },
      executionTime,
      timestamp: new Date().toISOString(),
      results
    };
    
    // Save data to file
    try {
      const savedFilePath = await saveDataToFile(responseData, lat as string, lon as string);
      logger.info('Data saved to file', 'getBrightData', { filePath: savedFilePath });
    } catch (saveError) {
      // Log error but don't fail the request
      logger.error('Failed to save data to file', 'getBrightData', {
        error: saveError instanceof Error ? saveError.message : String(saveError)
      });
    }
    
    // Return the aggregated results
    res.json(responseData);
    
  } catch (error) {
    logger.error('Error in Bright Data endpoint', 'getBrightData', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({
      error: 'Failed to process Bright Data request',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};