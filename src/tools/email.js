import OpenAI from 'openai';
import { logger } from '../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';

/**
 * Email Generation Tool for Sales MCP
 * Creates highly personalized sales emails based on prospect research data
 */

// Initialize OpenAI client
let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} else {
  console.warn('⚠️  OpenAI API key not found. Email generation will not work.');
}

/**
 * Generate a personalized sales email based on research data
 * @param {Object} researchData - Complete research data from research tool
 * @param {string} recipientName - Name of the recipient
 * @param {string} recipientTitle - Job title of the recipient
 * @param {Object} options - Additional options for email generation
 * @returns {Object} Generated email with subject and body
 */
export async function generatePersonalizedEmail(researchData, recipientName, recipientTitle, options = {}) {
  try {
    if (!openai) {
      throw new Error('OpenAI API not configured. Please set OPENAI_API_KEY environment variable.');
    }

    logger.info(`📧 Generating personalized email for ${recipientName} at ${researchData.company.name}`);

    // Extract key insights from research data
    const insights = extractEmailInsights(researchData);
    
    // Build the prompt with comprehensive context
    const prompt = buildEmailPrompt(researchData, recipientName, recipientTitle, insights, options);
    
    // Generate email content
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.7
    });

    const emailContent = completion.choices[0].message.content;
    
    // Parse the response to extract subject and body
    const parsedEmail = parseEmailResponse(emailContent);
    
    logger.info(`✅ Email generated successfully for ${recipientName} at ${researchData.company.name}`);
    
    return {
      subject: parsedEmail.subject,
      body: parsedEmail.body,
      insights: insights,
      personalization_score: calculatePersonalizationScore(insights),
      generated_at: new Date().toISOString()
    };
    
  } catch (error) {
    logger.error(`❌ Email generation failed for ${recipientName} at ${researchData.company.name}:`, error.message);
    throw error;
  }
}

/**
 * Extract key insights from research data for email personalization
 */
function extractEmailInsights(researchData) {
  const company = researchData.company;
  const scoring = researchData.scoring;
  const insights = researchData.insights;
  
  return {
    // Company context
    platform_type: company.platform_type || 'unknown',
    company_size: determineCompanySize(company),
    growth_stage: determineGrowthStage(company),
    
    // Qualification insights
    qualification_score: scoring?.total_score || 0,
    qualification_tier: researchData.recommendation || 'UNKNOWN',
    
    // Business insights
    pain_points: insights?.pain_points || [],
    opportunities: insights?.opportunities || [],
    technical_fit: insights?.technical_fit || 'unknown',
    
    // Contact context
    contact_quality: determineContactQuality(recipientTitle),
    
    // Platform-specific insights
    platform_insights: generatePlatformInsights(company.platform_type, company),
    
    // Competitive context
    competitive_position: insights?.competitive_position || 'unknown',
    
    // Value proposition
    value_proposition: generateValueProposition(company.platform_type, company)
  };
}

/**
 * Build Authority-as-a-Service email generation prompt with Tesla strategy
 */
