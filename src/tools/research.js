import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger.js';

/**
 * Company Research Tool for Sales MCP
 * Finds and analyzes target companies for strategic guidance API sales
 */

/**
 * Research a company and analyze fit for strategic guidance APIs
 * @param {string} companyName - Name of the company to research
 * @param {string} website - Optional website URL
 * @returns {Object} Complete company analysis with scoring
 */
export async function researchCompany(companyName, website = null) {
  try {
    logger.info(`🔍 Starting research for: ${companyName}`);
    
    // Step 1: Find company website if not provided
    const companyWebsite = website || await findCompanyWebsite(companyName);
    
    // Step 2: Analyze company website
    const websiteAnalysis = await analyzeCompanyWebsite(companyWebsite);
    
    // Step 3: Gather additional company intelligence
    const companyIntel = await gatherCompanyIntelligence(companyName);
    
    // Step 4: Extract contact information
    const contacts = await findKeyContacts(companyName, companyWebsite);
    
    // Step 5: Score the company fit
    const scoring = scoreCompanyFit(websiteAnalysis, companyIntel);
    
    // Step 6: Generate insights and recommendations
    const insights = generateCompanyInsights(websiteAnalysis, companyIntel, scoring);
    
    const result = {
      company: {
        name: companyName,
        website: companyWebsite,
        ...websiteAnalysis,
        ...companyIntel
      },
      contacts,
      scoring,
      insights,
      research_date: new Date().toISOString(),
      recommendation: scoring.total_score >= 80 ? 'HOT_PROSPECT' : 
                     scoring.total_score >= 60 ? 'WARM_PROSPECT' : 
                     scoring.total_score >= 40 ? 'COLD_PROSPECT' : 'NOT_QUALIFIED'
    };
    
    logger.info(`✅ Research complete for ${companyName}: ${result.recommendation} (${scoring.total_score} points)`);
    return result;
    
  } catch (error) {
    logger.error(`❌ Research failed for ${companyName}:`, error.message);
    throw error;
  }
}

/**
 * Find company website using search
 */
async function findCompanyWebsite(companyName) {
  try {
    // Try direct domain first for known companies
    const knownDomains = {
      'monday.com': 'https://monday.com',
      'airtable': 'https://airtable.com',
      'notion': 'https://notion.so',
      'zapier': 'https://zapier.com',
      'bubble': 'https://bubble.io',
      'webflow': 'https://webflow.com',
      'retool': 'https://retool.com',
      'hubspot': 'https://hubspot.com',
      'pipedrive': 'https://pipedrive.com',
      'salesforce': 'https://salesforce.com',
      'zoho crm': 'https://zoho.com/crm',
      'zoho': 'https://zoho.com/crm',
      'freshworks': 'https://freshworks.com',
      'insightly': 'https://insightly.com',
      'activecampaign': 'https://activecampaign.com',
      'copper': 'https://copper.com',
      'sugarcrm': 'https://sugarcrm.com',
      'zendesk sell': 'https://zendesk.com/sell',
      'asana': 'https://asana.com',
      'clickup': 'https://clickup.com',
      'shopify': 'https://shopify.com',
      'woocommerce': 'https://woocommerce.com'
    };
    
    const lowerName = companyName.toLowerCase();
    for (const [key, domain] of Object.entries(knownDomains)) {
      if (lowerName.includes(key)) {
        logger.info(`🌐 Found known website for ${companyName}: ${domain}`);
        return domain;
      }
    }
    
    // Fallback: try to construct domain from company name
    const domainName = companyName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '');
    
    const possibleDomains = [
      `https://${domainName}.com`,
      `https://www.${domainName}.com`,
      `https://${domainName}.io`,
      `https://www.${domainName}.io`
    ];
    
    // Test each domain
    for (const domain of possibleDomains) {
      try {
        const response = await axios.get(domain, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          },
          timeout: 5000,
          validateStatus: (status) => status < 400
        });
        
        if (response.status === 200) {
          logger.info(`🌐 Found website for ${companyName}: ${domain}`);
          return domain;
        }
      } catch (error) {
        // Continue to next domain
      }
    }
    
    logger.warn(`⚠️ Could not find website for ${companyName}`);
    return null;
    
  } catch (error) {
    logger.warn(`⚠️ Website search failed for ${companyName}:`, error.message);
    return null;
  }
}

/**
 * Analyze company website for platform type and business model
 */
