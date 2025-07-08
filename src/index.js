import dotenv from 'dotenv';
dotenv.config();

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { google } from 'googleapis';
import { mcpLogger, performanceLogger } from './utils/logger.js';
import {
  TARGET_PLATFORMS,
  COMPANY_SIZE_CRITERIA,
  QUALIFICATION_SCORING,
  QUALIFICATION_TIERS,
  EMAIL_TEMPLATES,
  RESEARCH_SOURCES
} from './config/targets.js';
import { researchCompany, batchResearch } from './tools/research.js';
import { generatePersonalizedEmail, generateBatchEmails } from './tools/email.js';

// Initialize OpenAI client
import OpenAI from 'openai';
let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} else {
  console.warn('⚠️  OpenAI API key not found. Email generation will not work.');
}

// Initialize Gmail API
let gmail;
if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob'
  );
  
  oAuth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
  });
  
  gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
} else {
  console.warn('⚠️  Gmail OAuth2 credentials not found. Email sending will not work.');
}

// Prospect research cache
const prospectCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Sales MCP Server
const server = new Server(
  {
    name: 'sales-mcp',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const extractCompanyInfo = async (companyName) => {
  const timer = performanceLogger.startTimer('company_research');
  
  try {
    // Check cache first
    const cacheKey = companyName.toLowerCase();
    const cached = prospectCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      mcpLogger.info('Using cached company data', { company: companyName });
      return cached.data;
    }

    mcpLogger.info('Researching company', { company: companyName });
    
    const companyData = {
      name: companyName,
      platformType: 'unknown',
      revenue: null,
      employees: null,
      funding: null,
      website: null,
      description: null,
      techStack: [],
      growthIndicators: [],
      contactInfo: {}
    };

    // Research from multiple sources
    const researchTasks = [
      researchCrunchbase(companyName),
      researchLinkedIn(companyName),
      researchWebsite(companyName),
      researchTechStack(companyName)
    ];

    const results = await Promise.allSettled(researchTasks);
    
    // Merge results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        Object.assign(companyData, result.value);
      }
    });

    // Determine platform type
    companyData.platformType = determinePlatformType(companyData);
    
    // Calculate qualification score
    const scoreData = calculateQualificationScore(companyData);
    companyData.qualificationScore = scoreData.score;
    companyData.qualificationTier = scoreData.tier;
    companyData.scoreBreakdown = scoreData.breakdown;

    // Cache the result
    prospectCache.set(cacheKey, {
      data: companyData,
      timestamp: Date.now()
    });

    timer.end();
    mcpLogger.prospectResearch(companyName, companyData);
    
    return companyData;
    
  } catch (error) {
    mcpLogger.error('Company research failed', error, { company: companyName });
    throw error;
  }
};

const researchCrunchbase = async (companyName) => {
  try {
    const url = `${RESEARCH_SOURCES.free.crunchbase}${encodeURIComponent(companyName)}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    return {
      funding: extractFundingInfo($),
      employees: extractEmployeeInfo($),
      description: $('.description').text().trim()
    };
  } catch (error) {
    mcpLogger.warning('Crunchbase research failed', { company: companyName, error: error.message });
    return null;
  }
};

const researchLinkedIn = async (companyName) => {
  try {
    const url = `${RESEARCH_SOURCES.free.linkedin}${encodeURIComponent(companyName)}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    return {
      employees: extractLinkedInEmployeeInfo($),
      industry: $('.org-top-card-summary-info-list__info-item').text().trim()
    };
  } catch (error) {
    mcpLogger.warning('LinkedIn research failed', { company: companyName, error: error.message });
    return null;
  }
};

const researchWebsite = async (companyName) => {
  try {
    // Try to find company website
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(companyName + ' official website')}`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const websiteUrl = $('a[href^="http"]').first().attr('href');
    
    if (websiteUrl) {
      const websiteResponse = await axios.get(websiteUrl, { timeout: 10000 });
      const website$ = cheerio.load(websiteResponse.data);
      
      return {
        website: websiteUrl,
        description: extractWebsiteDescription(website$),
        techStack: extractTechStack(website$)
      };
    }
  } catch (error) {
    mcpLogger.warning('Website research failed', { company: companyName, error: error.message });
  }
  return null;
};

const researchTechStack = async (companyName) => {
  try {
    const url = `${RESEARCH_SOURCES.free.builtwith}${encodeURIComponent(companyName)}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    return {
      techStack: extractBuiltWithTechStack($)
    };
  } catch (error) {
    mcpLogger.warning('Tech stack research failed', { company: companyName, error: error.message });
    return null;
  }
};