function buildEmailPrompt(researchData, recipientName, recipientTitle, insights, options) {
  const company = researchData.company;
  const platformInsights = insights.platform_insights;
  
  return `Generate a cold email for ${recipientName} (${recipientTitle}) at ${company.name} using Cereve's Authority-as-a-Service positioning with Tesla strategy (protect IP before NDA).

COMPANY CONTEXT:
- Company: ${company.name}
- Platform Type: ${insights.platform_type}
- Qualification Score: ${insights.qualification_score}/100 (${insights.qualification_tier})
- Recipient: ${recipientName} (${recipientTitle})

AUTHORITY-AS-A-SERVICE FRAMEWORK:
1. PROBLEM: ${platformInsights.abandonment_problem}
2. INTRIGUE: "We've pioneered a new category called Authority-as-a-Service"
3. OUTCOME: ${platformInsights.retention_impact}
4. EXCLUSIVITY: ${platformInsights.category_opportunity}
5. PROTECTION: "Happy to explore this under NDA"

TESLA STRATEGY REQUIREMENTS:
- Lead with user abandonment problem (not technical problems)
- Frame as category creation opportunity (first-mover advantage)
- Create curiosity without revealing IP
- Emphasize exclusivity and confidentiality
- CTA focuses on NDA conversation: "Worth exploring confidentially?"
- Never position as cost-saving - always as competitive advantage and revenue expansion

WHAT TO NEVER REVEAL PRE-NDA:
- Specific API architecture or suite structure
- Exact implementation methodology
- Detailed user scenarios or questions
- Pricing or investment levels
- Technical integration details

EMAIL STRUCTURE:
1. Subject Line: Intriguing, mentions Authority-as-a-Service or category creation (max 60 chars)
2. Opening: Reference their platform's user abandonment problem
3. Intrigue: Introduce Authority-as-a-Service as new category
4. Outcome: Dramatic improvement in user retention/success
5. Exclusivity: First-mover advantage in their vertical
6. Protection: Offer to explore under NDA
7. CTA: "Worth exploring confidentially?"

TONE: Confident category creator, not vendor. Think Tesla revealing they've "solved electric performance" without revealing how.

PLATFORM CONTEXT:
${generatePlatformSpecificContext(insights.platform_type, company)}

FORMAT YOUR RESPONSE AS:
Subject: [Your subject line here]

[Your email body here]

Keep it under 150 words. Focus on mystery and curiosity, not technical details.`;
}

/**
 * Parse email response to extract subject and body
 */
function parseEmailResponse(emailContent) {
  const lines = emailContent.split('\n');
  let subject = '';
  let body = '';
  let inBody = false;
  
  for (const line of lines) {
    if (line.startsWith('Subject:')) {
      subject = line.replace('Subject:', '').trim();
    } else if (line.trim() === '') {
      inBody = true;
    } else if (inBody) {
      body += line + '\n';
    }
  }
  
  // Fallback if parsing fails
  if (!subject) {
    subject = 'AI-powered strategic guidance for your business';
  }
  if (!body.trim()) {
    body = emailContent;
  }
  
  return { subject, body: body.trim() };
}

/**
 * Calculate personalization score based on insights used
 */
function calculatePersonalizationScore(insights) {
  let score = 0;
  
  // Company context (30 points)
  if (insights.platform_type !== 'unknown') score += 10;
  if (insights.company_size !== 'unknown') score += 10;
  if (insights.growth_stage !== 'unknown') score += 10;
  
  // Pain points and opportunities (25 points)
  if (insights.pain_points.length > 0) score += 15;
  if (insights.opportunities.length > 0) score += 10;
  
  // Technical fit (20 points)
  if (insights.technical_fit !== 'unknown') score += 20;
  
  // Contact quality (15 points)
  if (insights.contact_quality !== 'unknown') score += 15;
  
  // Value proposition (10 points)
  if (insights.value_proposition) score += 10;
  
  return Math.min(score, 100);
}

/**
 * Determine company size category
 */
function determineCompanySize(company) {
  const employees = company.employees;
  const revenue = company.revenue;
  
  if (employees) {
    if (employees >= 500) return 'enterprise';
    if (employees >= 100) return 'mid-market';
    if (employees >= 25) return 'small-business';
    return 'startup';
  }
  
  if (revenue) {
    if (revenue >= 100_000_000) return 'enterprise';
    if (revenue >= 10_000_000) return 'mid-market';
    if (revenue >= 1_000_000) return 'small-business';
    return 'startup';
  }
  
  return 'unknown';
}

/**
 * Determine growth stage
 */
function determineGrowthStage(company) {
  const funding = company.funding;
  const employees = company.employees;
  
  if (funding?.stage) {
    return funding.stage.toLowerCase();
  }
  
  if (employees) {
    if (employees >= 500) return 'mature';
    if (employees >= 100) return 'growth';
    if (employees >= 25) return 'early-growth';
    return 'startup';
  }
  
  return 'unknown';
}

/**
 * Determine contact quality based on title
 */
function determineContactQuality(title) {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('ceo') || titleLower.includes('founder')) return 'executive';
  if (titleLower.includes('cto') || titleLower.includes('cpo') || titleLower.includes('vp')) return 'senior';
  if (titleLower.includes('director') || titleLower.includes('head')) return 'management';
  if (titleLower.includes('manager')) return 'mid-level';
  
  return 'unknown';
}

