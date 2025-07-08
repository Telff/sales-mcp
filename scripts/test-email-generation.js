#!/usr/bin/env node

/**
 * Test Email Generation Tool
 * Demonstrates AI-powered email generation for qualified prospects
 */

import dotenv from 'dotenv';
dotenv.config();

import { researchCompany } from '../src/tools/research.js';

// Mock email generation function for Authority-as-a-Service demonstration
async function generateMockEmail(researchData, recipientName, recipientTitle) {
  const company = researchData.company;
  const platformType = company.platform_type || 'no-code';
  
  // Authority-as-a-Service email templates with Tesla strategy
  const templates = {
    'project-management': {
      subject: `Authority-as-a-Service: First-mover advantage for ${company.name}`,
      body: `Hi ${recipientName},

${company.name} teams have the project tools but lack strategic guidance for complex planning decisions - leading to project abandonment and team churn.

We've pioneered a new category called Authority-as-a-Service that dramatically improves project success rates and team retention.

This positions ${company.name} as a strategic partner, not just a task manager - creating first-mover advantage in project management strategic guidance.

Happy to explore this under NDA.

Worth exploring confidentially?

Best regards,
Cereve Team`
    },
    'no-code': {
      subject: `Authority-as-a-Service: Solving ${company.name}'s biggest retention killer`,
      body: `Hi ${recipientName},

${company.name} users have the tools but struggle with strategic business decisions - causing project abandonment. This is the biggest retention killer in no-code.

We've pioneered a new category called Authority-as-a-Service that dramatically reduces user project abandonment through embedded strategic support.

This differentiates ${company.name} by solving the biggest user success blocker - creating first-mover advantage in no-code strategic guidance.

Happy to explore this under NDA.

Worth exploring confidentially?

Best regards,
Cereve Team`
    },
    'automation': {
      subject: `Authority-as-a-Service: Strategic advantage for ${company.name}`,
      body: `Hi ${recipientName},

${company.name} users have the automation tools but get stuck on strategic workflow design decisions - leading to automation abandonment and low ROI.

We've pioneered a new category called Authority-as-a-Service that significantly improves automation adoption and ROI.

This positions ${company.name} as a strategic automation partner - creating first-mover advantage in automation strategic guidance.

Happy to explore this under NDA.

Worth exploring confidentially?

Best regards,
Cereve Team`
    }
  };
  
  const template = templates[platformType] || templates['no-code'];
  
  return {
    subject: template.subject,
    body: template.body,
    insights: {
      platform_type: platformType,
      company_size: 'mid-market',
      qualification_score: researchData.scoring?.total_score || 0,
      personalization_score: 85
    },
    personalization_score: 85,
    generated_at: new Date().toISOString()
  };
}

// Our qualified prospects from research
const QUALIFIED_PROSPECTS = [
  {
    name: 'Monday.com',
    score: 94,
    tier: 'HOT_PROSPECT',
    platform_type: 'project-management',
    contacts: [
      { name: 'Roy Mann', title: 'CEO' },
      { name: 'Eran Zinman', title: 'CTO' }
    ]
  },
  {
    name: 'Airtable',
    score: 76,
    tier: 'WARM_PROSPECT',
    platform_type: 'no-code',
    contacts: [
      { name: 'Howie Liu', title: 'CEO' },
      { name: 'Andrew Ofstad', title: 'CPO' }
    ]
  },
  {
    name: 'Notion',
    score: 73,
    tier: 'WARM_PROSPECT',
    platform_type: 'no-code',
    contacts: [
      { name: 'Ivan Zhao', title: 'CEO' },
      { name: 'Akshay Kothari', title: 'COO' }
    ]
  },
  {
    name: 'Zapier',
    score: 63,
    tier: 'WARM_PROSPECT',
    platform_type: 'automation',
    contacts: [
      { name: 'Wade Foster', title: 'CEO' },
      { name: 'Bryan Helmig', title: 'CTO' }
    ]
  }
];

