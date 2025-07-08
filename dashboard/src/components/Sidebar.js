import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  Mail, 
  TrendingUp, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Server,
  Activity
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = ({ collapsed, onToggle, mcpStatus }) => {
  const navigation = [
    { name: 'Overview', href: '/overview', icon: LayoutDashboard },
    { name: 'Research', href: '/research', icon: Search },
    { name: 'Emails', href: '/emails', icon: Mail },
    { name: 'Pipeline', href: '/pipeline', icon: TrendingUp },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-success-600';
      case 'connecting':
        return 'text-warning-600';
      case 'disconnected':
        return 'text-danger-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={clsx(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Sales MCP</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* MCP Status */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Server className={clsx("w-4 h-4", getStatusColor(mcpStatus))} />
          {!collapsed && (
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">MCP Server</div>
              <div className={clsx("text-xs", getStatusColor(mcpStatus))}>
                {getStatusText(mcpStatus)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                clsx(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-700 hover:bg-gray-100"
                )
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(
              "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary-100 text-primary-700"
                : "text-gray-700 hover:bg-gray-100"
            )
          }
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar; 