/**
 * Generate platform-specific insights for Authority-as-a-Service positioning
 */
function generatePlatformInsights(platformType, company) {
  const insights = {
    'no-code': {
      abandonment_problem: 'users abandon projects due to strategic uncertainty, not technical limitations',
      strategic_challenge: 'complex business logic decisions that users struggle to navigate',
      category_opportunity: 'first-mover advantage in no-code strategic guidance',
      retention_impact: 'dramatically reduces user project abandonment through embedded strategic support',
      competitive_edge: 'differentiates platform by solving the biggest user success blocker'
    },
    'project-management': {
      abandonment_problem: 'teams abandon projects due to strategic planning gaps, not tool limitations',
      strategic_challenge: 'resource allocation and project strategy decisions',
      category_opportunity: 'first-mover advantage in project management strategic guidance',
      retention_impact: 'significantly improves project success rates and team retention',
      competitive_edge: 'positions platform as strategic partner, not just task manager'
    },
    'crm': {
      abandonment_problem: 'sales teams abandon deals due to strategic uncertainty, not pipeline issues',
      strategic_challenge: 'deal qualification and sales strategy decisions',
      category_opportunity: 'first-mover advantage in CRM strategic guidance',
      retention_impact: 'dramatically improves deal win rates and sales team success',
      competitive_edge: 'transforms CRM from data tool to strategic sales partner'
    },
    'automation': {
      abandonment_problem: 'users abandon automation due to strategic complexity, not technical barriers',
      strategic_challenge: 'workflow design and automation strategy decisions',
      category_opportunity: 'first-mover advantage in automation strategic guidance',
      retention_impact: 'significantly improves automation adoption and ROI',
      competitive_edge: 'positions platform as strategic automation partner'
    },
    'e-commerce': {
      abandonment_problem: 'merchants abandon strategies due to market uncertainty, not platform limitations',
      strategic_challenge: 'product strategy and market positioning decisions',
      category_opportunity: 'first-mover advantage in e-commerce strategic guidance',
      retention_impact: 'dramatically improves merchant success rates and platform retention',
      competitive_edge: 'differentiates platform as strategic business partner'
    }
  };
  
  return insights[platformType] || insights['no-code'];
}

/**
 * Generate Authority-as-a-Service value proposition
 */
function generateValueProposition(platformType, company) {
  const valueProps = {
    'no-code': 'Authority-as-a-Service embedded in your platform to solve user project abandonment through strategic guidance',
    'project-management': 'Authority-as-a-Service for project management to transform teams from task managers to strategic partners',
    'crm': 'Authority-as-a-Service embedded in your CRM to transform sales teams from data managers to strategic partners',
    'automation': 'Authority-as-a-Service for automation platforms to solve strategic complexity and improve adoption',
    'e-commerce': 'Authority-as-a-Service for e-commerce to transform merchants from platform users to strategic partners'
  };
  
  return valueProps[platformType] || valueProps['no-code'];
}

/**
 * Generate Authority-as-a-Service context for email generation
 */
function generatePlatformSpecificContext(platformType, company) {
  const contexts = {
    'no-code': `${company.name} users have the tools but struggle with strategic business decisions - causing project abandonment. This is the biggest retention killer in no-code.`,
    'project-management': `${company.name} teams have the project tools but lack strategic guidance for complex planning decisions - leading to project abandonment and team churn.`,
    'crm': `${company.name} sales teams have the CRM tools but struggle with strategic deal qualification and sales strategy - causing deal abandonment and pipeline inefficiency.`,
    'automation': `${company.name} users have the automation tools but get stuck on strategic workflow design decisions - leading to automation abandonment and low ROI.`,
    'e-commerce': `${company.name} merchants have the platform tools but struggle with strategic product and market decisions - causing strategy abandonment and poor performance.`
  };
  
  return contexts[platformType] || contexts['no-code'];
}

/**
 * Generate batch emails for multiple prospects
 */
