#!/usr/bin/env node

import dotenv from 'dotenv';
import { google } from 'googleapis';

// Load environment variables
dotenv.config();

/**
 * Generate a test authorization URL
 */
function generateTestUrl() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob'
  );
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send'],
    prompt: 'consent'
  });
}

/**
 * Main function
 */
function main() {
  console.log('🧪 OAuth2 URL Test for Sales MCP\n');
  
  try {
    const authUrl = generateTestUrl();
    
    console.log('✅ Authorization URL generated successfully!');
    console.log('');
    console.log('🔗 Copy and paste this URL into your browser:');
    console.log('');
    console.log(authUrl);
    console.log('');
    console.log('📋 Step-by-step test instructions:');
    console.log('');
    console.log('1️⃣ Open an incognito/private browser window');
    console.log('2️⃣ Copy the URL above and paste it in the address bar');
    console.log('3️⃣ Press Enter and see what happens');
    console.log('');
    console.log('🔍 What to look for:');
    console.log('');
    console.log('✅ SUCCESS: You should see a Google authorization page');
    console.log('   - It will ask you to sign in (if not already)');
    console.log('   - It will show "Sales MCP wants to access your Google Account"');
    console.log('   - You should see a "Continue" button');
    console.log('');
    console.log('❌ ERROR: If you see "Invalid Request" error:');
    console.log('   - The OAuth consent screen is not properly configured');
    console.log('   - Your email is not added as a test user');
    console.log('   - The app is in "Production" mode instead of "Testing"');
    console.log('');
    console.log('🛠️  If you get an error, check these in Google Cloud Console:');
    console.log('');
    console.log('   1. Go to: https://console.cloud.google.com/');
    console.log('   2. Make sure you\'re in project: 69479843658');
    console.log('   3. Go to "APIs & Services" > "OAuth consent screen"');
    console.log('   4. Verify:');
    console.log('      - App is in "Testing" mode (not "Production")');
    console.log('      - Your email (ceo@cereve.io) is added as a test user');
    console.log('      - App name is set (e.g., "Sales MCP")');
    console.log('   5. Go to "APIs & Services" > "Enabled APIs"');
    console.log('      - Verify "Gmail API" is listed and enabled');
    console.log('');
    console.log('💡 Quick fix: If the app is in "Production" mode, change it to "Testing"');
    console.log('');
  } catch (error) {
    console.error('❌ Error generating authorization URL:', error.message);
    console.log('');
    console.log('This usually means there\'s an issue with your OAuth2 credentials.');
    console.log('Please check your .env file and Google Cloud Console setup.');
  }
}

main(); 