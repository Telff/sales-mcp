import React, { useState } from 'react';
import { 
  Users, 
  Mail, 
  Target,
  RefreshCw,
  Plus,
  ArrowRight,
  Phone,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const Pipeline = ({ prospects, emails, onRefresh }) => {
  const [actionLoading, setActionLoading] = useState(false);

  // Create pipeline stages from real prospect data
  const pipelineStages = [
    {
      id: 'research',
      name: 'Research',
      color: 'bg-blue-500',
      prospects: prospects.filter(p => p.status === 'researched' || !p.status).map(p => ({
        id: p.id,
        name: p.name,
        contact: p.contact || 'Contact needed',
        title: p.title || 'Research contacts',
        score: p.qualificationScore || 0,
        lastActivity: p.lastContacted || new Date().toISOString().split('T')[0],
        nextAction: p.nextAction || 'Generate email',
        value: p.revenue || 'Unknown'
      }))
    },
    {
      id: 'contacted',
      name: 'Contacted',
      color: 'bg-yellow-500',
      prospects: prospects.filter(p => p.status === 'contacted').map(p => ({
        id: p.id,
        name: p.name,
        contact: p.contact || 'Contact needed',
        title: p.title || 'Decision maker',
        score: p.qualificationScore || 0,
        lastActivity: p.lastContacted || new Date().toISOString().split('T')[0],
        nextAction: 'Follow up',
        value: p.revenue || 'Unknown'
      }))
    },
    {
      id: 'qualified',
      name: 'Qualified',
      color: 'bg-green-500',
      prospects: prospects.filter(p => p.status === 'qualified').map(p => ({
        id: p.id,
        name: p.name,
        contact: p.contact || 'Contact needed',
        title: p.title || 'Decision maker',
        score: p.qualificationScore || 0,
        lastActivity: p.lastContacted || new Date().toISOString().split('T')[0],
        nextAction: 'Schedule demo',
        value: p.revenue || 'Unknown'
      }))
    },
    {
      id: 'proposal',
      name: 'Proposal',
      color: 'bg-purple-500',
      prospects: prospects.filter(p => p.status === 'proposal').map(p => ({
        id: p.id,
        name: p.name,
        contact: p.contact || 'Contact needed',
        title: p.title || 'Decision maker',
        score: p.qualificationScore || 0,
        lastActivity: p.lastContacted || new Date().toISOString().split('T')[0],
        nextAction: 'Send proposal',
        value: p.revenue || 'Unknown'
      }))
    },
    {
      id: 'demo_scheduled',
      name: 'Demo Scheduled',
      color: 'bg-indigo-500',
      prospects: prospects.filter(p => p.status === 'demo_scheduled').map(p => ({
        id: p.id,
        name: p.name,
        contact: p.contact || 'Contact needed',
        title: p.title || 'Decision maker',
        score: p.qualificationScore || 0,
        lastActivity: p.lastContacted || new Date().toISOString().split('T')[0],
        nextAction: 'Prepare demo',
        value: p.revenue || 'Unknown'
      }))
    },
    {
      id: 'closed',
      name: 'Closed',
      color: 'bg-red-500',
      prospects: prospects.filter(p => p.status === 'closed').map(p => ({
        id: p.id,
        name: p.name,
        contact: p.contact || 'Contact needed',
        title: p.title || 'Decision maker',
        score: p.qualificationScore || 0,
        lastActivity: p.lastContacted || new Date().toISOString().split('T')[0],
        nextAction: 'Contract signed',
        value: p.revenue || 'Unknown'
      }))
    }
  ];

  // Add empty state message if no prospects
  if (prospects.length === 0) {
    pipelineStages[0].prospects.push({
      id: 'empty',
      name: 'No prospects yet',
      contact: 'Use chat panel to research companies',
      title: 'Try: "Research 5 new no-code platforms"',
      score: 0,
      lastActivity: new Date().toISOString().split('T')[0],
      nextAction: 'Research prospects',
      value: 'N/A'
    });
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success-600 bg-success-100';
    if (score >= 60) return 'text-warning-600 bg-warning-100';
    return 'text-danger-600 bg-danger-100';
  };

  const getNextActionIcon = (action) => {
    if (action.includes('email')) return <Mail className="w-3 h-3" />;
    if (action.includes('call') || action.includes('demo')) return <Phone className="w-3 h-3" />;
    if (action.includes('proposal')) return <Target className="w-3 h-3" />;
    if (action.includes('research')) return <Users className="w-3 h-3" />;
    if (action.includes('signed')) return <CheckCircle className="w-3 h-3" />;
    return <Clock className="w-3 h-3" />;
  };

  const handleMoveProspect = async (prospectId, fromStage, toStage) => {
    if (actionLoading) return;
    
    setActionLoading(true);
    try {
      const response = await fetch('/api/prospect-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prospectId: prospectId,
          action: 'move_stage',
          data: { newStatus: toStage }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Prospect moved to ${toStage} stage`);
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to move prospect');
      console.error('Move prospect error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddProspect = (stageId) => {
    // For now, just show a prompt
    toast.info('Add prospect functionality coming soon. Use the research tab to add new prospects.');
  };

  const handleViewProspect = (prospect) => {
    if (prospect.id === 'empty') return;
    
    // For now, show details in an alert
    const details = `Prospect Details:\n\n` +
                   `Company: ${prospect.name}\n` +
                   `Contact: ${prospect.contact}\n` +
                   `Title: ${prospect.title}\n` +
                   `Score: ${prospect.score}/100\n` +
                   `Last Activity: ${prospect.lastActivity}\n` +
                   `Next Action: ${prospect.nextAction}\n` +
                   `Value: ${prospect.value}`;
    
    alert(details);
  };

  const handleUpdateValue = async (prospectId, currentValue) => {
    if (actionLoading) return;
    
    const newValue = prompt(`Update deal value for prospect:\n\nCurrent value: ${currentValue}\nEnter new value (e.g., $50K, $100K):`, currentValue);
    
    if (!newValue || newValue === currentValue) return;
    
    setActionLoading(true);
    try {
      const response = await fetch('/api/prospect-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prospectId: prospectId,
          action: 'update_value',
          data: { value: newValue }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Deal value updated successfully');
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to update deal value');
      console.error('Update value error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const totalValue = pipelineStages.reduce((acc, stage) => {
    return acc + stage.prospects.reduce((stageAcc, prospect) => {
      // Skip empty state and unknown values
      if (prospect.id === 'empty' || prospect.value === 'Unknown' || prospect.value === 'N/A') return stageAcc;
      // Parse value if it's a currency string
      if (typeof prospect.value === 'string' && prospect.value.includes('$')) {
        return stageAcc + parseInt(prospect.value.replace('$', '').replace('K', '000').replace('M', '000000'));
      }
      return stageAcc;
    }, 0);
  }, 0);

  const totalProspects = pipelineStages.reduce((acc, stage) => acc + stage.prospects.length, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600">Track prospects through your sales process</p>
        </div>
        <button
          onClick={onRefresh}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{totalProspects}</div>
          <div className="text-sm text-gray-600">Total Prospects</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">
            ${(totalValue / 1000).toFixed(0)}K
          </div>
          <div className="text-sm text-gray-600">Pipeline Value</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-success-600">
            {pipelineStages.filter(s => s.id === 'qualified' || s.id === 'proposal' || s.id === 'demo_scheduled').reduce((acc, stage) => acc + stage.prospects.length, 0)}
          </div>
          <div className="text-sm text-gray-600">Qualified Prospects</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-danger-600">
            {pipelineStages.find(s => s.id === 'closed')?.prospects.length || 0}
          </div>
          <div className="text-sm text-gray-600">Closed Deals</div>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="overflow-x-auto">
        <div className="flex space-x-4 min-w-max p-4">
          {pipelineStages.map((stage) => (
            <div key={stage.id} className="w-80 flex-shrink-0">
              <div className="card">
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {stage.prospects.length}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddProspect(stage.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Stage Value */}
                <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Stage Value</div>
                  <div className="text-lg font-bold text-gray-900">
                    ${stage.prospects.reduce((acc, p) => {
                      if (p.id === 'empty' || p.value === 'Unknown' || p.value === 'N/A') return acc;
                      if (typeof p.value === 'string' && p.value.includes('$')) {
                        return acc + parseInt(p.value.replace('$', '').replace('K', '000').replace('M', '000000'));
                      }
                      return acc;
                    }, 0) / 1000}K
                  </div>
                </div>

                {/* Prospects */}
                <div className="space-y-3">
                  {stage.prospects.map((prospect) => (
                    <div
                      key={prospect.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer"
                      onClick={() => handleViewProspect(prospect)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-gray-900">{prospect.name}</div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(prospect.score)}`}>
                          {prospect.score}/100
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {prospect.contact} • {prospect.title}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span 
                          className="cursor-pointer hover:text-blue-600 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (prospect.id !== 'empty') {
                              handleUpdateValue(prospect.id, prospect.value);
                            }
                          }}
                          title="Click to edit value"
                        >
                          Value: {prospect.value}
                        </span>
                        <span>{prospect.lastActivity}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-xs text-gray-600">
                        {getNextActionIcon(prospect.nextAction)}
                        <span>{prospect.nextAction}</span>
                      </div>

                      {/* Move Actions */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                        <div className="flex space-x-1">
                          {stage.id !== 'research' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const prevStage = pipelineStages[pipelineStages.findIndex(s => s.id === stage.id) - 1];
                                handleMoveProspect(prospect.id, stage.id, prevStage.id);
                              }}
                              disabled={actionLoading}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                              title="Move Left"
                            >
                              <ArrowRight className="w-3 h-3 rotate-180" />
                            </button>
                          )}
                          {stage.id !== 'closed' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextStage = pipelineStages[pipelineStages.findIndex(s => s.id === stage.id) + 1];
                                handleMoveProspect(prospect.id, stage.id, nextStage.id);
                              }}
                              disabled={actionLoading}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                              title="Move Right"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProspect(prospect);
                          }}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Conversion Rates</h3>
          <div className="space-y-3">
            {pipelineStages.slice(0, -1).map((stage, index) => {
              const nextStage = pipelineStages[index + 1];
              const conversionRate = nextStage ? 
                ((nextStage.prospects.length / (stage.prospects.length || 1)) * 100).toFixed(1) : 0;
              
              return (
                <div key={stage.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <span className="text-sm text-gray-700">{stage.name}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{nextStage?.name || 'Closed'}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {conversionRate}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {prospects.length > 0 ? (
              prospects.slice(0, 3).map((prospect, idx) => (
                <div key={prospect.id} className="flex items-center space-x-3 p-2 rounded-lg bg-blue-50">
                  <Users className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Research completed for {prospect.name}</div>
                    <div className="text-xs text-gray-500">Score: {prospect.qualificationScore}/100</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                <Activity className="w-4 h-4 text-gray-400" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500">No recent activity</div>
                  <div className="text-xs text-gray-400">Use the chat panel to research prospects</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pipeline; 