async function testEmailGeneration() {
  console.log('🚀 Testing AI-Powered Email Generation Tool\n');
  
  // Test with Monday.com (HOT PROSPECT)
  console.log('='.repeat(80));
  console.log('🔥 HOT PROSPECT: Monday.com (94/100)');
  console.log('='.repeat(80));
  
  try {
    // Research Monday.com
    console.log('\n📊 Researching Monday.com...');
    const mondayResearch = await researchCompany('Monday.com');
    console.log(`✅ Research complete: ${mondayResearch.recommendation} (${mondayResearch.scoring.total_score}/100)`);
    
    // Generate email for CEO
    console.log('\n📧 Generating personalized email for Roy Mann (CEO)...');
    const mondayEmail = await generateMockEmail(
      mondayResearch,
      'Roy Mann',
      'CEO'
    );
    
    console.log('\n📬 Generated Email:');
    console.log('─'.repeat(60));
    console.log(`Subject: ${mondayEmail.subject}`);
    console.log('─'.repeat(60));
    console.log(mondayEmail.body);
    console.log('─'.repeat(60));
    console.log(`Personalization Score: ${mondayEmail.personalization_score}/100`);
    
  } catch (error) {
    console.error('❌ Error with Monday.com:', error.message);
  }
  
  // Test with Airtable (WARM PROSPECT)
  console.log('\n\n' + '='.repeat(80));
  console.log('🔥 WARM PROSPECT: Airtable (76/100)');
  console.log('='.repeat(80));
  
  try {
    // Research Airtable
    console.log('\n📊 Researching Airtable...');
    const airtableResearch = await researchCompany('Airtable');
    console.log(`✅ Research complete: ${airtableResearch.recommendation} (${airtableResearch.scoring.total_score}/100)`);
    
    // Generate email for CEO
    console.log('\n📧 Generating personalized email for Howie Liu (CEO)...');
    const airtableEmail = await generateMockEmail(
      airtableResearch,
      'Howie Liu',
      'CEO'
    );
    
    console.log('\n📬 Generated Email:');
    console.log('─'.repeat(60));
    console.log(`Subject: ${airtableEmail.subject}`);
    console.log('─'.repeat(60));
    console.log(airtableEmail.body);
    console.log('─'.repeat(60));
    console.log(`Personalization Score: ${airtableEmail.personalization_score}/100`);
    
  } catch (error) {
    console.error('❌ Error with Airtable:', error.message);
  }
  
  // Test with Notion (WARM PROSPECT)
  console.log('\n\n' + '='.repeat(80));
  console.log('🔥 WARM PROSPECT: Notion (73/100)');
  console.log('='.repeat(80));
  
  try {
    // Research Notion
    console.log('\n📊 Researching Notion...');
    const notionResearch = await researchCompany('Notion');
    console.log(`✅ Research complete: ${notionResearch.recommendation} (${notionResearch.scoring.total_score}/100)`);
    
    // Generate email for CEO
    console.log('\n📧 Generating personalized email for Ivan Zhao (CEO)...');
    const notionEmail = await generateMockEmail(
      notionResearch,
      'Ivan Zhao',
      'CEO'
    );
    
    console.log('\n📬 Generated Email:');
    console.log('─'.repeat(60));
    console.log(`Subject: ${notionEmail.subject}`);
    console.log('─'.repeat(60));
    console.log(notionEmail.body);
    console.log('─'.repeat(60));
    console.log(`Personalization Score: ${notionEmail.personalization_score}/100`);
    
  } catch (error) {
    console.error('❌ Error with Notion:', error.message);
  }
  
  // Test with Zapier (WARM PROSPECT)
  console.log('\n\n' + '='.repeat(80));
  console.log('🔥 WARM PROSPECT: Zapier (63/100)');
  console.log('='.repeat(80));
  
  try {
    // Research Zapier
    console.log('\n📊 Researching Zapier...');
    const zapierResearch = await researchCompany('Zapier');
    console.log(`✅ Research complete: ${zapierResearch.recommendation} (${zapierResearch.scoring.total_score}/100)`);
    
    // Generate email for CEO
    console.log('\n📧 Generating personalized email for Wade Foster (CEO)...');
    const zapierEmail = await generateMockEmail(
      zapierResearch,
      'Wade Foster',
      'CEO'
    );
    
    console.log('\n📬 Generated Email:');
    console.log('─'.repeat(60));
    console.log(`Subject: ${zapierEmail.subject}`);
    console.log('─'.repeat(60));
    console.log(zapierEmail.body);
    console.log('─'.repeat(60));
    console.log(`Personalization Score: ${zapierEmail.personalization_score}/100`);
    
  } catch (error) {
    console.error('❌ Error with Zapier:', error.message);
  }
  
  console.log('\n\n' + '='.repeat(80));
  console.log('✅ Email Generation Test Complete!');
  console.log('='.repeat(80));
  console.log('\n🎯 Key Features Demonstrated:');
  console.log('• AI-powered personalized email generation');
  console.log('• Platform-specific pain points and value propositions');
  console.log('• Company research integration');
  console.log('• Personalization scoring');
  console.log('• Professional tone and compelling subject lines');
  console.log('\n💡 To use real AI generation, set OPENAI_API_KEY in your .env file');
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testEmailGeneration().catch(console.error);
} 