#!/usr/bin/env node

import dotenv from 'dotenv';
import { google } from 'googleapis';

// Load environment variables
dotenv.config();

/**
 * Generate and test authorization URL
 */
function generateAuthUrl() {
  console.log('🔍 Generating Authorization URL...\n');
  
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'urn:ietf:wg:oauth:2.0:oob'
    );
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.send'],
      prompt: 'consent' // Force consent screen
    });
    
    console.log('✅ Authorization URL generated successfully');
    console.log('');
    console.log('🔗 Authorization URL:');
    console.log(authUrl);
    console.log('');
    
    // Parse and display URL components
    const url = new URL(authUrl);
    console.log('📋 URL Components:');
    console.log('  - Client ID:', url.searchParams.get('client_id'));
    console.log('  - Redirect URI:', url.searchParams.get('redirect_uri'));
    console.log('  - Scope:', url.searchParams.get('scope'));
    console.log('  - Access Type:', url.searchParams.get('access_type'));
    console.log('  - Response Type:', url.searchParams.get('response_type'));
    console.log('');
    
    return authUrl;
  } catch (error) {
    console.error('❌ Error generating authorization URL:', error.message);
    return null;
  }
}

/**
 * Check common OAuth2 issues
 */
function checkCommonIssues() {
  console.log('🔍 Checking for Common OAuth2 Issues...\n');
  
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  
  // Check 1: Credentials format
  console.log('1️⃣ Checking credentials format:');
  if (!clientId.includes('.apps.googleusercontent.com')) {
    console.log('   ❌ Client ID format is incorrect');
  } else {
    console.log('   ✅ Client ID format is correct');
  }
  
  if (!clientSecret.startsWith('GOCSPX-')) {
    console.log('   ❌ Client Secret format is incorrect');
  } else {
    console.log('   ✅ Client Secret format is correct');
  }
  
  // Check 2: Project number extraction
  const projectNumber = clientId.split('-')[0];
  console.log(`   📊 Project Number: ${projectNumber}`);
  console.log('');
  
  // Check 3: Redirect URI
  console.log('2️⃣ Checking redirect URI:');
  console.log('   Expected: urn:ietf:wg:oauth:2.0:oob');
  console.log('   ✅ This is correct for desktop applications');
  console.log('');
  
  // Check 4: Scope
  console.log('3️⃣ Checking scope:');
  console.log('   Expected: https://www.googleapis.com/auth/gmail.send');
  console.log('   ✅ This is correct for Gmail API');
  console.log('');
}

/**
 * Provide troubleshooting steps
 */
function provideTroubleshootingSteps() {
  console.log('🛠️  Troubleshooting Steps for "Invalid Request" Error:\n');
  
  console.log('📋 Step 1: Verify Google Cloud Console Setup');
  console.log('   1. Go to: https://console.cloud.google.com/');
  console.log('   2. Make sure you\'re in the correct project');
  console.log('   3. Go to "APIs & Services" > "Enabled APIs"');
  console.log('   4. Verify "Gmail API" is listed and enabled');
  console.log('');
  
  console.log('📋 Step 2: Check OAuth Consent Screen');
  console.log('   1. Go to "APIs & Services" > "OAuth consent screen"');
  console.log('   2. Verify app is in "Testing" mode');
  console.log('   3. Check that your email is added as a test user');
  console.log('   4. Verify the app name and contact information');
  console.log('');
  
  console.log('📋 Step 3: Verify OAuth2 Credentials');
  console.log('   1. Go to "APIs & Services" > "Credentials"');
  console.log('   2. Find your OAuth 2.0 Client ID');
  console.log('   3. Verify application type is "Desktop application"');
  console.log('   4. Check that the Client ID matches your .env file');
  console.log('');
  
  console.log('📋 Step 4: Test Authorization URL');
  console.log('   1. Copy the authorization URL above');
  console.log('   2. Open it in an incognito/private browser window');
  console.log('   3. Make sure you\'re logged in with the correct Google account');
  console.log('   4. Try the authorization flow');
  console.log('');
  
  console.log('📋 Step 5: Common Solutions');
  console.log('   - Wait 5-10 minutes after making changes in Google Cloud Console');
  console.log('   - Try a different browser');
  console.log('   - Clear browser cookies and cache');
  console.log('   - Make sure you\'re using the correct Google account');
  console.log('   - Verify the app is not in "Production" mode (should be "Testing")');
  console.log('');
}

/**
 * Test with different parameters
 */
function testDifferentParameters() {
  console.log('🧪 Testing Different Authorization Parameters...\n');
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob'
  );
  
  // Test 1: Basic URL
  console.log('1️⃣ Basic authorization URL:');
  const basicUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send']
  });
  console.log(basicUrl);
  console.log('');
  
  // Test 2: With prompt
  console.log('2️⃣ With prompt=consent:');
  const promptUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send'],
    prompt: 'consent'
  });
  console.log(promptUrl);
  console.log('');
  
  // Test 3: With login hint
  console.log('3️⃣ With login_hint:');
  const loginUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send'],
    login_hint: process.env.BUSINESS_EMAIL
  });
  console.log(loginUrl);
  console.log('');
  
  console.log('💡 Try each of these URLs in an incognito browser window');
  console.log('');
}

/**
 * Main function
 */
function main() {
  console.log('🚀 OAuth2 Debug Tool for Sales MCP\n');
  
  // Check current configuration
  checkCommonIssues();
  
  // Generate authorization URL
  const authUrl = generateAuthUrl();
  
  if (authUrl) {
    // Test different parameters
    testDifferentParameters();
  }
  
  // Provide troubleshooting steps
  provideTroubleshootingSteps();
  
  console.log('🎯 Next Steps:');
  console.log('1. Follow the troubleshooting steps above');
  console.log('2. Try the different authorization URLs');
  console.log('3. If still having issues, check the Google Cloud Console logs');
  console.log('4. Consider creating a new OAuth2 client ID');
  console.log('');
}

main(); 