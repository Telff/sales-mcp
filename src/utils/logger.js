import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for structured logging
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'sales-mcp' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'sales-mcp.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Separate error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

// Add request logging middleware for Express
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
};

// MCP-specific logging functions
const mcpLogger = {
  // Log MCP tool calls
  toolCall: (toolName, args, result) => {
    logger.info('MCP Tool Call', {
      tool: toolName,
      args: args,
      success: !!result,
      resultType: typeof result
    });
  },
  
  // Log prospect research
  prospectResearch: (companyName, data) => {
    logger.info('Prospect Research', {
      company: companyName,
      dataPoints: Object.keys(data).length,
      hasFunding: !!data.funding,
      hasEmployees: !!data.employees,
      platformType: data.platformType
    });
  },
  
  // Log email generation
  emailGeneration: (template, recipient, customization) => {
    logger.info('Email Generation', {
      template: template,
      recipient: recipient,
      customizations: Object.keys(customization).length
    });
  },
  
  // Log qualification scoring
  qualificationScore: (companyName, score, breakdown) => {
    logger.info('Qualification Score', {
      company: companyName,
      score: score,
      breakdown: breakdown
    });
  },
  
  // Log Gmail operations
  gmailOperation: (operation, details) => {
    logger.info('Gmail Operation', {
      operation: operation,
      ...details
    });
  },
  
  // Log errors with context
  error: (message, error, context = {}) => {
    logger.error(message, {
      error: error.message,
      stack: error.stack,
      ...context
    });
  },
  
  // Log warnings
  warning: (message, data = {}) => {
    logger.warn(message, data);
  },
  
  // Log info messages
  info: (message, data = {}) => {
    logger.info(message, data);
  },
  
  // Log debug messages
  debug: (message, data = {}) => {
    logger.debug(message, data);
  }
};

// Performance monitoring
const performanceLogger = {
  startTimer: (operation) => {
    return {
      operation,
      startTime: Date.now(),
      end: function() {
        const duration = Date.now() - this.startTime;
        logger.info('Performance', {
          operation: this.operation,
          duration: `${duration}ms`
        });
        return duration;
      }
    };
  }
};

export {
  logger,
  requestLogger,
  mcpLogger,
  performanceLogger
}; 