async function analyzeCompanyWebsite(websiteUrl) {
  if (!websiteUrl) return {};
  
  try {
    const response = await axios.get(websiteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    // Debug: HTTP status and first 500 chars of HTML
    console.log(`\n[DEBUG] HTTP status for ${websiteUrl}:`, response.status);
    const htmlSnippet = response.data.slice(0, 500);
    console.log(`[DEBUG] First 500 chars of HTML for ${websiteUrl}:\n${htmlSnippet}\n`);

    const $ = cheerio.load(response.data);
    
    // Extract key website content
    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content') || '';
    const keywords = $('meta[name="keywords"]').attr('content') || '';
    const bodyText = $('body').text().toLowerCase();

    // Debug: extracted content
    console.log(`[DEBUG] Extracted title: ${title}`);
    console.log(`[DEBUG] Extracted description: ${description}`);
    console.log(`[DEBUG] Body text length: ${bodyText.length}`);

    // Analyze platform type
    const platformType = detectPlatformType(bodyText, title.toLowerCase(), description.toLowerCase(), true);

    // Extract business indicators
    const businessIndicators = extractBusinessIndicators(bodyText, $);
    
    // Detect technology stack
    const techStack = detectTechStack($, response.headers);
    
    // Extract pricing information
    const pricingInfo = extractPricingInfo(bodyText, $);
    
    return {
      title,
      description,
      platform_type: platformType,
      business_indicators: businessIndicators,
      tech_stack: techStack,
      pricing_info: pricingInfo,
      content_analysis: {
        has_api: bodyText.includes('api') || bodyText.includes('integration'),
        has_developers: bodyText.includes('developer') || bodyText.includes('documentation'),
        has_enterprise: bodyText.includes('enterprise') || bodyText.includes('business'),
        has_pricing: bodyText.includes('pricing') || bodyText.includes('plans')
      }
    };
    
  } catch (error) {
    logger.warn(`⚠️ Website analysis failed for ${websiteUrl}:`, error.message);
    return {};
  }
}

/**
 * Detect platform type based on content analysis
 */
function detectPlatformType(content, title, description, debug = false) {
  const allText = `${content} ${title} ${description}`;
  
  const platforms = {
    'no-code': ['no-code', 'low-code', 'visual', 'drag-and-drop', 'app builder', 'website builder'],
    'crm': ['crm', 'customer relationship', 'sales pipeline', 'lead management', 'sales automation', 'contact management', 'deal tracking', 'sales funnel', 'customer database', 'sales tracking', 'prospect management', 'sales process', 'customer data', 'sales performance', 'revenue tracking'],
    'project-management': ['project management', 'task management', 'team collaboration', 'workflow'],
    'ecommerce': ['ecommerce', 'e-commerce', 'online store', 'shopping cart', 'payment processing'],
    'automation': ['automation', 'workflow', 'zapier', 'integration', 'business process'],
    'analytics': ['analytics', 'data visualization', 'reporting', 'business intelligence'],
    'communication': ['communication', 'messaging', 'chat', 'video conferencing', 'collaboration']
  };
  
  let detectedType = 'unknown';
  let maxScore = 0;
  let foundKeywords = {};
  
  for (const [type, keywords] of Object.entries(platforms)) {
    const found = [];
    const score = keywords.reduce((sum, keyword) => {
      const matches = (allText.match(new RegExp(keyword, 'gi')) || []).length;
      if (matches > 0) found.push(keyword);
      return sum + matches;
    }, 0);
    foundKeywords[type] = found;
    if (score > maxScore) {
      maxScore = score;
      detectedType = type;
    }
  }
  if (debug) {
    console.log('[DEBUG] Platform type keyword search:');
    Object.entries(platforms).forEach(([type, keywords]) => {
      console.log(`  ${type}:`, keywords.join(', '));
      console.log(`    Found:`, foundKeywords[type].join(', ') || 'None');
    });
    console.log(`[DEBUG] Detected platform type: ${detectedType} (score: ${maxScore})`);
  }
  return { type: detectedType, confidence: maxScore, keywords_found: maxScore };
}

/**
 * Extract business indicators from website content
 */
function extractBusinessIndicators(content, $) {
  const indicators = {
    has_customers: false,
    customer_count: null,
    has_funding: false,
    has_team_page: false,
    has_careers: false,
    has_press: false,
    has_case_studies: false,
    growth_indicators: []
  };
  
  // Customer indicators
  const customerMatches = content.match(/(\d+[\d,]*)\s*(customers|users|companies|businesses)/gi);
  if (customerMatches) {
    indicators.has_customers = true;
    indicators.customer_count = customerMatches[0];
  }
  
  // Growth indicators
  if (content.includes('funding') || content.includes('raised') || content.includes('series')) {
    indicators.has_funding = true;
    indicators.growth_indicators.push('funding');
  }
  
  if ($('a[href*="careers"]').length > 0 || content.includes('we\'re hiring')) {
    indicators.has_careers = true;
    indicators.growth_indicators.push('hiring');
  }
  
  if ($('a[href*="press"]').length > 0 || $('a[href*="news"]').length > 0) {
    indicators.has_press = true;
    indicators.growth_indicators.push('press');
  }
  
  if (content.includes('case study') || content.includes('success story')) {
    indicators.has_case_studies = true;
    indicators.growth_indicators.push('case_studies');
  }
  
  return indicators;
}

/**
 * Detect technology stack
 */
function detectTechStack($, headers) {
  const stack = {
    frontend: [],
    backend: [],
    analytics: [],
    hosting: []
  };
  
  // Frontend detection
  if ($('script[src*="react"]').length > 0) stack.frontend.push('React');
  if ($('script[src*="vue"]').length > 0) stack.frontend.push('Vue.js');
  if ($('script[src*="angular"]').length > 0) stack.frontend.push('Angular');
  
  // Analytics detection
  if ($('script[src*="google-analytics"]').length > 0) stack.analytics.push('Google Analytics');
  if ($('script[src*="mixpanel"]').length > 0) stack.analytics.push('Mixpanel');
  if ($('script[src*="segment"]').length > 0) stack.analytics.push('Segment');
  
  // Hosting detection from headers
  if (headers['server']) {
    const server = headers['server'].toLowerCase();
    if (server.includes('nginx')) stack.hosting.push('Nginx');
    if (server.includes('apache')) stack.hosting.push('Apache');
  }
  
  return stack;
}

/**
 * Extract pricing information
 */
function extractPricingInfo(content, $) {
  const pricing = {
    has_pricing: false,
    pricing_model: null,
    price_indicators: []
  };
  
  // Look for pricing pages
  const pricingLinks = $('a[href*="pricing"], a[href*="plans"]');
  if (pricingLinks.length > 0) {
    pricing.has_pricing = true;
  }
  
  // Detect pricing model
  if (content.includes('per month') || content.includes('monthly')) {
    pricing.pricing_model = 'subscription';
    pricing.price_indicators.push('monthly_subscription');
  }
  
  if (content.includes('per user') || content.includes('per seat')) {
    pricing.pricing_model = 'per_user';
    pricing.price_indicators.push('per_user_pricing');
  }
  
  if (content.includes('enterprise') && content.includes('contact')) {
    pricing.price_indicators.push('enterprise_pricing');
  }
  
  return pricing;
}

/**
 * Gather additional company intelligence
 */
async function gatherCompanyIntelligence(companyName) {
  // This would integrate with various APIs for company data
  // For now, return basic structure
  return {
    funding_info: null,
    employee_count: null,
    founded_year: null,
    location: null,
    industry: null,
    competitors: [],
    recent_news: []
  };
}

/**
 * Find key contacts for outreach with enhanced decision maker detection
 */
async function findKeyContacts(companyName, websiteUrl) {
  const contacts = [];
  
  try {
    if (websiteUrl) {
      // Comprehensive list of team page URLs to check
      const baseUrl = websiteUrl.replace(/\/$/, ''); // Remove trailing slash
      const teamUrls = [
        `${baseUrl}/team`,
        `${baseUrl}/about`,
        `${baseUrl}/leadership`,
        `${baseUrl}/about-us`,
        `${baseUrl}/our-team`,
        `${baseUrl}/founders`,
        `${baseUrl}/management`,
        `${baseUrl}/executive-team`,
        `${baseUrl}/people`,
        `${baseUrl}/company/team`,
        `${baseUrl}/company/leadership`
      ];
      
      for (const teamUrl of teamUrls) {
        try {
          console.log(`[CONTACT DISCOVERY] Checking: ${teamUrl}`);
          const response = await axios.get(teamUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            },
            timeout: 8000
          });
          
          const $ = cheerio.load(response.data);
          const pageText = $('body').text().toLowerCase();
          
          console.log(`[CONTACT DISCOVERY] Found page content, length: ${pageText.length}`);
          
          // Enhanced selectors for team member extraction
          const teamMemberSelectors = [
            '.team-member', '.person', '.employee', '.staff-member',
            '.team-card', '.bio', '.profile', '.member', '.founder',
            '.leadership-member', '.executive', '.team-item',
            '[class*="team"]', '[class*="member"]', '[class*="person"]',
            '[class*="founder"]', '[class*="leadership"]'
          ];
          
          const foundMembers = new Set();
          
          teamMemberSelectors.forEach(selector => {
            $(selector).each((i, element) => {
              const $el = $(element);
              const extractedContact = extractContactFromElement($el, 'website_team_page', websiteUrl);
              
              if (extractedContact && extractedContact.name && extractedContact.title) {
                const contactKey = `${extractedContact.name.toLowerCase()}-${extractedContact.title.toLowerCase()}`;
                if (!foundMembers.has(contactKey)) {
                  foundMembers.add(contactKey);
                  contacts.push(extractedContact);
                  console.log(`[CONTACT FOUND] ${extractedContact.name} - ${extractedContact.title}`);
                }
              }
            });
          });
          
          // If no structured team members found, try text-based extraction
          if (contacts.length === 0) {
            const textBasedContacts = extractContactsFromText(pageText, companyName);
            contacts.push(...textBasedContacts);
          }
          
          if (contacts.length > 0) {
            console.log(`[CONTACT DISCOVERY] Found ${contacts.length} contacts on ${teamUrl}`);
            break; // Found contacts, no need to check other URLs
          }
          
        } catch (error) {
          console.log(`[CONTACT DISCOVERY] Failed to access ${teamUrl}: ${error.message}`);
          continue;
        }
      }
      
      // Try to find contact information from main page and contact pages
      const contactInfo = await findContactInfoFromPages(websiteUrl);
      if (contactInfo.length > 0) {
        contacts.push(...contactInfo);
      }
    }
    
    // Prioritize and clean up contacts
    const prioritizedContacts = prioritizeContacts(contacts);
    
    // Apply contact quality scoring and verification
    const scoredContacts = scoreAndVerifyContacts(prioritizedContacts, websiteUrl);
    
    // Add research-needed placeholders if no high-quality contacts found
    const highQualityContacts = scoredContacts.filter(c => c.qualityScore.percentage >= 60);
    
    if (highQualityContacts.length === 0 && scoredContacts.length === 0) {
      scoredContacts.push({
        name: 'CEO/Founder',
        title: 'Chief Executive Officer',
        email: null,
        source: 'research_needed',
        priority: 'critical',
        verified: false,
        note: 'Research CEO contact via LinkedIn or company directory',
        qualityScore: { score: 40, percentage: 40, breakdown: {} },
        emailValidation: { isValid: false, deliverability: { risk: 'high', reason: 'No email found' } },
        recommendedForOutreach: false,
        outreachRisk: 'high'
      });
      
      scoredContacts.push({
        name: 'CTO/VP Engineering',
        title: 'Chief Technology Officer',
        email: null,
        source: 'research_needed', 
        priority: 'high',
        verified: false,
        note: 'Research technical decision maker contact',
        qualityScore: { score: 35, percentage: 35, breakdown: {} },
        emailValidation: { isValid: false, deliverability: { risk: 'high', reason: 'No email found' } },
        recommendedForOutreach: false,
        outreachRisk: 'high'
      });
    }
    
    console.log(`[CONTACT DISCOVERY] Final result: ${scoredContacts.length} contacts for ${companyName}`);
    console.log(`[CONTACT QUALITY] High-quality contacts: ${scoredContacts.filter(c => c.qualityScore.percentage >= 60).length}`);
    console.log(`[CONTACT QUALITY] Ready for outreach: ${scoredContacts.filter(c => c.recommendedForOutreach).length}`);
    
    return scoredContacts;
    
  } catch (error) {
    logger.warn(`⚠️ Contact search failed for ${companyName}:`, error.message);
    return [{
      name: 'Contact Research Needed',
      title: 'Decision Maker',
      email: null,
      source: 'research_failed',
      priority: 'high',
      verified: false,
      note: 'Manual research required due to technical error'
    }];
  }
}

