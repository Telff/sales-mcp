import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ChatPanel from './ChatPanel';
import Overview from './Overview';
import ProspectResearch from './ProspectResearch';
import EmailReview from './EmailReview';
import Pipeline from './Pipeline';
import { useMCPConnection } from '../hooks/useMCPConnection';
import { useProspects } from '../hooks/useProspects';
import { useEmails } from '../hooks/useEmails';

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatPanelOpen, setChatPanelOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { mcpStatus } = useMCPConnection();
  const { prospects, loadingProspects, refreshProspects } = useProspects();
  const { emails, loadingEmails, refreshEmails } = useEmails();

  useEffect(() => {
    // Set default route if on root
    if (location.pathname === '/') {
      navigate('/overview');
    }
  }, [location.pathname, navigate]);

  const handleMCPCommand = async (command) => {
    try {
      console.log('MCP Command:', command);
      
      const response = await fetch('/api/mcp/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'Command executed successfully');
        
        // Refresh data if research command was executed
        if (command.toLowerCase().includes('research')) {
          refreshProspects();
          refreshEmails();
        }
        
        return result.message || 'Command executed successfully';
      } else {
        toast.error(result.error || 'Command failed');
        throw new Error(result.error || 'Command failed');
      }
    } catch (error) {
      toast.error('Failed to send command');
      console.error('MCP Command Error:', error);
      throw error;
    }
  };

  const handleClearData = () => {
    refreshProspects();
    refreshEmails();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mcpStatus={mcpStatus}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar 
          mcpStatus={mcpStatus}
          onToggleChat={() => setChatPanelOpen(!chatPanelOpen)}
          chatPanelOpen={chatPanelOpen}
          onClearData={handleClearData}
          onRefresh={() => {
            refreshProspects();
            refreshEmails();
          }}
          prospects={prospects}
          emails={emails}
        />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route 
                path="/overview" 
                element={
                  <Overview 
                    prospects={prospects}
                    emails={emails}
                    mcpStatus={mcpStatus}
                    onRefresh={() => {
                      refreshProspects();
                      refreshEmails();
                    }}
                  />
                } 
              />
              <Route 
                path="/research" 
                element={
                  <ProspectResearch 
                    prospects={prospects}
                    loading={loadingProspects}
                    onRefresh={refreshProspects}
                    onMCPCommand={handleMCPCommand}
                  />
                } 
              />
              <Route 
                path="/emails" 
                element={
                  <EmailReview 
                    emails={emails}
                    loading={loadingEmails}
                    onRefresh={refreshEmails}
                    prospects={prospects}
                  />
                } 
              />
              <Route 
                path="/pipeline" 
                element={
                  <Pipeline 
                    prospects={prospects}
                    emails={emails}
                    onRefresh={() => {
                      refreshProspects();
                      refreshEmails();
                    }}
                  />
                } 
              />
            </Routes>
          </div>

          {/* Right Chat Panel */}
          {chatPanelOpen && (
            <ChatPanel 
              onSendCommand={handleMCPCommand}
              mcpStatus={mcpStatus}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 