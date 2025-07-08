import { researchCompany, batchResearch } from '../src/tools/research.js';
import { logger } from '../src/utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test the company research tool with real prospects
 */

// Sample companies to test (mix of platform types)
const testCompanies = [
  { name: 'Bubble', website: 'https://bubble.io' },
  { name: 'Airtable', website: 'https://airtable.com' },
  { name: 'Notion', website: 'https://notion.so' },
  { name: 'Monday.com', website: 'https://monday.com' },
  { name: 'Zapier', website: 'https://zapier.com' }
];

/**
 * Test single company research
 */
async function testSingleResearch() {
  console.log('\n🔍 Testing Single Company Research...\n');
  
  try {
    const result = await researchCompany('Bubble', 'https://bubble.io');
    
    console.log('📊 Research Results:');
    console.log('===================');
    console.log(`Company: ${result.company.name}`);
    console.log(`Website: ${result.company.website}`);
    console.log(`Platform Type: ${result.company.platform_type?.type || 'Unknown'}`);
    console.log(`Score: ${result.scoring.total_score}/100 (${result.scoring.percentage}%)`);
    console.log(`Recommendation: ${result.recommendation}`);
    console.log('\nScoring Breakdown:');
    Object.entries(result.scoring.breakdown).forEach(([key, value]) => {
      console.log(`  ${key}: ${value} points`);
    });
    
    console.log('\nInsights:');
    console.log(`Strengths: ${result.insights.strengths.join(', ')}`);
    console.log(`Email Hooks: ${result.insights.email_hooks.join(', ')}`);
    
    console.log('\nContacts Found:');
    result.contacts.forEach(contact => {
      console.log(`  ${contact.name} - ${contact.title} (${contact.source})`);
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Single research test failed:', error.message);
  }
}

/**
 * Test batch research
 */
async function testBatchResearch() {
  console.log('\n🔄 Testing Batch Company Research...\n');
  
  try {
    const results = await batchResearch(testCompanies, {
      delay: 3000, // 3 second delay between batches
      maxConcurrent: 2 // Process 2 at a time
    });
    
    console.log('📊 Batch Research Results:');
    console.log('==========================');
    
    results.forEach((result, index) => {
      if (result.error) {
        console.log(`${index + 1}. ❌ ${result.input.name}: FAILED (${result.error})`);
      } else {
        console.log(`${index + 1}. ${getScoreEmoji(result.scoring.total_score)} ${result.company.name}: ${result.scoring.total_score}/100 - ${result.recommendation}`);
        console.log(`   Platform: ${result.company.platform_type?.type || 'Unknown'}`);
        console.log(`   Contacts: ${result.contacts.length} found`);
      }
    });
    
    // Show top prospects
    const hotProspects = results.filter(r => r.recommendation === 'HOT_PROSPECT');
    const warmProspects = results.filter(r => r.recommendation === 'WARM_PROSPECT');
    
    console.log('\n🎯 Prospect Summary:');
    console.log(`Hot Prospects (80+): ${hotProspects.length}`);
    console.log(`Warm Prospects (60-79): ${warmProspects.length}`);
    
    if (hotProspects.length > 0) {
      console.log('\n🔥 HOT PROSPECTS (Ready for immediate outreach):');
      hotProspects.forEach(prospect => {
        console.log(`  • ${prospect.company.name} (${prospect.scoring.total_score}/100)`);
        console.log(`    Best hooks: ${prospect.insights.email_hooks.slice(0, 2).join(', ')}`);
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Batch research test failed:', error.message);
  }
}

/**
 * Test with your own prospect list
 */
async function testCustomProspects() {
  console.log('\n🎯 Testing Custom Prospect Research...\n');
  
  // Add your own prospects here
  const customProspects = [
    { name: 'Your Target Company 1', website: 'https://example1.com' },
    { name: 'Your Target Company 2', website: 'https://example2.com' }
  ];
  
  if (customProspects[0].website === 'https://example1.com') {
    console.log('📝 To test with your prospects:');
    console.log('   1. Edit this script');
    console.log('   2. Replace example companies with real targets');
    console.log('   3. Run: npm run test-custom');
    return;
  }
  
  const results = await batchResearch(customProspects);
  console.log('✅ Custom prospect research complete!');
  return results;
}

/**
 * Helper function to get emoji based on score
 */
function getScoreEmoji(score) {
  if (score >= 80) return '🔥';
  if (score >= 60) return '🟡';
  if (score >= 40) return '🔵';
  return '⚪';
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Sales MCP - Company Research Tool Test');
  console.log('==========================================');
  
  const args = process.argv.slice(2);
  
  if (args.includes('--single')) {
    await testSingleResearch();
  } else if (args.includes('--batch')) {
    await testBatchResearch();
  } else if (args.includes('--custom')) {
    await testCustomProspects();
  } else {
    // Run all tests
    await testSingleResearch();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Brief pause
    await testBatchResearch();
  }
  
  console.log('\n✅ Testing complete!');
  console.log('\nNext steps:');
  console.log('1. Review the research results');
  console.log('2. Test email generation for hot prospects');
  console.log('3. Start your outreach campaign!');
}

// Run tests
runTests().catch(console.error); 