/**
 * Extract contact information from a DOM element
 */
function extractContactFromElement($el, source, websiteUrl = null) {
  // Try multiple ways to extract name
  const nameSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', '.name', '.full-name', '.person-name', '.member-name', '.title', '[class*="name"]'];
  let name = '';
  
  for (const selector of nameSelectors) {
    const foundName = $el.find(selector).first().text().trim();
    if (foundName && foundName.length > 2 && foundName.length < 50) {
      name = foundName;
      break;
    }
  }
  
  // If no name in children, try the element itself with better filtering
  if (!name) {
    const elementText = $el.text().trim();
    const lines = elementText.split('\n').map(line => line.trim()).filter(line => line);
    
    // Filter out common navigation/UI text
    const filteredLines = lines.filter(line => {
      const lowerLine = line.toLowerCase();
      return !lowerLine.includes('press kit') && 
             !lowerLine.includes('careers') &&
             !lowerLine.includes('about') &&
             !lowerLine.includes('contact') &&
             !lowerLine.includes('menu') &&
             !lowerLine.includes('navigation') &&
             line.length > 2 && 
             line.length < 50 &&
             !line.includes('@') && // Not an email
             /^[a-zA-Z\s\-'\.]+$/.test(line); // Only letters, spaces, hyphens, apostrophes, dots
    });
    
    if (filteredLines.length > 0) {
      name = filteredLines[0];
    }
  }
  
  // Try multiple ways to extract title/role
  const titleSelectors = ['.title', '.position', '.role', '.job-title', '.designation', '.job', '[class*="title"]', '[class*="role"]', '[class*="position"]'];
  let title = '';
  
  for (const selector of titleSelectors) {
    const foundTitle = $el.find(selector).first().text().trim();
    if (foundTitle && foundTitle.length > 2) {
      title = foundTitle;
      break;
    }
  }
  
  // Try to extract title from text if no structured title found
  if (!title && name) {
    const elementText = $el.text().toLowerCase();
    const titleKeywords = ['ceo', 'founder', 'cto', 'cpo', 'vp', 'director', 'head of', 'chief', 'president', 'manager'];
    
    for (const keyword of titleKeywords) {
      if (elementText.includes(keyword)) {
        if (keyword === 'ceo') title = 'CEO';
        else if (keyword === 'founder') title = 'Founder';
        else if (keyword === 'cto') title = 'CTO';
        else if (keyword === 'cpo') title = 'CPO';
        else if (keyword === 'vp') title = 'VP';
        else title = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        break;
      }
    }
  }
  
  // Extract email - try multiple methods
  let email = $el.find('a[href^="mailto:"]').attr('href')?.replace('mailto:', '') || null;
  
  // If no mailto found, look for email patterns in text
  if (!email) {
    const elementText = $el.text();
    const emailMatch = elementText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      email = emailMatch[0];
    }
  }
  
  // If still no email and we have a name, generate a likely email
  if (!email && name) {
    const cleanNameForEmail = name.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(' ')
      .filter(part => part.length > 1);
    
    if (cleanNameForEmail.length >= 2) {
      // Try common patterns: firstname.lastname, first.last, firstname
      const domain = websiteUrl ? websiteUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0] : null;
      if (domain) {
        const possibleEmails = [
          `${cleanNameForEmail[0]}.${cleanNameForEmail[cleanNameForEmail.length - 1]}@${domain}`,
          `${cleanNameForEmail[0]}@${domain}`
        ];
        email = possibleEmails[0]; // Use the most likely pattern
      }
    }
  }
  
  // Extract LinkedIn if available
  const linkedin = $el.find('a[href*="linkedin.com"]').attr('href') || null;
  
  if (name && name.length > 2) {
    return {
      name: cleanName(name),
      title: title || 'Team Member',
      email: email,
      linkedin: linkedin,
      source: source,
      priority: calculateContactPriority(title),
      verified: !!email,
      extractedAt: new Date().toISOString()
    };
  }
  
  return null;
}

