# OAuth2 Setup Guide - Fix "Invalid Request" Error

This guide will help you properly set up OAuth2 credentials to fix the "invalid request" error.

## Step 1: Google Cloud Console Setup

### 1.1 Create/Select Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Make sure you're in the correct project

### 1.2 Enable Gmail API
1. Go to "APIs & Services" > "Library"
2. Search for "Gmail API"
3. Click on "Gmail API"
4. Click "Enable"

### 1.3 Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" (unless you have Google Workspace)
3. Fill in the required information:
   - **App name**: "Sales MCP"
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click "Save and Continue"
5. On "Scopes" page, click "Add or Remove Scopes"
6. Find and select "Gmail API ../auth/gmail.send"
7. Click "Save and Continue"
8. On "Test users" page, add your email address
9. Click "Save and Continue"
10. Review and click "Back to Dashboard"

### 1.4 Create OAuth2 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Desktop application" as the application type
4. Name: "Sales MCP Desktop Client"
5. Click "Create"
6. **IMPORTANT**: Copy the Client ID and Client Secret immediately

## Step 2: Update Your .env File

Replace the placeholder values in your `.env` file:

```env
# Replace these with your actual values from Google Cloud Console
GMAIL_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-your_actual_client_secret_here
BUSINESS_EMAIL=your_actual_email@gmail.com
```

## Step 3: Test the Setup

Run the quick setup script:
```bash
npm run quick-gmail
```

## Common Issues and Solutions

### Issue: "Invalid Request" Error
**Cause**: OAuth2 credentials not properly configured
**Solution**: 
1. Make sure you've enabled Gmail API
2. Verify OAuth consent screen is configured
3. Check that you're using the correct Client ID/Secret
4. Ensure you're in the correct Google Cloud project

### Issue: "Access Denied" Error
**Cause**: OAuth consent screen not configured for your email
**Solution**:
1. Add your email as a test user in OAuth consent screen
2. Make sure the app is in "Testing" mode
3. Wait a few minutes for changes to propagate

### Issue: "Redirect URI Mismatch"
**Cause**: Redirect URI doesn't match configuration
**Solution**: 
- Our app uses `urn:ietf:wg:oauth:2.0:oob` which is correct for desktop apps
- Make sure you selected "Desktop application" when creating credentials

## Verification Steps

1. **Check API is enabled**:
   - Go to "APIs & Services" > "Enabled APIs"
   - Should see "Gmail API" listed

2. **Check OAuth consent screen**:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Should show "Testing" status
   - Your email should be in test users

3. **Check credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Should see your OAuth 2.0 Client ID
   - Application type should be "Desktop application"

## Complete .env Example

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Google Gmail API Configuration (OAuth2 for sending emails)
GMAIL_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-your_actual_client_secret_here
GMAIL_REFRESH_TOKEN=your_refresh_token_will_be_here_after_setup

# Business email for testing
BUSINESS_EMAIL=your_actual_email@gmail.com

# Logging Configuration
LOG_LEVEL=info

# Research Configuration
RESEARCH_TIMEOUT=10000
CACHE_TTL=86400000

# Rate Limiting
RATE_LIMIT_DELAY=1000

# Email Configuration
DEFAULT_FROM_NAME=Sales Team
DEFAULT_FROM_EMAIL=your_email@company.com
```

## Troubleshooting Commands

```bash
# Check if .env has real values (not placeholders)
grep -E "GMAIL_CLIENT_ID|GMAIL_CLIENT_SECRET" .env

# Run quick setup
npm run quick-gmail

# Test existing setup
npm run test-gmail

# Test MCP server
npm test
```

## Next Steps After Setup

1. Run `npm run quick-gmail` to complete the OAuth2 flow
2. Copy the refresh token to your `.env` file
3. Test with `npm run test-gmail`
4. Start your MCP server with `npm run dev` 