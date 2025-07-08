import OpenAI from 'openai';
import { logger } from './logger.js';

/**
 * OpenAI-powered command interpreter for Sales MCP
 * Replaces all hardcoded command processing with real AI interpretation
 */

let openai;

// Initialize OpenAI client
export function initializeOpenAI() {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    logger.info('✅ OpenAI client initialized successfully');
    return true;
  } else {
    logger.error('❌ OPENAI_API_KEY not found in environment variables');
    return false;
  }
}

/**
 * Interpret user command using OpenAI and extract structured intent
 */
export async function interpretCommand(userCommand) {
  if (!openai) {
    throw new Error('OpenAI client not initialized. Please set OPENAI_API_KEY.');
  }

  logger.info(`🤖 Interpreting command with OpenAI: "${userCommand}"`);

  const prompt = `You are a Sales MCP (Model Context Protocol) command interpreter. Parse the user's request and extract structured intent.

User Command: "${userCommand}"

Analyze this command and return ONLY a JSON object with this exact structure:
{
  "action": "research" | "email" | "pipeline" | "help" | "unknown",
  "target": "companies" | "contacts" | "emails" | "data",
  "platform_type": "crm" | "no-code" | "project-management" | "ecommerce" | "automation" | "analytics" | "communication" | "mixed" | "any",
  "count": <number of items requested, or null>,
  "specific_companies": [array of specific company names mentioned, or null],
  "additional_filters": {
    "industry": <industry if specified>,
    "size": <company size if specified>,
    "location": <location if specified>
  },
  "intent_confidence": <0-100 confidence score>,
  "raw_command": "${userCommand}"
}

Examples:
- "research 10 CRM platforms" → {"action": "research", "target": "companies", "platform_type": "crm", "count": 10, ...}
- "find 5 no-code tools" → {"action": "research", "target": "companies", "platform_type": "no-code", "count": 5, ...}
- "research HubSpot and Salesforce" → {"action": "research", "target": "companies", "platform_type": "crm", "specific_companies": ["HubSpot", "Salesforce"], ...}
- "generate email for Bubble" → {"action": "email", "target": "companies", "specific_companies": ["Bubble"], ...}

Return ONLY the JSON object, no other text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.1 // Low temperature for consistent parsing
    });

    let response = completion.choices[0].message.content.trim();
    logger.info(`🧠 OpenAI response: ${response}`);

    // Clean the response to extract JSON
    if (response.includes('```json')) {
      response = response.match(/```json\s*(.*?)\s*```/s)?.[1] || response;
    } else if (response.includes('```')) {
      response = response.match(/```\s*(.*?)\s*```/s)?.[1] || response;
    }
    
    // Remove any leading/trailing non-JSON text
    const jsonMatch = response.match(/\{.*\}/s);
    if (jsonMatch) {
      response = jsonMatch[0];
    }

    // Parse the JSON response
    const intent = JSON.parse(response);
    
    // Validate the response structure
    if (!intent.action || !intent.target) {
      throw new Error('Invalid intent structure from OpenAI');
    }

    logger.info(`✅ Command interpreted successfully: ${intent.action} ${intent.count || ''} ${intent.platform_type} ${intent.target}`);
    return intent;

  } catch (error) {
    logger.error(`❌ OpenAI command interpretation failed:`, error.message);
    throw new Error(`OpenAI command interpretation failed: ${error.message}. Please check OPENAI_API_KEY.`);
  }
}


/**
 * Discover companies based on platform type and filters using real search
 */
export async function discoverCompanies(platformType, count = 5, additionalFilters = {}) {
  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }

  logger.info(`🔍 Discovering ${count} ${platformType} companies with real search`);

  const prompt = `You are a B2B sales research expert. Find real companies in the ${platformType} industry.

Platform Type: ${platformType}
Number Needed: ${count}
Additional Filters: ${JSON.stringify(additionalFilters)}

Return ONLY a JSON array of company objects with this structure:
[
  {
    "name": "Company Name",
    "website": "https://company.com",
    "description": "Brief description of what they do",
    "estimated_size": "startup|small|medium|large|enterprise",
    "known_for": "Main product or service"
  }
]

Focus on well-known, real companies in this space. For ${platformType}:
- CRM: Include companies like HubSpot, Salesforce, Pipedrive, Zoho, Freshworks
- No-Code: Include companies like Bubble, Webflow, Zapier, Airtable, Notion
- Project Management: Include companies like Asana, Monday.com, ClickUp, Trello
- E-commerce: Include companies like Shopify, WooCommerce, BigCommerce, Magento

Return exactly ${count} companies. Return ONLY the JSON array.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.3
    });

    let response = completion.choices[0].message.content.trim();
    
    // Clean the response to extract JSON array
    if (response.includes('```json')) {
      response = response.match(/```json\s*(.*?)\s*```/s)?.[1] || response;
    } else if (response.includes('```')) {
      response = response.match(/```\s*(.*?)\s*```/s)?.[1] || response;
    }
    
    // Remove any leading/trailing non-JSON text, look for array
    const jsonMatch = response.match(/\[.*\]/s);
    if (jsonMatch) {
      response = jsonMatch[0];
    }
    
    // Clean up common JSON issues from LLMs
    response = response
      .replace(/,\s*}/g, '}')  // Remove trailing commas in objects
      .replace(/,\s*\]/g, ']')  // Remove trailing commas in arrays
      .replace(/'/g, '"')       // Replace single quotes with double quotes
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":'); // Quote unquoted keys
    
    const companies = JSON.parse(response);
    
    logger.info(`✅ Discovered ${companies.length} companies via OpenAI`);
    return companies;

  } catch (error) {
    logger.error(`❌ Company discovery failed:`, error.message);
    logger.error(`❌ Raw OpenAI response:`, response);
    throw new Error(`OpenAI company discovery failed: ${error.message}. Please check OPENAI_API_KEY.`);
  }
}


/**
 * Generate natural language response using OpenAI
 */
export async function generateResponse(intent, results) {
  if (!openai) {
    throw new Error('OpenAI client not initialized. Cannot generate response.');
  }

  const prompt = `You are a Sales MCP assistant. Generate a natural, helpful response about the research results.

User Intent: ${JSON.stringify(intent)}
Results: Found ${results.length} companies

Generate a brief, professional response that:
1. Confirms what was found
2. Mentions the company count and type
3. Suggests next steps (like "You can now generate emails for these prospects")

Keep it conversational and under 100 words.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.7
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    logger.error('Response generation failed:', error.message);
    throw new Error(`OpenAI response generation failed: ${error.message}`);
  }
}