/**
 * Extract contacts from unstructured text
 */
function extractContactsFromText(text, companyName) {
  const contacts = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  // Look for executive titles in text
  const executivePatterns = [
    /(\w+\s+\w+).*?(ceo|chief executive officer)/i,
    /(\w+\s+\w+).*?(founder)/i,
    /(\w+\s+\w+).*?(cto|chief technology officer)/i,
    /(\w+\s+\w+).*?(cpo|chief product officer)/i,
    /(\w+\s+\w+).*?(vp|vice president)/i
  ];
  
  for (const line of lines) {
    for (const pattern of executivePatterns) {
      const match = line.match(pattern);
      if (match) {
        const name = match[1].trim();
        const title = match[2].trim();
        
        if (name.length > 3 && name.length < 30) {
          contacts.push({
            name: cleanName(name),
            title: normalizeTitle(title),
            email: null,
            source: 'text_extraction',
            priority: calculateContactPriority(title),
            verified: false,
            extractedAt: new Date().toISOString()
          });
        }
      }
    }
  }
  
  return contacts;
}

/**
 * Find general contact information from contact pages
 */
async function findContactInfoFromPages(websiteUrl) {
  const contacts = [];
  const contactUrls = [`${websiteUrl}/contact`, `${websiteUrl}/contact-us`, `${websiteUrl}/contacts`];
  
  for (const contactUrl of contactUrls) {
    try {
      const response = await axios.get(contactUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        timeout: 5000
      });
      
      const $ = cheerio.load(response.data);
      
      // Look for general contact emails
      $('a[href^="mailto:"]').each((i, element) => {
        const email = $(element).attr('href').replace('mailto:', '');
        const context = $(element).text() || $(element).parent().text();
        
        // Skip generic emails for now, focus on potential decision maker emails
        if (!email.match(/^(info|hello|contact|support|sales)@/i)) {
          contacts.push({
            name: 'Contact from website',
            title: 'Team Member',
            email: email,
            source: 'contact_page',
            priority: 'medium',
            verified: true,
            note: `Found on contact page: ${context}`,
            extractedAt: new Date().toISOString()
          });
        }
      });
      
      break; // Found contact page, no need to check others
    } catch (error) {
      continue;
    }
  }
  
  return contacts;
}