const determinePlatformType = (companyData) => {
  const text = `${companyData.description || ''} ${companyData.website || ''}`.toLowerCase();
  
  for (const [platform, config] of Object.entries(TARGET_PLATFORMS)) {
    if (config.keywords.some(keyword => text.includes(keyword))) {
      return platform;
    }
  }
  
  return 'other';
};

const calculateQualificationScore = (companyData) => {
  let totalScore = 0;
  const breakdown = {};

  // Platform type scoring
  const platformScore = QUALIFICATION_SCORING.platform_type.weights[companyData.platformType] || 5;
  breakdown.platformType = platformScore;
  totalScore += platformScore;

  // Company size scoring
  let sizeScore = 0;
  if (companyData.revenue) {
    const revenue = companyData.revenue;
    if (revenue >= 10_000_000 && revenue <= 50_000_000) sizeScore = 25;
    else if (revenue >= 5_000_000 && revenue < 10_000_000) sizeScore = 20;
    else if (revenue >= 1_000_000 && revenue < 5_000_000) sizeScore = 15;
    else if (revenue >= 500_000 && revenue < 1_000_000) sizeScore = 10;
  }
  if (companyData.employees) {
    const employees = companyData.employees;
    if (employees >= 50 && employees <= 500) sizeScore = Math.max(sizeScore, 25);
    else if (employees >= 25 && employees < 50) sizeScore = Math.max(sizeScore, 20);
    else if (employees >= 10 && employees < 25) sizeScore = Math.max(sizeScore, 15);
    else if (employees > 500) sizeScore = Math.max(sizeScore, 15);
  }
  breakdown.companySize = sizeScore;
  totalScore += sizeScore;

  // Growth indicators
  let growthScore = 0;
  if (companyData.funding) growthScore += 20;
  if (companyData.growthIndicators.includes('hiring')) growthScore += 15;
  if (companyData.growthIndicators.includes('product_launches')) growthScore += 12;
  breakdown.growthIndicators = growthScore;
  totalScore += growthScore;

  // Technical fit
  let techScore = 0;
  if (companyData.techStack.includes('api')) techScore += 15;
  if (companyData.techStack.includes('integration')) techScore += 12;
  if (companyData.platformType !== 'other') techScore += 10;
  breakdown.technicalFit = techScore;
  totalScore += techScore;

  // Determine tier
  let tier = 'not_qualified';
  for (const [tierName, criteria] of Object.entries(QUALIFICATION_TIERS)) {
    if (totalScore >= criteria.min_score) {
      tier = tierName;
      break;
    }
  }

  return {
    score: totalScore,
    tier,
    breakdown
  };
};

