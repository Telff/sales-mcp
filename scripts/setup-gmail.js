import { google } from 'googleapis';
import dotenv from 'dotenv';
import readline from 'readline';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Gmail API scope
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

/**
 * Create OAuth2 client from environment variables
 */
function createOAuth2Client() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.error('❌ Missing Gmail credentials in .env file!');
    console.log('📝 Please add GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET to your .env file');
    process.exit(1);
  }

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    'urn:ietf:wg:oauth:2.0:oob' // For desktop apps
  );
}

/**
 * Get authorization URL for Gmail access
 */
function getAuthUrl(oauth2Client) {
  const params = {
    access_type: 'offline',
    scope: SCOPES,
  };
  
  // Add login hint if business email is provided
  if (process.env.BUSINESS_EMAIL) {
    params.login_hint = process.env.BUSINESS_EMAIL;
  }
  
  return oauth2Client.generateAuthUrl(params);
}

/**
 * Get authorization code from user input
 */
function getAuthCode() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    rl.question('📋 Enter the authorization code from the browser: ', (code) => {
      rl.close();
      resolve(code);
    });
  });
}

/**
 * Exchange authorization code for tokens
 */
async function getTokens(oauth2Client, authCode) {
  try {
    const { tokens } = await oauth2Client.getToken(authCode);
    return tokens;
  } catch (error) {
    console.error('❌ Error getting tokens:', error.message);
    throw error;
  }
}

/**
 * Test sending an email
 */
async function testEmailSending(oauth2Client, tokens) {
  oauth2Client.setCredentials(tokens);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const email = [
    'To: ' + process.env.BUSINESS_EMAIL,
    'Subject: Sales MCP Test Email',
    '',
    'This is a test email from your Sales MCP system!',
    '',
    'Gmail integration is working correctly.',
    '✅ Ready to send prospect emails!'
  ].join('\n');

  const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

  try {
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Check your inbox for the test email');
    return result;
  } catch (error) {
    console.error('❌ Error sending test email:', error.message);
    throw error;
  }
}

/**
 * Main setup function
 */
async function setupGmail() {
  console.log('🚀 Setting up Gmail API for Sales MCP...\n');
  
  const oauth2Client = createOAuth2Client();
  const authUrl = getAuthUrl(oauth2Client);
  
  console.log('🔐 Authorize this app by visiting this URL:');
  console.log('🔗', authUrl);
  console.log('');
  console.log('📋 After authorization, copy the code and paste it here');
  console.log('');
  
  const authCode = await getAuthCode();
  
  console.log('🔄 Getting access tokens...');
  const tokens = await getTokens(oauth2Client, authCode);
  
  console.log('✅ Authorization successful!');
  console.log('📝 Add this to your .env file:');
  console.log('');
  console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
  console.log('');
  
  // Test email sending
  console.log('📧 Testing email sending...');
  await testEmailSending(oauth2Client, tokens);
  
  console.log('');
  console.log('🎉 Gmail setup complete! Your Sales MCP can now send emails.');
}

/**
 * Test email function (if refresh token already exists)
 */
async function testExistingSetup() {
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  
  if (!refreshToken) {
    console.error('❌ No refresh token found. Run setup first.');
    return;
  }
  
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });
  
  try {
    await testEmailSending(oauth2Client, { refresh_token: refreshToken });
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--test')) {
  testExistingSetup();
} else {
  setupGmail();
} 