/**
 * Prioritize contacts by role importance for B2B sales
 */
function prioritizeContacts(contacts) {
  const priorityOrder = {
    'ceo': 1,
    'founder': 2,
    'cto': 3,
    'cpo': 4,
    'vp': 5,
    'director': 6,
    'head': 7,
    'manager': 8,
    'other': 9
  };
  
  return contacts
    .sort((a, b) => {
      const aPriority = calculateContactPriorityScore(a.title);
      const bPriority = calculateContactPriorityScore(b.title);
      return aPriority - bPriority;
    })
    .slice(0, 5); // Limit to top 5 contacts
}

/**
 * Calculate contact priority based on title
 */
function calculateContactPriority(title) {
  if (!title) return 'low';
  
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('ceo') || titleLower.includes('founder')) return 'critical';
  if (titleLower.includes('cto') || titleLower.includes('cpo')) return 'high';
  if (titleLower.includes('vp') || titleLower.includes('vice president')) return 'high';
  if (titleLower.includes('director') || titleLower.includes('head of')) return 'medium';
  
  return 'medium';
}

function calculateContactPriorityScore(title) {
  if (!title) return 9;
  
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('ceo')) return 1;
  if (titleLower.includes('founder')) return 2;
  if (titleLower.includes('cto')) return 3;
  if (titleLower.includes('cpo')) return 4;
  if (titleLower.includes('vp')) return 5;
  if (titleLower.includes('director')) return 6;
  if (titleLower.includes('head')) return 7;
  if (titleLower.includes('manager')) return 8;
  
  return 9;
}