const sendEmailViaGmail = async (to, subject, body, fromName = 'Sales Team') => {
  if (!gmail) {
    throw new Error('Gmail OAuth2 not configured. Please run npm run setup-gmail first.');
  }

  const timer = performanceLogger.startTimer('gmail_send');
  
  try {
    const message = [
      `From: ${fromName} <${process.env.BUSINESS_EMAIL || 'sales@company.com'}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      body
    ].join('\n');

    const encodedMessage = Buffer.from(message).toString('base64url');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    timer.end();
    mcpLogger.gmailOperation('send_email', {
      to,
      subject,
      messageId: response.data.id
    });

    return response.data;
    
  } catch (error) {
    mcpLogger.error('Gmail send failed', error, { to, subject });
    throw error;
  }
};

// Helper functions for data extraction
const extractFundingInfo = ($) => {
  // Implementation would parse Crunchbase funding data
  return null;
};

const extractEmployeeInfo = ($) => {
  // Implementation would parse Crunchbase employee data
  return null;
};

const extractLinkedInEmployeeInfo = ($) => {
  // Implementation would parse LinkedIn employee data
  return null;
};

const extractWebsiteDescription = ($) => {
  const metaDesc = $('meta[name="description"]').attr('content');
  const title = $('title').text();
  return metaDesc || title || '';
};

const extractTechStack = ($) => {
  // Implementation would extract tech stack from website
  return [];
};

const extractBuiltWithTechStack = ($) => {
  // Implementation would parse BuiltWith tech stack
  return [];
};

// MCP Tool Definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'research_prospect',
        description: 'Research and qualify a prospect company for sales outreach',
        inputSchema: {
          type: 'object',
          properties: {
            company_name: {
              type: 'string',
              description: 'Name of the company to research'
            }
          },
          required: ['company_name']
        }
      },
      {
        name: 'generate_email',
        description: 'Generate a personalized sales email for a prospect',
        inputSchema: {
          type: 'object',
          properties: {
            company_name: {
              type: 'string',
              description: 'Name of the prospect company'
            },
            recipient_name: {
              type: 'string',
              description: 'Name of the recipient'
            },
            recipient_title: {
              type: 'string',
              description: 'Job title of the recipient'
            }
          },
          required: ['company_name', 'recipient_name', 'recipient_title']
        }
      },
      {
        name: 'generate_email_from_research',
        description: 'Generate a personalized sales email using existing research data',
        inputSchema: {
          type: 'object',
          properties: {
            research_data: {
              type: 'object',
              description: 'Complete research data from research_prospect tool'
            },
            recipient_name: {
              type: 'string',
              description: 'Name of the recipient'
            },
            recipient_title: {
              type: 'string',
              description: 'Job title of the recipient'
            }
          },
          required: ['research_data', 'recipient_name', 'recipient_title']
        }
      },
      {
        name: 'send_email',
        description: 'Send a sales email via Gmail API',
        inputSchema: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'Recipient email address'
            },
            subject: {
              type: 'string',
              description: 'Email subject line'
            },
            body: {
              type: 'string',
              description: 'Email body content'
            },
            from_name: {
              type: 'string',
              description: 'Sender name (optional)'
            }
          },
          required: ['to', 'subject', 'body']
        }
      },
      {
        name: 'qualify_prospect',
        description: 'Score and qualify a prospect based on research data',
        inputSchema: {
          type: 'object',
          properties: {
            company_data: {
              type: 'object',
              description: 'Company research data to qualify'
            }
          },
          required: ['company_data']
        }
      },
      {
        name: 'batch_research',
        description: 'Research multiple companies in batch',
        inputSchema: {
          type: 'object',
          properties: {
            company_names: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of company names to research'
            }
          },
          required: ['company_names']
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  mcpLogger.toolCall(name, args);
  
  try {
    switch (name) {
      case 'research_prospect':
        const companyData = await researchCompany(args.company_name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(companyData, null, 2)
            }
          ]
        };

      case 'generate_email':
        const companyDataForEmail = await researchCompany(args.company_name);
        const emailContent = await generatePersonalizedEmail(
          companyDataForEmail,
          args.recipient_name,
          args.recipient_title
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(emailContent, null, 2)
            }
          ]
        };

      case 'generate_email_from_research':
        const emailFromResearch = await generatePersonalizedEmail(
          args.research_data,
          args.recipient_name,
          args.recipient_title
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(emailFromResearch, null, 2)
            }
          ]
        };

      case 'send_email':
        const result = await sendEmailViaGmail(
          args.to,
          args.subject,
          args.body,
          args.from_name
        );
        return {
          content: [
            {
              type: 'text',
              text: `Email sent successfully! Message ID: ${result.id}`
            }
          ]
        };

      case 'qualify_prospect':
        const scoreData = calculateQualificationScore(args.company_data);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(scoreData, null, 2)
            }
          ]
        };

      case 'batch_research':
        const results = await batchResearch(args.company_names);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2)
            }
          ]
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    mcpLogger.error(`Tool execution failed: ${name}`, error, args);
    throw error;
  }
});

// Start the server
const transport = new StdioServerTransport();
server.connect(transport);

mcpLogger.info('Sales MCP Server started', { version: '1.0.0' }); 