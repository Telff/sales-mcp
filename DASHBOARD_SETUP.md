# Sales MCP Dashboard - Mission Control Setup

## 🎯 Overview

The Sales MCP Dashboard is a comprehensive web interface that serves as mission control for your AI-powered sales automation. It provides real-time monitoring, prospect management, email review, and direct communication with your MCP servers.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install main project dependencies
npm install

# Install dashboard dependencies
cd dashboard
npm install
cd ..
```

### 2. Start the Dashboard
```bash
npm run dashboard
```

The dashboard will automatically:
- Build the React application (if needed)
- Start the API server on port 3001
- Launch the MCP server
- Open the dashboard at http://localhost:3001

## 📊 Dashboard Features

### Core Components

#### 1. **MCP Status Monitor**
- Real-time connection status
- Server health monitoring
- Quick start/stop controls

#### 2. **Sales Pipeline View**
- Visual pipeline with drag-and-drop stages
- Prospect management across stages
- Pipeline value tracking
- Conversion rate analytics

#### 3. **Email Review Interface**
- Preview generated emails
- Edit and approve before sending
- Batch operations
- Email scoring and quality metrics

#### 4. **Research Results Display**
- Company analysis and scoring
- Qualification metrics
- Research history
- Export capabilities

#### 5. **Communication Interface**
- Natural language commands
- Real-time chat with MCPs
- Command history
- Status feedback

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Top Bar - Metrics & Actions              │
├─────────────┬───────────────────────────────┬───────────────┤
│             │                               │               │
│   Sidebar   │        Main Content           │  Chat Panel   │
│  Navigation │                               │               │
│  MCP Status │                               │               │
│             │                               │               │
└─────────────┴───────────────────────────────┴───────────────┘
```

## 🔧 API Endpoints

The dashboard communicates with your MCP server through these endpoints:

### MCP Management
- `GET /api/mcp/status` - Check MCP server status
- `POST /api/mcp/start` - Start MCP server
- `POST /api/mcp/stop` - Stop MCP server
- `POST /api/mcp/command` - Send commands to MCP

### Data Endpoints
- `GET /api/prospects` - Get prospect research data
- `GET /api/emails` - Get email queue data

## 🎨 Customization

### Styling
The dashboard uses Tailwind CSS with a custom theme:

```javascript
// dashboard/tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { /* Custom primary colors */ },
        success: { /* Success state colors */ },
        warning: { /* Warning state colors */ },
        danger: { /* Error state colors */ }
      }
    }
  }
}
```

### Adding New Features

1. **Create New Components**
   ```bash
   # Add to dashboard/src/components/
   # Update routing in Dashboard.js
   # Add navigation in Sidebar.js
   ```

2. **Extend API**
   ```bash
   # Add routes to src/api-server.js
   # Update hooks in dashboard/src/hooks/
   ```

3. **Custom Data Sources**
   ```bash
   # Modify useProspects.js, useEmails.js
   # Update API endpoints
   ```

## 🔌 MCP Integration

### Current Integration
- **Sales MCP Server**: Full integration with research, email generation, and sending
- **Status Monitoring**: Real-time connection status
- **Command Interface**: Natural language commands

### Future MCP Servers
The dashboard is designed to support multiple MCP servers:

```javascript
// Example: Adding a new MCP server
const mcpServers = [
  { name: 'Sales MCP', status: 'connected' },
  { name: 'Marketing MCP', status: 'disconnected' },
  { name: 'Support MCP', status: 'connecting' }
];
```

## 📱 Usage Examples

### Natural Language Commands
```
"Research 5 new no-code platforms"
"Generate emails for all hot prospects"
"Move Bubble.io to qualified stage"
"Send approved emails"
"Show pipeline analytics"
```

### Email Workflow
1. **Generate**: Use MCP to create personalized emails
2. **Review**: Preview and edit in dashboard
3. **Approve**: Mark emails for sending
4. **Send**: Bulk send approved emails
5. **Track**: Monitor responses and follow-ups

### Pipeline Management
1. **Research**: Add prospects to research stage
2. **Contact**: Move to contacted after outreach
3. **Qualify**: Move qualified prospects forward
4. **Proposal**: Generate and send proposals
5. **Close**: Track closed deals

## 🛠️ Development

### Development Mode
```bash
# Terminal 1: Start API server
npm run dashboard-api

# Terminal 2: Start React dev server
npm run dashboard-dev
```

### Building for Production
```bash
npm run build-dashboard
```

### Environment Variables
```bash
# .env
DASHBOARD_PORT=3001
MCP_SERVER_PORT=3002
```

## 🔍 Troubleshooting

### Common Issues

1. **Dashboard won't start**
   ```bash
   # Check port availability
   lsof -i :3001
   
   # Rebuild dashboard
   npm run build-dashboard
   ```

2. **MCP server not connecting**
   ```bash
   # Check MCP server logs
   # Verify environment variables
   # Test MCP server directly
   npm start
   ```

3. **Build errors**
   ```bash
   # Clear dependencies
   rm -rf dashboard/node_modules
   cd dashboard && npm install
   ```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dashboard
```

## 📈 Performance

### Optimization Tips
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Cache API responses
- Optimize bundle size with code splitting

### Monitoring
- Real-time performance metrics
- Error tracking and logging
- User interaction analytics

## 🔐 Security

### Best Practices
- Validate all API inputs
- Implement rate limiting
- Use HTTPS in production
- Secure environment variables

### Authentication (Future)
```javascript
// Planned authentication system
const authConfig = {
  provider: 'oauth2',
  endpoints: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh'
  }
};
```

## 🚀 Deployment

### Production Setup
1. Build the dashboard: `npm run build-dashboard`
2. Set environment variables
3. Start the API server: `npm run dashboard-api`
4. Configure reverse proxy (nginx/Apache)
5. Set up SSL certificates

### Docker Deployment
```dockerfile
# Example Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build-dashboard
EXPOSE 3001
CMD ["npm", "run", "dashboard-api"]
```

## 📚 API Documentation

### MCP Command Format
```javascript
{
  "type": "command",
  "data": "Research 5 new no-code platforms",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Response Format
```javascript
{
  "success": true,
  "message": "Command executed successfully",
  "data": { /* Command results */ },
  "timestamp": "2024-01-15T10:30:05Z"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

ISC License - see LICENSE file for details

---

**Ready to launch your sales automation mission control?** 🚀

Start with: `npm run dashboard` 