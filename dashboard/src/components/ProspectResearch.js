import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Eye, 
  Mail, 
  RefreshCw,
  Plus,
  Star,
  Users,
  TrendingUp,
  Globe,
  User,
  Phone,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProspectResearch = ({ prospects, loading, onRefresh, onMCPCommand }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedProspects, setExpandedProspects] = useState(new Set());

  // Use real prospects data from MCP server
  const realProspects = prospects.length > 0 ? prospects : [];

  const filteredProspects = realProspects.filter(prospect => {
    const matchesSearch = prospect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prospect.website.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesScore = filterScore === 'all' || 
                        (filterScore === 'high' && prospect.qualificationScore >= 80) ||
                        (filterScore === 'medium' && prospect.qualificationScore >= 60 && prospect.qualificationScore < 80) ||
                        (filterScore === 'low' && prospect.qualificationScore < 60);
    
    return matchesSearch && matchesScore;
  });

  const sortedProspects = [...filteredProspects].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.qualificationScore - a.qualificationScore;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'revenue':
        return b.revenue.localeCompare(a.revenue);
      default:
        return 0;
    }
  });

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success-600 bg-success-100';
    if (score >= 60) return 'text-warning-600 bg-warning-100';
    return 'text-danger-600 bg-danger-100';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      researched: { label: 'Researched', color: 'status-pending' },
      contacted: { label: 'Contacted', color: 'status-active' },
      qualified: { label: 'Qualified', color: 'status-success' },
      proposal: { label: 'Proposal', color: 'status-warning' },
      demo_scheduled: { label: 'Demo Scheduled', color: 'status-success' }
    };
    
    const config = statusConfig[status] || { label: status, color: 'status-inactive' };
    return <span className={`status-badge ${config.color}`}>{config.label}</span>;
  };

  const getContactPriorityIcon = (priority) => {
    if (priority === 'critical') return <AlertCircle className="w-3 h-3 text-red-500" />;
    if (priority === 'high') return <User className="w-3 h-3 text-orange-500" />;
    if (priority === 'medium') return <User className="w-3 h-3 text-yellow-500" />;
    return <User className="w-3 h-3 text-gray-400" />;
  };

  const getContactVerificationIcon = (contact) => {
    if (contact.recommendedForOutreach) return <CheckCircle className="w-3 h-3 text-green-500" />;
    if (contact.email && contact.emailValidation?.isValid) return <Mail className="w-3 h-3 text-blue-500" />;
    if (contact.email) return <Mail className="w-3 h-3 text-yellow-500" />;
    return <AlertCircle className="w-3 h-3 text-red-500" />;
  };

  const getContactQualityColor = (qualityScore) => {
    if (!qualityScore) return 'text-gray-400';
    
    const percentage = qualityScore.percentage || 0;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOutreachRiskBadge = (risk) => {
    const riskConfig = {
      'low': { label: 'Low Risk', color: 'bg-green-100 text-green-800' },
      'medium': { label: 'Medium Risk', color: 'bg-yellow-100 text-yellow-800' },
      'high': { label: 'High Risk', color: 'bg-red-100 text-red-800' }
    };
    
    const config = riskConfig[risk] || riskConfig['high'];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const toggleProspectExpansion = (prospectId) => {
    const newExpanded = new Set(expandedProspects);
    if (newExpanded.has(prospectId)) {
      newExpanded.delete(prospectId);
    } else {
      newExpanded.add(prospectId);
    }
    setExpandedProspects(newExpanded);
  };

  const handleGenerateEmailForContact = async (prospect, contact) => {
    if (actionLoading) return;
    
    setActionLoading(true);
    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prospectName: prospect.name,
          contactName: contact.name,
          contactTitle: contact.title,
          contactEmail: contact.email
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Email generated for ${contact.name} at ${prospect.name}`);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Email generation failed:', error);
      toast.error('Failed to generate email');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResearchNew = async () => {
    try {
      const command = prompt('Enter research command (e.g., "research 5 no-code platforms"):');
      if (command && onMCPCommand) {
        await onMCPCommand(command);
      }
    } catch (error) {
      console.error('Research command failed:', error);
    }
  };

  const handleGenerateEmail = async (prospect) => {
    if (actionLoading) return;
    
    setActionLoading(true);
    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prospectName: prospect.name 
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Email generation failed:', error);
      toast.error('Failed to generate email');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (prospect) => {
    // For now, show details in a modal or navigate to details page
    alert(`Viewing details for ${prospect.name}:\n\n` +
          `Website: ${prospect.website}\n` +
          `Platform Type: ${typeof prospect.platformType === 'object' ? prospect.platformType.type : prospect.platformType}\n` +
          `Score: ${prospect.qualificationScore}/100\n` +
          `Status: ${prospect.status}\n` +
          `Next Action: ${prospect.nextAction || 'Research needed'}`);
  };

  const handleExportProspects = () => {
    try {
      const dataToExport = {
        prospects: sortedProspects,
        filters: { searchTerm, filterScore, sortBy },
        exported_at: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `prospects-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prospect Research</h1>
          <p className="text-gray-600">Manage and analyze your prospect research data</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleResearchNew}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Research New</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search prospects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <select
            value={filterScore}
            onChange={(e) => setFilterScore(e.target.value)}
            className="input-field w-40"
          >
            <option value="all">All Scores</option>
            <option value="high">High (80+)</option>
            <option value="medium">Medium (60-79)</option>
            <option value="low">Low (&lt;60)</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field w-40"
          >
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
            <option value="revenue">Sort by Revenue</option>
          </select>
          <button 
            onClick={handleExportProspects}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Prospects Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Company</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Platform Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Score</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Contacts</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Size</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Revenue</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedProspects.map((prospect) => {
                const contacts = prospect.researchData?.contacts || [];
                const isExpanded = expandedProspects.has(prospect.id);
                
                return (
                  <React.Fragment key={prospect.id}>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{prospect.name}</div>
                          <div className="text-sm text-gray-500 flex items-center space-x-1">
                            <Globe className="w-3 h-3" />
                            <span>{prospect.website || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">{typeof prospect.platformType === 'object' ? prospect.platformType.type : prospect.platformType || 'Unknown'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(prospect.qualificationScore)}`}>
                          <Star className="w-3 h-3 mr-1" />
                          {prospect.qualificationScore}/100
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm text-gray-900">
                            {contacts.length > 0 ? (
                              <div className="flex items-center space-x-1">
                                <Users className="w-3 h-3" />
                                <span>{contacts.length} contact{contacts.length !== 1 ? 's' : ''}</span>
                                <button
                                  onClick={() => toggleProspectExpansion(prospect.id)}
                                  className="text-blue-600 hover:text-blue-700 text-xs"
                                >
                                  {isExpanded ? 'Hide' : 'Show'}
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 text-gray-400">
                                <AlertCircle className="w-3 h-3" />
                                <span>No contacts</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900 flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{prospect.employees || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900 flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{prospect.revenue || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(prospect.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(prospect)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleGenerateEmail(prospect)}
                            disabled={actionLoading}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                            title="Generate Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expandable Contact Details */}
                    {isExpanded && contacts.length > 0 && (
                      <tr className="bg-blue-50">
                        <td colSpan="8" className="py-3 px-4">
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Decision Makers & Contacts:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {contacts.map((contact, idx) => (
                                <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      {getContactPriorityIcon(contact.priority)}
                                      <div>
                                        <div className="font-medium text-gray-900 text-sm">
                                          {contact.name}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                          {contact.title}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      {getContactVerificationIcon(contact)}
                                      {contact.qualityScore && (
                                        <span className={`text-xs font-medium ${getContactQualityColor(contact.qualityScore)}`}>
                                          {contact.qualityScore.percentage}%
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {contact.email && (
                                    <div className="flex items-center space-x-1 mb-1">
                                      <Mail className="w-3 h-3 text-gray-400" />
                                      <span className="text-xs text-gray-600">{contact.email}</span>
                                      {contact.emailValidation?.isValid && (
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                      )}
                                    </div>
                                  )}
                                  
                                  {contact.linkedin && (
                                    <div className="flex items-center space-x-1 mb-1">
                                      <ExternalLink className="w-3 h-3 text-gray-400" />
                                      <a 
                                        href={contact.linkedin} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:text-blue-700"
                                      >
                                        LinkedIn
                                      </a>
                                    </div>
                                  )}

                                  {/* Quality Score Details */}
                                  {contact.qualityScore && (
                                    <div className="mb-2">
                                      <div className="text-xs text-gray-500 mb-1">
                                        Quality Score: {contact.qualityScore.score}/{contact.qualityScore.maxScore}
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-1">
                                        <div 
                                          className={`h-1 rounded-full ${contact.qualityScore.percentage >= 80 ? 'bg-green-500' : contact.qualityScore.percentage >= 60 ? 'bg-blue-500' : contact.qualityScore.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                          style={{ width: `${contact.qualityScore.percentage}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Outreach Risk */}
                                  {contact.outreachRisk && (
                                    <div className="mb-2">
                                      {getOutreachRiskBadge(contact.outreachRisk)}
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="text-xs text-gray-500">
                                      <span className="capitalize">{contact.priority} priority</span>
                                      {contact.recommendedForOutreach && (
                                        <span className="ml-2 text-green-600">✓ Ready</span>
                                      )}
                                    </div>
                                    
                                    {contact.email && contact.emailValidation?.isValid ? (
                                      <button
                                        onClick={() => handleGenerateEmailForContact(prospect, contact)}
                                        disabled={actionLoading}
                                        className={`text-xs px-2 py-1 rounded disabled:opacity-50 ${
                                          contact.recommendedForOutreach 
                                            ? 'bg-green-600 text-white hover:bg-green-700' 
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                      >
                                        {contact.recommendedForOutreach ? 'Generate Email' : 'Email (Risk)'}
                                      </button>
                                    ) : (
                                      <span className="text-xs text-gray-400">
                                        Research needed
                                      </span>
                                    )}
                                  </div>
                                  
                                  {contact.note && (
                                    <div className="text-xs text-gray-500 mt-1 italic">
                                      {contact.note}
                                    </div>
                                  )}

                                  {contact.emailValidation?.deliverability?.reason && (
                                    <div className="text-xs text-gray-400 mt-1">
                                      {contact.emailValidation.deliverability.reason}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{sortedProspects.length}</div>
          <div className="text-sm text-gray-600">Total Prospects</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-success-600">
            {sortedProspects.filter(p => p.qualificationScore >= 80).length}
          </div>
          <div className="text-sm text-gray-600">High Priority</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-warning-600">
            {sortedProspects.filter(p => p.status === 'contacted').length}
          </div>
          <div className="text-sm text-gray-600">Contacted</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">
            {sortedProspects.length > 0 ? Math.round(sortedProspects.reduce((acc, p) => acc + (p.qualificationScore || 0), 0) / sortedProspects.length) : 0}
          </div>
          <div className="text-sm text-gray-600">Avg Score</div>
        </div>
      </div>
    </div>
  );
};

export default ProspectResearch; 