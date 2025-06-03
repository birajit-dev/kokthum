const axios = require('axios');
const xml2js = require('xml2js');
const moment = require('moment');
const Queue = require('bull');
const cron = require('node-cron');
const crypto = require('crypto');
const Redis = require('redis');

// Redis configuration and client setup
const redisConfig = {
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => Math.min(times * 100, 3000)
};

// Create Redis client - using v5.x syntax
const redisClient = Redis.createClient(redisConfig);

// Add Redis connection event handlers
redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis connected successfully');
});

redisClient.on('reconnecting', () => {
  console.log('Redis reconnecting...');
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
})();

// Redis commands in v5.x are already Promise-based
const setAsync = async (key, value, ...args) => await redisClient.set(key, value, ...args);
const getAsync = async (key) => await redisClient.get(key);
const saddAsync = async (key, member) => await redisClient.sAdd(key, member);
const sismemberAsync = async (key, member) => await redisClient.sIsMember(key, member);
const hsetAsync = async (key, field, value) => await redisClient.hSet(key, field, value);
const hgetAsync = async (key, field) => await redisClient.hGet(key, field);
const expireAsync = async (key, seconds) => await redisClient.expire(key, seconds);
const incrAsync = async (key) => await redisClient.incr(key);

// Constants
const PROCESSED_LINKS_SET = 'rss:processed_links';
const SENT_LINKS_HASH = 'rss:sent_links';
const LINK_METADATA = 'rss:link_metadata';
const CATEGORY_STATS = 'rss:category_stats';
const FEED_STATUS = 'rss:feed_status';
const MAX_CONCURRENT_JOBS = 1; // Process one job at a time to avoid rate limiting
const JOB_DELAY_MS = 30000; // 30 seconds delay between processing each link
const MAX_FEED_PROCESSING_TIME = 30000; // 30 seconds per feed

// Queue setup
const rssQueue = new Queue('rss-processing', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 20,
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    delay: JOB_DELAY_MS, // Add 30-second delay between jobs
  }
});

// RSS Feed Configuration - Simplified
const RSS_FEEDS = {
  business: {
    url: 'http://localhost:8080/uploads/documents/test.xml',
    category: 'business',
    displayName: 'HT Business News',
    enabled: true
  },
  national: {
    url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
    category: 'india',
    displayName: 'HT India News',
    enabled: true
  },
  international: {
    url: 'https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml',
    category: 'world',
    displayName: 'HT World News',
    enabled: true
  },
  entertainment: {
    url: 'https://www.hindustantimes.com/feeds/rss/entertainment/rssfeed.xml',
    category: 'entertainment',
    displayName: 'HT Entertainment News',
    enabled: true
  },
  sports: {
    url: 'https://www.hindustantimes.com/feeds/rss/sports/rssfeed.xml',
    category: 'sports',
    displayName: 'HT Sports News',
    enabled: true
  }
};

// Utility function to generate unique hash for links
const generateLinkHash = (link) => {
  return crypto.createHash('md5').update(link.trim().toLowerCase()).digest('hex');
};

// LinkTracker - Enhanced with retry mechanism
class LinkTracker {
  static async isLinkProcessed(link) {
    try {
      return await sismemberAsync(PROCESSED_LINKS_SET, link);
    } catch (error) {
      console.error('Error checking if link is processed:', error);
      return false;
    }
  }

  static async markLinkProcessed(link, metadata = {}) {
    try {
      await saddAsync(PROCESSED_LINKS_SET, link);
      await hsetAsync(SENT_LINKS_HASH, link, new Date().toISOString());
      
      // Remove from failed links if it was previously failed
      await redisClient.del(`rss:failed:${link}`);
      
      if (metadata) {
        await setAsync(
          `${LINK_METADATA}:${link}`,
          JSON.stringify({
            ...metadata,
            processedAt: new Date().toISOString()
          }),
          'EX',
          7 * 24 * 60 * 60
        );
      }

      if (metadata.category) {
        await incrAsync(`${CATEGORY_STATS}:${metadata.category}`);
      }
      
      console.log(`✅ Link processed: [${metadata.category?.toUpperCase()}] ${metadata.title || link}`);
    } catch (error) {
      console.error('Error marking link as processed:', error);
    }
  }

