# Sales MCP Dashboard

A comprehensive web dashboard for managing your AI-powered sales automation MCP server.

## Features

- **MCP Status Monitor** - Real-time monitoring of MCP server status
- **Sales Pipeline View** - Visual pipeline with prospect stages and actions
- **Email Review Interface** - Preview and approve emails before sending
- **Research Results Display** - Company analysis and scoring
- **Communication Interface** - Chat with MCPs and send commands
- **Business Metrics** - Key performance indicators and analytics

## Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Your Sales MCP server configured

### Installation

1. Install dashboard dependencies:
```bash
cd dashboard
npm install
```

2. Build the dashboard:
```bash
npm run build
```

3. Start the dashboard server (from project root):
```bash
npm run dashboard
```

The dashboard will be available at `http://localhost:3001`

### Development

For development with hot reloading:

1. Start the dashboard in development mode:
```bash
npm run dashboard-dev
```

2. In another terminal, start the API server:
```bash
npm run dashboard
```

## Dashboard Components

### Overview
- Key business metrics
- Pipeline distribution charts
- Weekly activity tracking
- Recent activity feed

### Prospect Research
- Table of researched companies
- Qualification scores and filtering
- Company details and actions
- Export capabilities

### Email Review
- Email preview and editing
- Approval workflow
- Status tracking
- Batch operations

### Pipeline
- Visual pipeline stages
- Drag-and-drop prospect management
- Stage conversion analytics
- Pipeline value tracking

### MCP Chat
- Natural language commands
- Real-time communication
- Command history
- Status monitoring

## API Integration

The dashboard communicates with your Sales MCP server through:

- **MCP Status**: `/api/mcp/status`
- **MCP Commands**: `/api/mcp/command`
- **Prospects Data**: `/api/prospects`
- **Emails Data**: `/api/emails`

## Customization

### Styling
The dashboard uses Tailwind CSS for styling. Customize colors and components in:
- `tailwind.config.js` - Theme configuration
- `src/index.css` - Custom component styles

### Data Sources
Update the API endpoints in the custom hooks:
- `src/hooks/useMCPConnection.js`
- `src/hooks/useProspects.js`
- `src/hooks/useEmails.js`

### Adding New Features
1. Create new components in `src/components/`
2. Add routes in `src/components/Dashboard.js`
3. Update navigation in `src/components/Sidebar.js`

## Troubleshooting

### Dashboard won't start
- Check if port 3001 is available
- Ensure all dependencies are installed
- Verify Node.js version is 16+

### MCP server not connecting
- Check if the MCP server is running
- Verify environment variables are set
- Check console for error messages

### Build errors
- Clear node_modules and reinstall
- Check for missing dependencies
- Verify React version compatibility

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License - see main project LICENSE file 