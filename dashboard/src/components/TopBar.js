import React, { useState } from 'react';
import { 
  MessageSquare, 
  Bell, 
  User,
  TrendingUp,
  Users,
  Mail,
  Target,
  Trash2,
  RefreshCw,
  Download
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const TopBar = ({ mcpStatus, onToggleChat, chatPanelOpen, onClearData, onRefresh, prospects = [], emails = [] }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  // Calculate real metrics from data
  const metrics = [
    { 
      label: 'Active Prospects', 
      value: prospects.length.toString(), 
      icon: Users, 
      color: 'text-primary-600' 
    },
    { 
      label: 'Emails Generated', 
      value: emails.length.toString(), 
      icon: Mail, 
      color: 'text-success-600' 
    },
    { 
      label: 'Avg Score', 
      value: prospects.length > 0 
        ? Math.round(prospects.reduce((sum, p) => sum + (p.qualificationScore || 0), 0) / prospects.length) + '%'
        : '0%', 
      icon: TrendingUp, 
      color: 'text-warning-600' 
    },
    { 
      label: 'Pipeline Value', 
      value: prospects.length > 0 ? `$${prospects.length * 50}K` : '$0', 
      icon: Target, 
      color: 'text-danger-600' 
    },
  ];

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/clear-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const result = await response.json();
        
        if (result.success) {
          toast.success('All data cleared successfully');
          if (onClearData) {
            onClearData();
          }
        } else {
          toast.error('Failed to clear data');
        }
      } catch (error) {
        toast.error('Failed to clear data');
        console.error('Clear data error:', error);
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    try {
      const dataToExport = {
        prospects: prospects,
        emails: emails,
        exported_at: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `sales-mcp-data-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
      console.error('Export error:', error);
    }
  };

  const notifications = [
    { id: 1, message: 'New prospect research completed', type: 'success', time: '2 mins ago' },
    { id: 2, message: 'Email generation ready for review', type: 'info', time: '5 mins ago' },
    { id: 3, message: 'Pipeline update needed', type: 'warning', time: '1 hour ago' }
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Metrics */}
        <div className="flex items-center space-x-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="flex items-center space-x-2">
                <Icon className={clsx("w-5 h-5", metric.color)} />
                <div>
                  <div className="text-sm font-medium text-gray-900">{metric.value}</div>
                  <div className="text-xs text-gray-500">{metric.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="p-2 rounded-lg hover:bg-green-100 hover:text-green-700 transition-colors"
            title="Export data"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* Clear Data Button */}
          <button
            onClick={handleClearData}
            className="p-2 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors"
            title="Clear all data"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger-500 rounded-full text-xs text-white flex items-center justify-center">
                {notifications.length}
              </span>
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'success' ? 'bg-green-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-200">
                  <button className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Chat Toggle */}
          <button
            onClick={onToggleChat}
            className={clsx(
              "p-2 rounded-lg transition-colors",
              chatPanelOpen 
                ? "bg-primary-100 text-primary-700" 
                : "hover:bg-gray-100 text-gray-600"
            )}
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* User Menu */}
          <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm font-medium text-gray-900">Admin</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar; 