/**
 * Clean and normalize name
 */
function cleanName(name) {
  return name
    .replace(/[^\w\s-'\.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Normalize job titles
 */
function normalizeTitle(title) {
  const titleMap = {
    'ceo': 'Chief Executive Officer',
    'cto': 'Chief Technology Officer', 
    'cpo': 'Chief Product Officer',
    'founder': 'Founder',
    'vp': 'Vice President'
  };
  
  const lowerTitle = title.toLowerCase();
  return titleMap[lowerTitle] || title;
}

/**
 * Calculate contact quality score for B2B sales effectiveness
 */
function calculateContactQualityScore(contact) {
  let score = 0;
  let maxScore = 100;
  
  // Title/Role Priority (40 points max)
  const titleScore = calculateContactPriorityScore(contact.title);
  if (titleScore <= 2) score += 40; // CEO/Founder
  else if (titleScore <= 4) score += 35; // CTO/CPO  
  else if (titleScore <= 5) score += 25; // VP
  else if (titleScore <= 6) score += 15; // Director
  else score += 5; // Other
  
  // Email Verification (25 points max)
  if (contact.email && contact.verified) score += 25;
  else if (contact.email) score += 15;
  else score += 0;
  
  // Contact Source Quality (20 points max)
  if (contact.source === 'website_team_page') score += 20;
  else if (contact.source === 'contact_page') score += 15;
  else if (contact.source === 'text_extraction') score += 10;
  else score += 5;
  
  // LinkedIn Profile (10 points max)
  if (contact.linkedin) score += 10;
  
  // Recency/Freshness (5 points max)
  if (contact.extractedAt) {
    const extractedDate = new Date(contact.extractedAt);
    const daysSinceExtracted = (Date.now() - extractedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceExtracted <= 1) score += 5;
    else if (daysSinceExtracted <= 7) score += 3;
    else if (daysSinceExtracted <= 30) score += 1;
  }
  
  return {
    score: Math.min(score, maxScore),
    maxScore: maxScore,
    percentage: Math.round((Math.min(score, maxScore) / maxScore) * 100),
    breakdown: {
      title_priority: Math.min(40, titleScore <= 2 ? 40 : titleScore <= 4 ? 35 : titleScore <= 5 ? 25 : titleScore <= 6 ? 15 : 5),
      email_verification: contact.email && contact.verified ? 25 : contact.email ? 15 : 0,
      source_quality: contact.source === 'website_team_page' ? 20 : contact.source === 'contact_page' ? 15 : contact.source === 'text_extraction' ? 10 : 5,
      linkedin_profile: contact.linkedin ? 10 : 0,
      recency: contact.extractedAt ? 5 : 0
    }
  };
}

/**
 * Validate email address format
 */
function validateEmailFormat(email) {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Estimate email deliverability risk
 */
function estimateEmailDeliverability(email, companyWebsite) {
  if (!email || !validateEmailFormat(email)) {
    return { risk: 'high', reason: 'Invalid email format' };
  }
  
  const emailDomain = email.split('@')[1];
  
  // Check if email domain matches company website domain
  if (companyWebsite) {
    const websiteDomain = companyWebsite.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
    if (emailDomain === websiteDomain) {
      return { risk: 'low', reason: 'Email domain matches company website' };
    }
  }
  
  // Check for common business email providers
  const businessProviders = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com'];
  if (businessProviders.includes(emailDomain)) {
    return { risk: 'medium', reason: 'Personal email provider' };
  }
  
  // Custom domain is usually good for business
  return { risk: 'low', reason: 'Custom business domain' };
}

/**
 * Enhanced contact scoring with verification
 */
export function scoreAndVerifyContacts(contacts, companyWebsite) {
  return contacts.map(contact => {
    const qualityScore = calculateContactQualityScore(contact);
    const emailValidation = validateEmailFormat(contact.email);
    const deliverability = estimateEmailDeliverability(contact.email, companyWebsite);
    
    return {
      ...contact,
      qualityScore: qualityScore,
      emailValidation: {
        isValid: emailValidation,
        deliverability: deliverability
      },
      recommendedForOutreach: qualityScore.percentage >= 60 && emailValidation,
      outreachRisk: deliverability.risk
    };
  }).sort((a, b) => b.qualityScore.score - a.qualityScore.score);
}

/**
 * Score company fit for strategic guidance APIs
 */
function scoreCompanyFit(websiteAnalysis, companyIntel) {
  let score = 0;
  const breakdown = {};
  
  // Major Platform Recognition Boost (20 points max)
  const majorPlatforms = {
    'bubble': 20,
    'webflow': 20, 
    'airtable': 18,
    'zapier': 18,
    'notion': 15,
    'outsystems': 18,
    'adalo': 15,
    'glide': 12,
    'retool': 18,
    'monday.com': 15
  };
  
  const companyName = (websiteAnalysis.title || '').toLowerCase();
  const websiteUrl = (websiteAnalysis.website || '').toLowerCase();
  
  let recognitionBoost = 0;
  for (const [platform, boost] of Object.entries(majorPlatforms)) {
    if (companyName.includes(platform) || websiteUrl.includes(platform)) {
      recognitionBoost = boost;
      break;
    }
  }
  
  score += recognitionBoost;
  breakdown.platform_recognition = recognitionBoost;
  
  // Platform Type Match (30 points max)
  if (websiteAnalysis.platform_type) {
    const platformScore = {
      'no-code': 30,
      'crm': 25,
      'project-management': 20,
      'ecommerce': 20,
      'automation': 25,
      'analytics': 15
    };
    
    const typeScore = platformScore[websiteAnalysis.platform_type.type] || 5;
    score += typeScore;
    breakdown.platform_type = typeScore;
  }
  
  // Business Indicators (25 points max)
  let businessScore = 0;
  if (websiteAnalysis.business_indicators?.has_customers) businessScore += 10;
  if (websiteAnalysis.business_indicators?.has_funding) businessScore += 15;
  if (websiteAnalysis.business_indicators?.has_careers) businessScore += 10;
  if (websiteAnalysis.business_indicators?.has_case_studies) businessScore += 5;
  
  score += Math.min(businessScore, 25);
  breakdown.business_indicators = Math.min(businessScore, 25);
  
  // Technical Fit (20 points max)
  let techScore = 0;
  if (websiteAnalysis.content_analysis?.has_api) techScore += 15;
  if (websiteAnalysis.content_analysis?.has_developers) techScore += 10;
  if (websiteAnalysis.content_analysis?.has_enterprise) techScore += 5;
  
  score += Math.min(techScore, 20);
  breakdown.technical_fit = Math.min(techScore, 20);
  
  // Pricing Model (15 points max)
  let pricingScore = 0;
  if (websiteAnalysis.pricing_info?.has_pricing) pricingScore += 10;
  if (websiteAnalysis.pricing_info?.pricing_model === 'subscription') pricingScore += 5;
  if (websiteAnalysis.pricing_info?.price_indicators?.includes('enterprise_pricing')) pricingScore += 10;
  
  score += Math.min(pricingScore, 15);
  breakdown.pricing_model = Math.min(pricingScore, 15);
  
  // Growth Indicators (10 points max)
  const growthScore = Math.min(websiteAnalysis.business_indicators?.growth_indicators?.length * 3 || 0, 10);
  score += growthScore;
  breakdown.growth_indicators = growthScore;
  
  return {
    total_score: score,
    breakdown,
    max_possible: 120,
    percentage: Math.round((score / 120) * 100)
  };
}

/**
 * Generate insights and recommendations
 */
function generateCompanyInsights(websiteAnalysis, companyIntel, scoring) {
  const insights = {
    strengths: [],
    concerns: [],
    recommendations: [],
    email_hooks: []
  };
  
  // Analyze strengths
  if (scoring.breakdown.platform_type >= 20) {
    insights.strengths.push('Strong platform type match for strategic guidance APIs');
  }
  
  if (websiteAnalysis.business_indicators?.has_customers) {
    insights.strengths.push('Has established customer base');
    insights.email_hooks.push('user engagement and retention challenges');
  }
  
  if (websiteAnalysis.content_analysis?.has_api) {
    insights.strengths.push('API-first platform - technical integration feasible');
  }
  
  // Identify concerns
  if (scoring.breakdown.technical_fit < 10) {
    insights.concerns.push('Limited technical integration capabilities');
  }
  
  if (!websiteAnalysis.business_indicators?.has_funding) {
    insights.concerns.push('No clear funding/growth indicators');
  }
  
  // Generate recommendations
  if (scoring.total_score >= 80) {
    insights.recommendations.push('HIGH PRIORITY: Immediate outreach recommended');
    insights.recommendations.push('Focus on strategic guidance and user success metrics');
  } else if (scoring.total_score >= 60) {
    insights.recommendations.push('MEDIUM PRIORITY: Research more before outreach');
    insights.recommendations.push('Investigate recent growth and funding status');
  } else {
    insights.recommendations.push('LOW PRIORITY: Consider for nurture campaign');
  }
  
  // Generate email hooks based on platform type
  const platformType = websiteAnalysis.platform_type?.type;
  if (platformType === 'no-code') {
    insights.email_hooks.push('user project completion rates');
    insights.email_hooks.push('strategic guidance for non-technical users');
  } else if (platformType === 'crm') {
    insights.email_hooks.push('deal closure rates and sales strategy');
    insights.email_hooks.push('user adoption and feature utilization');
  }
  
  return insights;
}

/**
 * Batch research multiple companies
 */
export async function batchResearch(companies, options = {}) {
  const { delay = 2000, maxConcurrent = 3 } = options;
  const results = [];
  
  logger.info(`🔄 Starting batch research for ${companies.length} companies`);
  
  // Process in batches to avoid rate limiting
  for (let i = 0; i < companies.length; i += maxConcurrent) {
    const batch = companies.slice(i, i + maxConcurrent);
    
    const batchPromises = batch.map(async (company) => {
      try {
        const result = await researchCompany(company.name, company.website);
        return { ...result, input: company };
      } catch (error) {
        logger.error(`❌ Batch research failed for ${company.name}:`, error.message);
        return {
          input: company,
          error: error.message,
          recommendation: 'RESEARCH_FAILED'
        };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Delay between batches
    if (i + maxConcurrent < companies.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Sort by score (highest first)
  results.sort((a, b) => {
    const scoreA = a.scoring?.total_score || 0;
    const scoreB = b.scoring?.total_score || 0;
    return scoreB - scoreA;
  });
  
  logger.info(`✅ Batch research complete: ${results.length} companies analyzed`);
  return results;
} 