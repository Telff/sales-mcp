#!/usr/bin/env node

import readline from 'readline';
import fs from 'fs';

/**
 * Get input from user
 */
function getUserInput(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Update .env file with OAuth2 credentials
 */
function updateEnvFile(clientId, clientSecret) {
  const envPath = '.env';
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace placeholder values
  envContent = envContent.replace(
    /GMAIL_CLIENT_ID=your_gmail_client_id_here/,
    `GMAIL_CLIENT_ID=${clientId}`
  );
  
  envContent = envContent.replace(
    /GMAIL_CLIENT_SECRET=your_gmail_client_secret_here/,
    `GMAIL_CLIENT_SECRET=${clientSecret}`
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated .env file with your OAuth2 credentials');
}

/**
 * Main function
 */
async function main() {
  console.log('🔧 OAuth2 Credentials Updater for Sales MCP\n');
  console.log('📋 You need to get these from Google Cloud Console:');
  console.log('1. Go to: https://console.cloud.google.com/');
  console.log('2. Enable Gmail API');
  console.log('3. Configure OAuth consent screen');
  console.log('4. Create OAuth2 credentials (Desktop application)');
  console.log('5. Copy the Client ID and Client Secret\n');
  
  const clientId = await getUserInput('🔑 Enter your Gmail Client ID: ');
  const clientSecret = await getUserInput('🔐 Enter your Gmail Client Secret: ');
  
  if (!clientId || !clientSecret) {
    console.log('❌ Both Client ID and Client Secret are required');
    process.exit(1);
  }
  
  if (!clientId.includes('.apps.googleusercontent.com')) {
    console.log('⚠️  Warning: Client ID format looks incorrect');
    console.log('   Should end with: .apps.googleusercontent.com');
  }
  
  if (!clientSecret.startsWith('GOCSPX-')) {
    console.log('⚠️  Warning: Client Secret format looks incorrect');
    console.log('   Should start with: GOCSPX-');
  }
  
  updateEnvFile(clientId, clientSecret);
  
  console.log('');
  console.log('🎯 Next steps:');
  console.log('1. Run: npm run validate-oauth (to verify)');
  console.log('2. Run: npm run quick-gmail (to complete setup)');
  console.log('');
}

main().catch(console.error); 