import { useState, useEffect } from 'react';

export const useMCPConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [mcpStatus, setMcpStatus] = useState('disconnected');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/mcp/status');
        const data = await response.json();
        
        setIsConnected(data.connected);
        setMcpStatus(data.status);
      } catch (error) {
        console.error('MCP server check failed:', error);
        setIsConnected(false);
        setMcpStatus('error');
      }
    };

    checkConnection();
    
    // Poll for connection status every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    mcpStatus
  };
}; 