# Sales MCP - Authority-as-a-Service Sales Automation

Intelligent sales automation MCP server for Cereve's Authority-as-a-Service category creation.

## Features

- 🔍 **Intelligent Prospect Research** - Automated company analysis and qualification
- 📧 **Authority-as-a-Service Email Generation** - Tesla strategy cold emails with IP protection
- 📊 **Lead Scoring & Qualification** - Smart prioritization of prospects
- 🚀 **Gmail Integration** - Automated sending and tracking
- 📈 **Category Creation Pipeline** - Complete Authority-as-a-Service outreach workflow

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

## Setup

### 1. Environment Configuration

Copy the example environment file and configure your API keys:

```bash
cp env.example .env
```

Required environment variables:

- `OPENAI_API_KEY` - Your OpenAI API key for email generation
- `GOOGLE_CLIENT_EMAIL` - Gmail service account email
- `GOOGLE_PRIVATE_KEY` - Gmail service account private key

### 2. Gmail API Setup

For detailed Gmail OAuth2 setup instructions, see [GMAIL_SETUP.md](./GMAIL_SETUP.md).

Quick setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API
4. Create OAuth2 credentials (Desktop application)
5. Run the setup script: `npm run setup-gmail`
6. Follow the prompts to authorize and get refresh token

## Available Tools

### 1. `research_prospect`
Research and qualify a prospect company for sales outreach.

**Parameters:**
- `company_name` (string) - Name of the company to research

**Returns:** Comprehensive company data including:
- Platform type classification
- Revenue and employee information
- Funding status
- Qualification score and tier
- Technical stack analysis

### 2. `generate_email`
Generate an Authority-as-a-Service cold email using Tesla strategy (protect IP before NDA).

**Parameters:**
- `company_name` (string) - Name of the prospect company
- `recipient_name` (string) - Name of the recipient
- `recipient_title` (string) - Job title of the recipient

**Returns:** Authority-as-a-Service cold email with subject, body, and personalization score

### 3. `generate_email_from_research`
Generate an Authority-as-a-Service cold email using existing research data.

**Parameters:**
- `research_data` (object) - Complete research data from research_prospect tool
- `recipient_name` (string) - Name of the recipient
- `recipient_title` (string) - Job title of the recipient

**Returns:** Authority-as-a-Service cold email with subject, body, and personalization score

### 4. `send_email`
Send a sales email via Gmail API.

**Parameters:**
- `to` (string) - Recipient email address
- `subject` (string) - Email subject line
- `body` (string) - Email body content
- `from_name` (string, optional) - Sender name

**Returns:** Gmail message ID confirmation

### 5. `qualify_prospect`
Score and qualify a prospect based on research data.

**Parameters:**
- `company_data` (object) - Company research data to qualify

**Returns:** Qualification score, tier, and breakdown

### 6. `batch_research`
Research multiple companies in batch.

**Parameters:**
- `company_names` (array) - Array of company names to research

**Returns:** Array of research results for all companies

## Authority-as-a-Service Target Platforms

The MCP is optimized for platforms where user abandonment occurs due to strategic uncertainty:

- **No-Code/Low-Code** (Bubble, Webflow, Retool) - Users abandon projects due to business logic decisions
- **CRM** (HubSpot, Pipedrive, Salesforce) - Sales teams abandon deals due to strategic uncertainty
- **Project Management** (Asana, Monday.com, ClickUp) - Teams abandon projects due to planning gaps
- **E-commerce** (Shopify, WooCommerce, BigCommerce) - Merchants abandon strategies due to market uncertainty
- **Automation** (Zapier, Make.com, Integromat) - Users abandon automation due to strategic complexity

## Qualification Scoring

Prospects are scored on multiple criteria:

- **Platform Type** (30 points max)
- **Company Size** (25 points max)
- **Growth Indicators** (20 points max)
- **Technical Fit** (15 points max)
- **Contact Quality** (10 points max)

### Qualification Tiers

- **Hot** (80+ points) - Immediate outreach
- **Warm** (60-79 points) - Research more
- **Cold** (40-59 points) - Nurture campaign
- **Not Qualified** (<40 points) - Skip

## Usage Examples

### Research a Prospect
```javascript
// Research a no-code platform company
const result = await research_prospect({
  company_name: "Bubble"
});
```

### Generate Authority-as-a-Service Cold Email
```javascript
// Generate Authority-as-a-Service cold email for Monday.com's CEO
const email = await generate_email({
  company_name: "Monday.com",
  recipient_name: "Roy Mann",
  recipient_title: "CEO"
});

// Or use existing research data
const research = await research_prospect({ company_name: "Monday.com" });
const email = await generate_email_from_research({
  research_data: research,
  recipient_name: "Roy Mann",
  recipient_title: "CEO"
});
```

### Send Authority-as-a-Service Email
```javascript
// Send the Authority-as-a-Service cold email
await send_email({
  to: "roy@monday.com",
  subject: email.subject,
  body: email.body,
  from_name: "Cereve Team"
});
```

## Logging

The MCP includes comprehensive logging:

- **Console output** - Real-time development feedback
- **File logs** - Persistent logging in `logs/` directory
- **Error tracking** - Separate error log file
- **Performance monitoring** - Operation timing and metrics

Log levels can be configured via `LOG_LEVEL` environment variable.

## Development

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Setup Gmail OAuth2 authentication
npm run setup-gmail

# Test Gmail integration
npm run test-gmail

# Test email generation
npm run test-email
```

## Architecture

- **MCP Server** - Core server implementation using Model Context Protocol
- **Research Engine** - Multi-source company research and analysis
- **AI Email Generator** - OpenAI-powered personalized email creation
- **Gmail Integration** - Automated email sending via Gmail API
- **Qualification Engine** - Intelligent prospect scoring and tiering
- **Caching System** - Performance optimization with 24-hour cache TTL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License