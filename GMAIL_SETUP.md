# Gmail API Setup Guide for Sales MCP

This guide will help you set up Gmail OAuth2 authentication for sending emails through the Sales MCP server.

## Prerequisites

- Google Cloud Console access
- A Google Workspace account (recommended) or Gmail account
- Node.js and npm installed

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

## Step 2: Create OAuth2 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Desktop application" as the application type
4. Give it a name like "Sales MCP Gmail Client"
5. Click "Create"
6. Download the JSON file or copy the Client ID and Client Secret

## Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file and add your Gmail credentials:
   ```env
   GMAIL_CLIENT_ID=your_client_id_here
   GMAIL_CLIENT_SECRET=your_client_secret_here
   BUSINESS_EMAIL=your_business_email@company.com
   ```

## Step 4: Run Gmail Setup

1. Run the Gmail setup script:
   ```bash
   npm run setup-gmail
   ```

2. The script will:
   - Generate an authorization URL
   - Open the URL in your browser
   - Ask you to authorize the application
   - Provide you with a refresh token

3. Copy the refresh token and add it to your `.env` file:
   ```env
   GMAIL_REFRESH_TOKEN=your_refresh_token_here
   ```

## Step 5: Test Gmail Integration

1. Test the email functionality:
   ```bash
   npm run test-gmail
   ```

2. Check your inbox for the test email

## Troubleshooting

### Common Issues

**Error: "Gmail API not enabled"**
- Make sure Gmail API is enabled in Google Cloud Console

**Error: "Invalid credentials"**
- Verify your Client ID and Client Secret are correct
- Make sure you're using the right project

**Error: "Refresh token expired"**
- Run `npm run setup-gmail` again to get a new refresh token

**Error: "Access denied"**
- Make sure you're using a Google Workspace account or have proper permissions
- Check if your domain allows OAuth2 applications

### For Google Workspace Users

If you're using Google Workspace:
1. The OAuth consent screen should auto-approve for internal users
2. You may need admin approval for external users
3. Make sure your domain allows OAuth2 applications

### For Personal Gmail Users

If you're using a personal Gmail account:
1. You may need to enable "Less secure app access" (not recommended)
2. Consider using Google Workspace for better security
3. Make sure 2FA is properly configured

## Security Best Practices

1. **Never commit your `.env` file** to version control
2. **Use Google Workspace** for business applications
3. **Rotate refresh tokens** periodically
4. **Monitor API usage** in Google Cloud Console
5. **Use service accounts** for production applications (advanced)

## Complete .env Example

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Google Gmail API Configuration (OAuth2 for sending emails)
GMAIL_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-your_client_secret_here
GMAIL_REFRESH_TOKEN=1//04your_refresh_token_here

# Business email for testing
BUSINESS_EMAIL=your_business_email@company.com

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

## Next Steps

Once Gmail is configured:
1. Test the MCP server: `npm test`
2. Start the server: `npm run dev`
3. Use the `send_email` tool to send personalized outreach emails

## Support

If you encounter issues:
1. Check the logs in the `logs/` directory
2. Verify all environment variables are set correctly
3. Ensure Gmail API is enabled in Google Cloud Console
4. Check your Google Workspace admin settings (if applicable) 