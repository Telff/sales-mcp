// Server configuration for Sales MCP

export default {
  // Server settings
  server: {
    name: 'sales-mcp',
    version: '1.0.0',
    port: process.env.PORT || 3000
  },

  // API timeouts
  timeouts: {
    research: parseInt(process.env.RESEARCH_TIMEOUT) || 10000,
    email: 15000,
    gmail: 20000
  },

  // Cache settings
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 1000 // Maximum number of cached items
  },

  // Rate limiting
  rateLimit: {
    delay: parseInt(process.env.RATE_LIMIT_DELAY) || 1000,
    maxRequests: 100,
    windowMs: 15 * 60 * 1000 // 15 minutes
  },

  // Email settings
  email: {
    defaultFromName: process.env.DEFAULT_FROM_NAME || 'Sales Team',
    defaultFromEmail: process.env.DEFAULT_FROM_EMAIL,
    maxRetries: 3,
    retryDelay: 5000
  },

  // Research settings
  research: {
    maxConcurrent: 5,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    followRedirects: true,
    maxRedirects: 5
  },

  // OpenAI settings
  openai: {
    model: 'gpt-4',
    maxTokens: 500,
    temperature: 0.7,
    maxRetries: 3
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    maxFiles: 5,
    maxSize: '5m'
  }
}; 