  static async markLinkFailed(link, error, metadata = {}) {
    try {
      // Get current retry count if exists
      const existingData = await getAsync(`rss:failed:${link}`);
      let retryCount = 0;
      
      if (existingData) {
        try {
          const parsed = JSON.parse(existingData);
          retryCount = (parsed.retryCount || 0) + 1;
        } catch (parseError) {
          console.error('Error parsing existing failed link data:', parseError);
        }
      }
      
      const errorData = {
        link,
        error: error.message,
        timestamp: new Date().toISOString(),
        metadata,
        retryCount,
        lastError: error.stack
      };
      
      // Store with expiration - keep failed links for 24 hours
      await setAsync(`rss:failed:${link}`, JSON.stringify(errorData), 'EX', 60 * 60 * 24);
      
      console.log(`⚠️ Link marked as failed (retry ${retryCount}): ${link}`);
    } catch (err) {
      console.error('Error marking link as failed:', err);
    }
  }
  
  static async getFailedLinks() {
    try {
      // Get all keys matching the pattern
      const keys = await redisClient.keys('rss:failed:*');
      
      if (!keys || keys.length === 0) {
        return [];
      }
      
      // Get all failed link data
      const failedLinks = [];
      for (const key of keys) {
        const data = await getAsync(key);
        if (data) {
          try {
            failedLinks.push(JSON.parse(data));
          } catch (parseError) {
            console.error(`Error parsing failed link data for ${key}:`, parseError);
          }
        }
      }
      
      return failedLinks;
    } catch (error) {
      console.error('Error getting failed links:', error);
      return [];
    }
  }
  
  static async retryFailedLinks(maxRetries = 3) {
    try {
      const failedLinks = await this.getFailedLinks();
      console.log(`Found ${failedLinks.length} failed links to retry`);
      
      if (failedLinks.length === 0) {
        return { retried: 0, success: 0, failed: 0 };
      }
      
      let retried = 0;
      let success = 0;
      let failed = 0;
      
      for (const failedLink of failedLinks) {
        // Skip if exceeded max retries
        if (failedLink.retryCount >= maxRetries) {
          console.log(`⚠️ Skipping ${failedLink.link} - exceeded max retries (${maxRetries})`);
          continue;
        }
        
        try {
          console.log(`🔄 Retrying failed link: ${failedLink.link}`);
          retried++;
          
          // Use the sendLinkToAPI function to retry processing
          const result = await exports.sendLinkToAPI(failedLink.link, failedLink.metadata || {});
          
          if (result.success) {
            success++;
            console.log(`✅ Successfully retried: ${failedLink.link}`);
            // Mark as processed to prevent further retries
            await this.markLinkProcessed(failedLink.link, failedLink.metadata || {});
          } else {
            failed++;
            console.error(`❌ Retry failed for: ${failedLink.link}`);
            // The markLinkFailed will be called by sendLinkToAPI on failure
          }
        } catch (error) {
          failed++;
          console.error(`❌ Error retrying link ${failedLink.link}:`, error.message);
        }
      }
      
      return { retried, success, failed };
    } catch (error) {
      console.error('Error retrying failed links:', error);
      return { retried: 0, success: 0, failed: 0, error: error.message };
    }
  }
  
  static async getStats() {
    try {
      const processedCount = await redisClient.sCard(PROCESSED_LINKS_SET);
      const totalSentLinks = await redisClient.hLen(SENT_LINKS_HASH);
      
      return {
        totalProcessed: processedCount,
        totalSent: totalSentLinks,
        successRate: totalSentLinks > 0 ? ((processedCount / totalSentLinks) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error getting link stats:', error);
      return { totalProcessed: 0, totalSent: 0, successRate: 0 };
    }
  }
}

// Simplified Feed Manager
class FeedManager {
  static async updateFeedStatus(feedKey, status, details = {}) {
    try {
      const feedStatus = {
        feedKey,
        status,
        lastUpdated: new Date().toISOString(),
        ...details
      };
      
      await setAsync(`${FEED_STATUS}:${feedKey}`, JSON.stringify(feedStatus), 'EX', 60 * 60 * 60);
    } catch (error) {
      console.error(`Error updating feed status for ${feedKey}:`, error);
    }
  }

  static getEnabledFeeds() {
    return Object.entries(RSS_FEEDS).filter(([key, config]) => config.enabled);
  }
}

// Process single RSS feed - Optimized
exports.processSingleRSSFeed = async (feedKey, feedConfig) => {
  const startTime = Date.now();
  let newLinksFound = 0;
  let duplicatesSkipped = 0;

  try {
    console.log(`🔄 Processing ${feedConfig.displayName}...`);
    
    await FeedManager.updateFeedStatus(feedKey, 'processing');

    const response = await axios.get(feedConfig.url, {
      timeout: MAX_FEED_PROCESSING_TIME,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8'
      }
    });

    // Create a parser with options
    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: true,
      trim: true
    });
    
