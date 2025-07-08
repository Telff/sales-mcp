import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Edit, 
  Check, 
  X, 
  RefreshCw,
  Clock,
  User,
  Building,
  Star,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

const EmailReview = ({ emails, loading, onRefresh, prospects = [] }) => {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);

  // Use real emails data from MCP server
  const realEmails = emails.length > 0 ? emails : [];

  const filteredEmails = realEmails.filter(email => {
    return filterStatus === 'all' || email.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending Review', color: 'status-pending', icon: Clock },
      approved: { label: 'Approved', color: 'status-success', icon: Check },
      sent: { label: 'Sent', color: 'status-active', icon: Send },
      rejected: { label: 'Rejected', color: 'status-error', icon: X }
    };
    
    const config = statusConfig[status] || { label: status, color: 'status-inactive', icon: Mail };
    const Icon = config.icon;
    return (
      <span className={`status-badge ${config.color} flex items-center space-x-1`}>
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </span>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success-600 bg-success-100';
    if (score >= 60) return 'text-warning-600 bg-warning-100';
    return 'text-danger-600 bg-danger-100';
  };

  const handleEmailAction = async (email, action) => {
    if (actionLoading) return;
    
    setActionLoading(true);
    try {
      const response = await fetch('/api/email-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          emailId: email.id, 
          action: action 
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(`Failed to ${action} email`);
      console.error('Email action error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = (email) => {
    handleEmailAction(email, 'approve');
  };

  const handleReject = (email) => {
    handleEmailAction(email, 'reject');
  };

  const handleSend = (email) => {
    handleEmailAction(email, 'send');
  };

  const handleEdit = (email) => {
    setSelectedEmail(email);
    // For now, just show an alert - could implement inline editing
    toast.info('Email editing functionality coming soon');
  };

  const handleGenerateNewEmail = async () => {
    // Show a simple prompt to select a prospect
    const prospectNames = prospects.map(p => p.name).join(', ');
    const selectedProspectName = prompt(`Generate email for which prospect?\n\nAvailable prospects: ${prospectNames}`);
    
    if (!selectedProspectName) return;
    
    const prospect = prospects.find(p => 
      p.name.toLowerCase() === selectedProspectName.toLowerCase()
    );
    
    if (!prospect) {
      toast.error('Prospect not found');
      return;
    }

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
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to generate email');
      console.error('Email generation error:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Review Center</h1>
          <p className="text-gray-600">Preview and approve emails before sending</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleGenerateNewEmail}
            className="btn-primary flex items-center space-x-2"
            disabled={prospects.length === 0}
          >
            <Plus className="w-4 h-4" />
            <span>Generate Email</span>
          </button>
          <button
            onClick={onRefresh}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-40"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="sent">Sent</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="text-sm text-gray-600">
            {filteredEmails.length} emails found
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email List */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Queue</h3>
            <div className="space-y-3">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedEmail?.id === email.id
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedEmail(email)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{email.prospect}</span>
                    </div>
                    {getStatusBadge(email.status)}
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="text-sm text-gray-600">{email.recipient}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{email.title}</span>
                  </div>
                  
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    {email.subject}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(email.score)}`}>
                      <Star className="w-3 h-3 mr-1" />
                      {email.score}/100
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(email.generatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Email Preview */}
        <div className="lg:col-span-2">
          {selectedEmail ? (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(selectedEmail)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  {selectedEmail.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(selectedEmail)}
                        className="btn-success flex items-center space-x-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(selectedEmail)}
                        className="btn-danger flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                  {selectedEmail.status === 'approved' && (
                    <button
                      onClick={() => handleSend(selectedEmail)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To:</label>
                  <div className="text-sm text-gray-900">{selectedEmail.recipientEmail}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                  <div className="text-sm text-gray-900">{selectedEmail.subject}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content:</label>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
                      {selectedEmail.content}
                    </pre>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Building className="w-4 h-4" />
                      <span>{selectedEmail.prospect}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{selectedEmail.recipient}</span>
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(selectedEmail.score)}`}>
                      <Star className="w-3 h-3 mr-1" />
                      {selectedEmail.score}/100
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Generated: {new Date(selectedEmail.generatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card flex items-center justify-center h-64">
              <div className="text-center text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select an email to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{realEmails.length}</div>
          <div className="text-sm text-gray-600">Total Emails</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-warning-600">
            {realEmails.filter(e => e.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending Review</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-success-600">
            {realEmails.filter(e => e.status === 'approved').length}
          </div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">
            {realEmails.filter(e => e.status === 'sent').length}
          </div>
          <div className="text-sm text-gray-600">Sent</div>
        </div>
      </div>
    </div>
  );
};

export default EmailReview; 