#!/usr/bin/env node

import readline from 'readline';
import fs from 'fs';
import { execSync } from 'child_process';

/**
 * Get business email from user
 */
function getBusinessEmail() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    rl.question('📧 Enter your business email address: ', (email) => {
      rl.close();
      resolve(email.trim());
    });
  });
}

/**
 * Update .env file with business email
 */
function updateEnvFile(email) {
  const envPath = '.env';
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace the placeholder business email
  envContent = envContent.replace(
    /BUSINESS_EMAIL=your_business_email@company\.com/,
    `BUSINESS_EMAIL=${email}`
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated .env file with your business email');
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Quick Gmail Setup for Sales MCP\n');
  
  // Get business email
  const email = await getBusinessEmail();
  
  if (!email || !email.includes('@')) {
    console.error('❌ Please enter a valid email address');
    process.exit(1);
  }
  
  // Update .env file
  updateEnvFile(email);
  
  console.log('');
  console.log('🔐 Now running Gmail authorization...');
  console.log('💡 Tip: Use an incognito/private browser window to avoid login conflicts');
  console.log('');
  
  // Run the main Gmail setup script
  try {
    execSync('node scripts/setup-gmail.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Gmail setup failed:', error.message);
  }
}

main().catch(console.error); 