    // Use the correct parsing method with a promise
    const result = await new Promise((resolve, reject) => {
      parser.parseString(response.data, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    if (!result?.rss?.channel?.item) {
      throw new Error('Invalid RSS feed structure');
    }

    const today = moment().format('DD MMM YYYY');
    const items = Array.isArray(result.rss.channel.item) 
      ? result.rss.channel.item 
      : [result.rss.channel.item];

    console.log(`📰 Found ${items.length} items in ${feedConfig.displayName}`);

    for (const item of items) {
      try {
        if (!item?.pubDate || !item?.link) continue;

        const pubDate = moment(item.pubDate, 'ddd, DD MMM YYYY HH:mm:ss ZZ');
        const todayDate = moment();
        
        // Process items from the last 7 days instead of just today
        if (pubDate.isValid() && todayDate.diff(pubDate, 'days') <= 7) {
          // Extract link - handle CDATA and nested structures
          let link = '';
          if (typeof item.link === 'string') {
            link = item.link.trim();
          } else if (item.link && item.link._) {
            link = item.link._.trim();
          } else if (item.link && item.link.length > 0) {
            link = item.link[0].trim();
          }
          
          // Extract title - handle CDATA and nested structures
          let title = '';
          if (typeof item.title === 'string') {
            title = item.title.trim();
          } else if (item.title && item.title._) {
            title = item.title._.trim();
          } else if (item.title && item.title.length > 0) {
            title = item.title[0].trim();
          }
          
          if (!(await LinkTracker.isLinkProcessed(link))) {
            try {
              console.log(`💬 Adding job to queue for: ${link}`);
              
              // Add job to queue with explicit options (no delay, as we handle rate limiting in the processor)
              const job = await rssQueue.add('process-link', { 
                link, 
                title,
                category: feedConfig.category,
                feedKey,
                displayName: feedConfig.displayName
              }, {
                attempts: 3,
                backoff: { type: 'exponential', delay: 5000 },
                removeOnComplete: true,
                removeOnFail: false
                // No delay here - we handle rate limiting in the processor
              });
              
              console.log(`💬 Job added with ID: ${job.id}, will be processed with 30-second rate limiting`);
              
              // No longer processing jobs immediately - letting the queue handle the rate limiting
              // This prevents 429 errors from the Groq API
              
              newLinksFound++;
              console.log(`✅ Queued and processed: [${feedConfig.category.toUpperCase()}] ${title?.substring(0, 60)}...`);
            } catch (queueError) {
              console.error(`❌ Error adding job to queue:`, queueError.message);
              throw queueError;
            }
          } else {
            duplicatesSkipped++;
          }
        }
      } catch (itemError) {
        console.error(`Error processing item in ${feedKey}:`, itemError.message);
      }
    }

    const processingTime = Date.now() - startTime;
    
    await FeedManager.updateFeedStatus(feedKey, 'completed', {
      newLinksFound,
      duplicatesSkipped,
      processingTime
    });

    console.log(`✅ ${feedConfig.displayName} completed: New: ${newLinksFound}, Duplicates: ${duplicatesSkipped}, Time: ${processingTime}ms`);
    
    return { feedKey, success: true, newLinksFound, duplicatesSkipped, processingTime };

  } catch (error) {
    console.error(`❌ Error processing ${feedConfig.displayName}:`, error.message);
    
    await FeedManager.updateFeedStatus(feedKey, 'failed', {
      error: error.message,
      processingTime: Date.now() - startTime
    });

    return { feedKey, success: false, error: error.message };
  }
};

// Process all RSS feeds - Simplified
exports.processAllRSSFeeds = async (req, res) => {
  try {
    console.log('🔄 Processing all RSS feeds...');
    
    const startTime = Date.now();
    const results = [];
    const errors = [];
    
    // Get all enabled feeds
    const enabledFeeds = FeedManager.getEnabledFeeds();
    
    if (enabledFeeds.length === 0) {
      console.log('⚠️ No enabled feeds found');
      
      if (res) {
        return res.json({
          success: false,
          message: 'No enabled feeds found',
          timestamp: new Date().toISOString()
        });
      }
      
      return { success: false, message: 'No enabled feeds found' };
    }
    
    console.log(`💬 Processing ${enabledFeeds.length} feeds...`);
    
    // Process each feed
    for (const [feedKey, feedConfig] of enabledFeeds) {
      try {
        const result = await exports.processSingleRSSFeed(feedKey, feedConfig);
        results.push(result);
      } catch (feedError) {
        console.error(`❌ Error processing feed ${feedKey}:`, feedError);
        errors.push({ feedKey, error: feedError.message });
      }
    }
    
    const processingTime = Date.now() - startTime;
    
    const response = {
      success: true,
      totalFeeds: enabledFeeds.length,
      processedFeeds: results.length,
      failedFeeds: errors.length,
      processingTime,
      results,
      errors,
      timestamp: new Date().toISOString()
    };
    
    if (res) {
      return res.json(response);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error processing all feeds:', error);
    
    if (res) {
      return res.status(500).json({ 
        success: false, 
        message: `Error processing all feeds: ${error.message}` 
      });
    }
    
    return { success: false, message: `Error processing all feeds: ${error.message}` };
  }
};

// Schedule automatic retry of failed links
exports.scheduleRetryFailedLinks = () => {
  // Clear any existing interval
  if (global.retryFailedLinksInterval) {
    clearInterval(global.retryFailedLinksInterval);
    console.log('🗓 Cleared existing retry schedule');
  }
  
  // Set up a new interval - retry failed links every hour
  const retryInterval = 60 * 60 * 1000; // 1 hour in milliseconds
  
  console.log(`🗓 Setting up scheduled job to retry failed links every ${retryInterval/60000} minutes`);
  
  global.retryFailedLinksInterval = setInterval(async () => {
    try {
      console.log('🗓 Running scheduled retry of failed links...');
      const result = await LinkTracker.retryFailedLinks(3); // Max 3 retries
      console.log(`🗓 Scheduled retry completed: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error('❌ Error in scheduled retry of failed links:', error);
    }
  }, retryInterval);
  
  // Also run it once immediately
  setTimeout(async () => {
    try {
      console.log('🗓 Running initial retry of failed links...');
      const result = await LinkTracker.retryFailedLinks(3);
      console.log(`🗓 Initial retry completed: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error('❌ Error in initial retry of failed links:', error);
    }
  }, 10000); // Run 10 seconds after startup
  
  return true;
};

// Process individual RSS link - Optimized
exports.processRSSLink = async (job) => {
  const { link, title, category, feedKey, displayName } = job.data;
  
  try {
    console.log(`🔄 Processing: [${category?.toUpperCase()}] ${title?.substring(0, 50)}...`);
    
    if (await LinkTracker.isLinkProcessed(link)) {
      console.log(`⚠ Already processed: ${link}`);
      return { skipped: true, link };
    }

    const apiResult = await exports.sendLinkToAPI(link, { title, category, feedKey, displayName });
    
    await LinkTracker.markLinkProcessed(link, { title, category, feedKey, displayName });

    console.log(`✅ Successfully processed: [${category?.toUpperCase()}] ${title}`);
    return { success: true, link, title, category };

  } catch (error) {
    console.error(`❌ Error processing link: ${error.message}`);
    
    await LinkTracker.markLinkFailed(link, error, { title, category, feedKey, displayName });
    
    throw error;
  }
};

// Send link to external API - Simplified
exports.sendLinkToAPI = async (link, metadata = {}) => {
  try {
    console.log(`📤 Sending to API: [${metadata.category?.toUpperCase()}] ${link}`);
    
    // Validate the URL before proceeding
    if (!link || !link.startsWith('http')) {
      console.error(`❌ Invalid URL format: ${link}`);
      return {
        status: 400,
        success: false,
        link,
        metadata,
        error: 'Invalid URL format'
      };
    }
    
    // First check if the URL is accessible
    try {
      console.log(`🔍 Checking if URL is accessible: ${link}`);
      const testResponse = await axios.head(link, { timeout: 5000 });
      console.log(`✅ URL is accessible: ${link}, status: ${testResponse.status}`);
    } catch (urlError) {
      console.error(`❌ URL is not accessible: ${link}`, urlError.message);
      return {
        status: 404,
        success: false,
        link,
        metadata,
        error: `URL is not accessible: ${urlError.message}`
      };
    }
    
    // Import adminController dynamically to avoid circular dependencies
    const adminController = require('./admincontroller');
    
    let responseData = null;
    let responseStatus = 200;
    
    // Create a more complete mock request object
    const mockReq = {
      body: {
        url: link,
        hcategory: metadata.category || 'business',
        title: metadata.title || ''
      },
      // Add these properties that might be expected by the function
      params: {},
      query: {},
      headers: {
        'user-agent': 'RSS-Processor/1.0'
      }
    };
    
    // Create a more complete mock response object with additional logging
    const mockRes = {
      status: (code) => {
        console.log(`📊 Response status code set to: ${code}`);
        responseStatus = code;
        return {
          json: (data) => {
            console.log(`💾 Response data received:`, typeof data, data ? Object.keys(data) : 'null');
            responseData = data;
            if (data) {
              console.log(`📄 Response details:`, JSON.stringify(data).substring(0, 150) + '...');
            }
            return data;
          }
        };
      },
      // Add these methods that might be expected
      send: (data) => {
        console.log(`📨 Response send called with:`, typeof data);
        responseData = data;
        return mockRes;
      },
      setHeader: () => mockRes,
      end: () => {}
    };
    
    // Call the AutoMaticNewsHindustanTimes function directly with better error handling
    console.log(`🔄 Calling AutoMaticNewsHindustanTimes for URL: ${link}`);
    await adminController.AutoMaticNewsHindustanTimes(mockReq, mockRes);
    
    // Check if we got a valid response
    if (responseStatus >= 400) {
      console.warn(`⚠️ Received error status ${responseStatus} for ${link}`);
      return {
        status: responseStatus,
        success: false,
        link,
        metadata,
        error: responseData?.error || 'Unknown error occurred'
      };
    }
    
    console.log(`✅ API Success: [${metadata.category?.toUpperCase()}] ${link} - Status: ${responseStatus}`);
    if (responseData && responseData.data) {
      console.log(`📰 Article saved: ${responseData.data.post_name || 'unnamed'}`);
    } else {
      console.log(`⚠️ No article data returned for ${link}`);
    }
    
    return {
      status: responseStatus,
      success: responseData?.success || true,
      link,
      metadata,
      data: responseData?.data
    };

  } catch (error) {
    // Handle errors from direct function call
    const errorMsg = error.message || 'Unknown error occurred';
    
    console.error(`❌ Error processing article from ${link}:`, errorMsg);
    
    // Log stack trace for debugging
    console.error(error.stack);
    
    throw new Error(`Article processing error: ${errorMsg}`);
  }
};

// Track the last time a link was processed to enforce rate limiting
let lastProcessedTime = 0;

// Setup RSS processing queue - Simplified
exports.setupRSSQueue = async () => {
  try {
    // Clear any existing processors to avoid duplicates
    await rssQueue.empty();
    
    // Clear any existing processors
    console.log('Clearing any existing queue processors...');
    
    // Register processor for the queue - using the correct syntax for Bull v3.x
    // Note: In Bull v3.x, process() doesn't return a Promise we can await
    console.log('Setting up new queue processor...');
    rssQueue.process('process-link', 1, async (job) => { // Force concurrency to 1
      try {
        const now = Date.now();
        const timeSinceLastProcess = now - lastProcessedTime;
        
        // If less than JOB_DELAY_MS (30 seconds) has passed since the last job, wait
        if (lastProcessedTime > 0 && timeSinceLastProcess < JOB_DELAY_MS) {
          const waitTime = JOB_DELAY_MS - timeSinceLastProcess;
          console.log(`⏳ Rate limiting: Waiting ${waitTime}ms before processing next job ${job.id}...`);
          
          // Wait for the remaining time to complete the 30-second interval
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        console.log(`🔄 Processing job ${job.id} from queue...`);
        console.log('Job data:', JSON.stringify(job.data));
        
        // Update the last processed time before processing the job
        lastProcessedTime = Date.now();
        
        const result = await exports.processRSSLink(job);
        console.log(`Job ${job.id} processing completed with result:`, JSON.stringify(result));
        
        return result;
      } catch (error) {
        console.error(`❌ Error in job processor: ${error.message}`);
        console.error(error.stack);
        throw error;
      }
    });
    
    // Manually process any waiting jobs to ensure they start running
    setTimeout(async () => {
      try {
        const counts = await rssQueue.getJobCounts();
        console.log(`Queue status after setup: ${JSON.stringify(counts)}`);
        if (counts.waiting > 0) {
          console.log(`Found ${counts.waiting} waiting jobs, attempting to process...`);
        }
      } catch (error) {
        console.error('Error checking queue status:', error.message);
      }
    }, 1000);

    // Set up event listeners
    rssQueue.on('completed', (job, result) => {
      if (result && !result.skipped) {
        console.log(`✅ Job ${job.id} completed successfully`);
      }
    });

    rssQueue.on('failed', (job, error) => {
      console.error(`❌ Job ${job.id} failed: ${error.message}`);
    });
    
    // Add more event listeners for debugging
    rssQueue.on('active', (job) => {
      console.log(`⚡ Job ${job.id} has started processing`);
    });
    
    rssQueue.on('stalled', (job) => {
      console.warn(`⚠️ Job ${job.id} has stalled`);
    });

    console.log(`🚀 RSS queue setup with ${MAX_CONCURRENT_JOBS} concurrent jobs`);
    return rssQueue;
  } catch (error) {
    console.error('Error setting up RSS queue:', error.message);
    throw error;
  }
};

// Schedule RSS processing - Simplified
exports.scheduleRSSProcessing = () => {
  // Run every 2 hours instead of every hour to reduce load
  const scheduledTask = cron.schedule('0 */2 * * *', async () => {
    console.log('🕒 Running scheduled RSS processing');
    try {
      await exports.processAllRSSFeeds();
    } catch (error) {
      console.error('❌ Scheduled RSS processing failed:', error);
    }
  });

  console.log('⏰ RSS processing scheduled (every 2 hours)');
  return scheduledTask;
};

// Initialize the RSS processing system - Simplified
exports.initRSSSystem = async () => {
  try {
    console.log('🚀 Initializing RSS processing system...');
    
    // Connect to Redis if not already connected
    if (!redisClient.isOpen) {
      await redisClient.connect();
      
      redisClient.on('error', (error) => {
        console.error('❌ Redis error:', error);
      });
    } else {
      console.log('✅ Redis already connected');
    }
    
    // Setup the RSS queue
    await exports.setupRSSQueue();
    
    // Schedule automatic retry of failed links
    exports.scheduleRetryFailedLinks();
    console.log('✅ Scheduled automatic retry of failed links');
    
    // Get system stats
    const linkStats = await LinkTracker.getStats();
    const queueCounts = await rssQueue.getJobCounts();
    
    console.log('✅ RSS processing system initialized successfully');
    
    return {
      links: linkStats,
      queue: {
        waiting: queueCounts.waiting || 0,
        active: queueCounts.active || 0,
        completed: queueCounts.completed || 0,
        failed: queueCounts.failed || 0
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error initializing RSS system:', error);
    return null;
  }
};

// Health check - Simplified
exports.healthCheck = async () => {
  try {
    // Check Redis health
    await setAsync('health:check', 'ok', 'EX', 10);
    const redisHealth = await getAsync('health:check') === 'ok';
    
    // Check Bull queue health - using isReady() instead of checking client.status
    let queueHealth = false;
    try {
      // Get queue counts as a way to check if queue is working
      const counts = await rssQueue.getJobCounts();
      queueHealth = true;
    } catch (queueError) {
      console.error('Queue health check failed:', queueError.message);
      queueHealth = false;
    }
    
    return {
      status: redisHealth && queueHealth ? 'healthy' : 'degraded',
      redis: redisHealth,
      queue: queueHealth,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Graceful shutdown of RSS processing system
exports.shutdownRSSSystem = async () => {
  try {
    console.log('🔄 Shutting down RSS processing system...');
    await rssQueue.close();
    await redisClient.quit();
    console.log('✅ RSS processing system shut down gracefully');
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
  }
};

// Process a specific feed by key
exports.processFeedByKey = async (req, res) => {
  const { feedKey } = req.params;
  
  try {
    // Validate feed key
    if (!feedKey || !RSS_FEEDS[feedKey]) {
      return res.status(404).json({ success: false, message: `Feed '${feedKey}' not found` });
    }
    
    // Get feed config
    const feedConfig = RSS_FEEDS[feedKey];
    if (!feedConfig.enabled) {
      return res.status(400).json({ success: false, message: `Feed '${feedKey}' is disabled` });
    }
    
    const requestedAt = new Date().toISOString();
    
    // Process the feed
    const result = await exports.processSingleRSSFeed(feedKey, feedConfig);
    
    return res.json({ ...result, requestedAt, manual: true });
  } catch (error) {
    console.error(`Error processing feed ${feedKey}:`, error);
    return res.status(500).json({ 
      success: false, 
      message: `Error processing feed: ${error.message}`,
      feedKey
    });
  }
};

// Endpoint to retry failed links
exports.retryFailedLinks = async (req, res) => {
  try {
    const maxRetries = req.query.maxRetries ? parseInt(req.query.maxRetries, 10) : 3;
    
    console.log(`🔄 Manually retrying failed links with max retries: ${maxRetries}`);
    
    // Get the current time for performance tracking
    const startTime = Date.now();
    
    // Retry failed links
    const result = await LinkTracker.retryFailedLinks(maxRetries);
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    return res.json({
      success: true,
      ...result,
      processingTime,
      requestedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error retrying failed links:', error);
    return res.status(500).json({
      success: false,
      message: `Error retrying failed links: ${error.message}`
    });
  }
};

// Endpoint to get failed links
exports.getFailedLinks = async (req, res) => {
try {
const failedLinks = await LinkTracker.getFailedLinks();
res.status(200).json({
success: true,
data: failedLinks
});
} catch (error) {
console.error('Error getting failed links:', error);
res.status(500).json({
success: false,
error: error.message
});
}
};

// Endpoint to get RSS statistics
exports.getRSSStats = async (req, res) => {
try {
// Get link statistics
const linkStats = await LinkTracker.getStats();
  
// Get queue statistics
const queueStats = await rssQueue.getJobCounts();
  
res.status(200).json({
success: true,
data: {
links: {
totalProcessed: linkStats.totalProcessed,
totalSent: linkStats.totalSent,
successRate: linkStats.successRate + '%'
},
queue: queueStats,
lastUpdated: new Date().toISOString()
}
});
} catch (error) {
console.error('Error getting RSS stats:', error);
res.status(500).json({
success: false,
error: error.message
});
}
};

// Function to get system stats (alias for getRSSStats functionality)
exports.getSystemStats = async () => {
try {
// Get link statistics
const linkStats = await LinkTracker.getStats();
  
// Get queue statistics
const queueStats = await rssQueue.getJobCounts();
  
return {
links: {
totalProcessed: linkStats.totalProcessed,
totalSent: linkStats.totalSent,
successRate: linkStats.successRate + '%'
},
queue: queueStats,
lastUpdated: new Date().toISOString()
};
} catch (error) {
console.error('Error getting system stats:', error);
throw error;
}
};

// Reset the RSS system by clearing all Redis data
exports.resetRSSSystem = async (req, res) => {
  try {
    console.log('🔄 Resetting RSS system...');
    
    // Clear all Redis keys related to RSS processing
    await redisClient.del(PROCESSED_LINKS_SET);
    await redisClient.del(SENT_LINKS_HASH);
    await redisClient.del(LINK_METADATA);
    await redisClient.del(CATEGORY_STATS);
    
    // Clear any keys that match the pattern 'rss:*'
    const rssKeys = await redisClient.keys('rss:*');
    if (rssKeys && rssKeys.length > 0) {
      console.log(`Found ${rssKeys.length} RSS-related keys to delete`);
      for (const key of rssKeys) {
        await redisClient.del(key);
      }
    }
    
    // Clear the queue
    await rssQueue.empty();
    await rssQueue.clean(0, 'completed');
    await rssQueue.clean(0, 'failed');
    await rssQueue.clean(0, 'delayed');
    await rssQueue.clean(0, 'wait');
    await rssQueue.clean(0, 'active');
    
    console.log('✅ RSS system reset complete');
    
    res.status(200).json({
      success: true,
      message: 'RSS system has been reset. All processed links data has been cleared.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error resetting RSS system:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = exports;