import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Mail, 
  Target,
  RefreshCw,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Overview = ({ prospects, emails, mcpStatus, onRefresh }) => {
  // Calculate pipeline data from real prospects
  const pipelineData = [
    { name: 'Research', value: prospects.filter(p => p.status === 'researched').length, color: '#3B82F6' },
    { name: 'Contacted', value: prospects.filter(p => p.status === 'contacted').length, color: '#F59E0B' },
    { name: 'Qualified', value: prospects.filter(p => p.status === 'qualified').length, color: '#10B981' },
    { name: 'Proposal', value: prospects.filter(p => p.status === 'proposal').length, color: '#8B5CF6' },
    { name: 'Closed', value: prospects.filter(p => p.status === 'closed').length, color: '#EF4444' },
  ];

  // Calculate activity data from real emails
  const activityData = [
    { name: 'Mon', emails: emails.filter(e => e.created_at && new Date(e.created_at).getDay() === 1).length, responses: 0 },
    { name: 'Tue', emails: emails.filter(e => e.created_at && new Date(e.created_at).getDay() === 2).length, responses: 0 },
    { name: 'Wed', emails: emails.filter(e => e.created_at && new Date(e.created_at).getDay() === 3).length, responses: 0 },
    { name: 'Thu', emails: emails.filter(e => e.created_at && new Date(e.created_at).getDay() === 4).length, responses: 0 },
    { name: 'Fri', emails: emails.filter(e => e.created_at && new Date(e.created_at).getDay() === 5).length, responses: 0 },
    { name: 'Sat', emails: emails.filter(e => e.created_at && new Date(e.created_at).getDay() === 6).length, responses: 0 },
    { name: 'Sun', emails: emails.filter(e => e.created_at && new Date(e.created_at).getDay() === 0).length, responses: 0 },
  ];

  // Generate recent activity from real data
  const recentActivity = [
    ...prospects.slice(0, 2).map((prospect, idx) => ({
      id: idx + 1,
      type: 'prospect_researched',
      title: `Research completed for ${prospect.name}`,
      description: `Qualification score: ${prospect.qualificationScore}/100 - ${prospect.qualificationScore >= 80 ? 'High' : prospect.qualificationScore >= 60 ? 'Medium' : 'Low'} priority prospect`,
      time: `${idx + 1} hour${idx === 0 ? '' : 's'} ago`,
      status: 'completed'
    })),
    ...emails.slice(0, 2).map((email, idx) => ({
      id: idx + 3,
      type: 'email_generated',
      title: `Email generated for ${email.prospect_name || 'prospect'}`,
      description: email.subject,
      time: `${idx + 2} hours ago`,
      status: 'pending'
    }))
  ];

  // Show placeholder activity if no real data
  if (recentActivity.length === 0) {
    recentActivity.push({
      id: 1,
      type: 'system',
      title: 'No recent activity',
      description: 'Use the chat panel to research prospects or generate emails',
      time: 'now',
      status: 'pending'
    });
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'email_sent':
        return <Mail className="w-4 h-4 text-success-600" />;
      case 'prospect_researched':
        return <Users className="w-4 h-4 text-primary-600" />;
      case 'email_generated':
        return <Target className="w-4 h-4 text-warning-600" />;
      case 'response_received':
        return <CheckCircle className="w-4 h-4 text-success-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
      case 'completed':
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-danger-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Monitor your sales automation performance</p>
        </div>
        <button
          onClick={onRefresh}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Prospects</p>
              <p className="text-2xl font-bold text-gray-900">{prospects.length}</p>
              <p className="text-sm text-gray-500">{prospects.length === 0 ? 'No data yet' : 'Real-time data'}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Emails Generated</p>
              <p className="text-2xl font-bold text-gray-900">{emails.length}</p>
              <p className="text-sm text-gray-500">{emails.length === 0 ? 'No data yet' : 'Real-time data'}</p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Score</p>
              <p className="text-2xl font-bold text-gray-900">{prospects.length > 0 ? Math.round(prospects.reduce((sum, p) => sum + (p.qualificationScore || 0), 0) / prospects.length) : 0}</p>
              <p className="text-sm text-gray-500">Qualification score</p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">MCP Status</p>
              <p className="text-2xl font-bold text-gray-900">{mcpStatus === 'connected' ? '✅' : mcpStatus === 'connecting' ? '⏳' : '❌'}</p>
              <p className="text-sm text-gray-500">{mcpStatus}</p>
            </div>
            <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-danger-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pipelineData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {pipelineData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="emails" fill="#3B82F6" name="Emails Sent" />
                <Bar dataKey="responses" fill="#10B981" name="Responses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(activity.status)}
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview; 