export async function generateBatchEmails(researchResults, options = {}) {
  const emails = [];
  
  for (const result of researchResults) {
    if (result.success && result.data) {
      try {
        // Generate email for primary contact
        const primaryContact = result.data.contacts?.primary || {
          name: 'Decision Maker',
          title: 'Executive'
        };
        
        const email = await generatePersonalizedEmail(
          result.data,
          primaryContact.name,
          primaryContact.title,
          options
        );
        
        emails.push({
          company: result.data.company.name,
          contact: primaryContact,
          email: email,
          success: true
        });
        
      } catch (error) {
        emails.push({
          company: result.data.company.name,
          error: error.message,
          success: false
        });
      }
    }
  }
  
  return emails;
}

/**
 * Preview a single Authority-as-a-Service email (no send)
 */
export async function previewEmail(researchData, recipientName, recipientTitle, options = {}) {
  const email = await generatePersonalizedEmail(researchData, recipientName, recipientTitle, options);
  return {
    company: researchData.company.name,
    score: researchData.scoring?.total_score || 0,
    subject: email.subject,
    body: email.body,
    personalization: email.insights,
    personalization_score: email.personalization_score,
    generated_at: email.generated_at
  };
}

/**
 * Preview batch Authority-as-a-Service emails (no send)
 */
export async function previewBatchEmails(researchResults, options = {}) {
  const previews = [];
  for (const result of researchResults) {
    if (result.success && result.data) {
      const contact = result.data.contacts?.primary || { name: 'Decision Maker', title: 'Executive' };
      const preview = await previewEmail(result.data, contact.name, contact.title, options);
      previews.push(preview);
    }
  }
  return previews;
}

/**
 * Save a generated email draft to drafts/ directory
 */
export async function saveEmailDraft(emailPreview, options = {}) {
  const draftsDir = path.resolve(process.cwd(), 'drafts');
  await fs.mkdir(draftsDir, { recursive: true });
  const fileName = getDraftFileName(emailPreview);
  const filePath = path.join(draftsDir, fileName);
  await fs.writeFile(filePath, JSON.stringify(emailPreview, null, 2), 'utf-8');
  return filePath;
}

/**
 * Helper: Generate a unique filename for each draft
 */
function getDraftFileName(emailPreview) {
  const company = emailPreview.company.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const recipient = (emailPreview.personalization?.recipient_name || 'recipient').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const timestamp = new Date(emailPreview.generated_at || Date.now()).toISOString().replace(/[:.]/g, '-');
  return `${company}__${recipient}__${timestamp}.json`;
}

/**
 * Interactive approval workflow: generate, display, and ask for approval before sending
 * sendEmailFn should be a function (to, subject, body, fromName) => Promise
 */
export async function generateAndReviewEmail({ researchData, recipientName, recipientTitle, to, fromName = 'Cereve Team', sendEmailFn }) {
  const email = await generatePersonalizedEmail(researchData, recipientName, recipientTitle);
  // Display review info
  console.log('\n================ EMAIL REVIEW ================');
  console.log(`Company: ${researchData.company.name}`);
  console.log(`Score: ${researchData.scoring?.total_score || 0}`);
  console.log(`Subject: ${email.subject}`);
  console.log('---------------------------------------------');
  console.log(email.body);
  console.log('---------------------------------------------');
  console.log('Personalization Elements:', email.insights);
  console.log('=============================================');
  // Ask for approval
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question('Send this email? (y/n): ');
  rl.close();
  if (answer.trim().toLowerCase() === 'y') {
    if (!sendEmailFn) throw new Error('sendEmailFn is required to send emails');
    const result = await sendEmailFn(to, email.subject, email.body, fromName);
    console.log('✅ Email sent!', result);
    return { sent: true, result };
  } else {
    console.log('❌ Email not sent.');
    return { sent: false };
  }
}

/**
 * Batch approval workflow: generate, display, and ask for approval for each email
 * sendEmailFn should be a function (to, subject, body, fromName) => Promise
 */
export async function batchGenerateAndReview({ batch, sendEmailFn }) {
  for (const item of batch) {
    const { researchData, recipientName, recipientTitle, to, fromName = 'Cereve Team' } = item;
    await generateAndReviewEmail({ researchData, recipientName, recipientTitle, to, fromName, sendEmailFn });
  }
} 