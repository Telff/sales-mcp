#!/usr/bin/env node

import dotenv from 'dotenv';
import { google } from 'googleapis';

// Load environment variables
dotenv.config();

/**
 * Validate OAuth2 configuration
 */
function validateOAuthConfig() {
  console.log('🔍 Validating OAuth2 Configuration...\n');
  
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const businessEmail = process.env.BUSINESS_EMAIL;
  
  let isValid = true;
  
  // Check Client ID
  if (!clientId || clientId === 'your_gmail_client_id_here') {
    console.log('❌ GMAIL_CLIENT_ID is not set or still has placeholder value');
    console.log('   Expected format: 123456789-abcdefghijklmnop.apps.googleusercontent.com');
    isValid = false;
  } else {
    console.log('✅ GMAIL_CLIENT_ID is set');
  }
  
  // Check Client Secret
  if (!clientSecret || clientSecret === 'your_gmail_client_secret_here') {
    console.log('❌ GMAIL_CLIENT_SECRET is not set or still has placeholder value');
    console.log('   Expected format: GOCSPX-...');
    isValid = false;
  } else {
    console.log('✅ GMAIL_CLIENT_SECRET is set');
  }
  
  // Check Business Email
  if (!businessEmail || businessEmail === 'your_business_email@company.com') {
    console.log('❌ BUSINESS_EMAIL is not set or still has placeholder value');
    console.log('   Expected format: your_email@gmail.com');
    isValid = false;
  } else {
    console.log('✅ BUSINESS_EMAIL is set');
  }
  
  // Check Client ID format
  if (clientId && !clientId.includes('.apps.googleusercontent.com')) {
    console.log('❌ GMAIL_CLIENT_ID format looks incorrect');
    console.log('   Should end with: .apps.googleusercontent.com');
    isValid = false;
  }
  
  // Check Client Secret format
  if (clientSecret && !clientSecret.startsWith('GOCSPX-')) {
    console.log('❌ GMAIL_CLIENT_SECRET format looks incorrect');
    console.log('   Should start with: GOCSPX-');
    isValid = false;
  }
  
  console.log('');
  
  if (!isValid) {
    console.log('🚨 Configuration issues found!');
    console.log('');
    console.log('📋 To fix these issues:');
    console.log('1. Follow the setup guide in OAUTH2_SETUP.md');
    console.log('2. Update your .env file with real values from Google Cloud Console');
    console.log('3. Run this validation again');
    console.log('');
    return false;
  }
  
  console.log('✅ OAuth2 configuration looks good!');
  console.log('');
  console.log('🎯 Next steps:');
  console.log('1. Run: npm run quick-gmail');
  console.log('2. Follow the authorization flow');
  console.log('3. Add the refresh token to your .env file');
  console.log('');
  
  return true;
}

/**
 * Test OAuth2 client creation
 */
function testOAuth2Client() {
  console.log('🧪 Testing OAuth2 client creation...');
  
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'urn:ietf:wg:oauth:2.0:oob'
    );
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.send'],
    });
    
    console.log('✅ OAuth2 client created successfully');
    console.log('🔗 Authorization URL generated');
    console.log('');
    console.log('📋 To test the authorization URL:');
    console.log('1. Copy this URL:');
    console.log(authUrl);
    console.log('');
    console.log('2. Open it in an incognito browser window');
    console.log('3. Try to authorize the application');
    console.log('');
    
    return true;
  } catch (error) {
    console.log('❌ Failed to create OAuth2 client:', error.message);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log('🚀 OAuth2 Configuration Validator for Sales MCP\n');
  
  const configValid = validateOAuthConfig();
  
  if (configValid) {
    testOAuth2Client();
  }
  
  console.log('📚 For detailed setup instructions, see: OAUTH2_SETUP.md');
}

main(); 