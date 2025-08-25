'use client';

import React, { useState, useEffect } from 'react';
import { FiActivity, FiTrendingUp, FiAlertCircle, FiCheck, FiX, FiRefreshCw, FiSettings, FiExternalLink } from 'react-icons/fi';
import { SiStripe, SiSupabase, SiGithub } from 'react-icons/si';

interface IntegrationMetrics {
  stripe: {
    totalPayments: number;
    totalRevenue: number;
    activeSubscriptions: number;
    failedPayments: number;
  };
  supabase: {
    totalTables: number;
    totalRecords: number;
    activeConnections: number;
    queryCount: number;
  };
  github: {
    totalRepositories: number;
    totalCommits: number;
    openIssues: number;
    openPullRequests: number;
  };
}

interface IntegrationDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const IntegrationDashboard: React.FC<IntegrationDashboardProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'stripe' | 'supabase' | 'github'>('overview');
  const [metrics, setMetrics] = useState<IntegrationMetrics>({
    stripe: { totalPayments: 0, totalRevenue: 0, activeSubscriptions: 0, failedPayments: 0 },
    supabase: { totalTables: 0, totalRecords: 0, activeConnections: 0, queryCount: 0 },
    github: { totalRepositories: 0, totalCommits: 0, openIssues: 0, openPullRequests: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    stripe: 'disconnected',
    supabase: 'disconnected',
    github: 'disconnected'
  });

  useEffect(() => {
    if (isOpen) {
      fetchMetrics();
      checkConnectionStatus();
    }
  }, [isOpen]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Simulate fetching real metrics from APIs
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics({
        stripe: {
          totalPayments: 1247,
          totalRevenue: 45678.90,
          activeSubscriptions: 89,
          failedPayments: 12
        },
        supabase: {
          totalTables: 15,
          totalRecords: 45678,
          activeConnections: 23,
          queryCount: 12345
        },
        github: {
          totalRepositories: 8,
          totalCommits: 234,
          openIssues: 15,
          openPullRequests: 7
        }
      });
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      // Simulate checking connection status
      setConnectionStatus({
        stripe: 'connected',
        supabase: 'connected',
        github: 'connected'
      });
    } catch (error) {
      console.error('Failed to check connection status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'disconnected': return 'text-red-500';
      case 'error': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <FiCheck className="w-4 h-4" />;
      case 'disconnected': return <FiX className="w-4 h-4" />;
      case 'error': return <FiAlertCircle className="w-4 h-4" />;
      default: return <FiActivity className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-11/12 max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <FiActivity className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-white">Integration Dashboard</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchMetrics}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-md transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'overview', label: 'Overview', icon: FiActivity },
            { id: 'stripe', label: 'Stripe', icon: SiStripe },
            { id: 'supabase', label: 'Supabase', icon: SiSupabase },
            { id: 'github', label: 'GitHub', icon: SiGithub }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Connection Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Stripe', status: connectionStatus.stripe, icon: SiStripe, color: 'text-purple-500' },
                  { name: 'Supabase', status: connectionStatus.supabase, icon: SiSupabase, color: 'text-green-500' },
                  { name: 'GitHub', status: connectionStatus.github, icon: SiGithub, color: 'text-gray-400' }
                ].map((integration) => (
                  <div key={integration.name} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <integration.icon className={`w-6 h-6 ${integration.color}`} />
                        <span className="text-white font-medium">{integration.name}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${getStatusColor(integration.status)}`}>
                        {getStatusIcon(integration.status)}
                        <span className="text-sm capitalize">{integration.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <SiStripe className="w-8 h-8 text-purple-500" />
                    <div>
                      <p className="text-gray-400 text-sm">Total Revenue</p>
                      <p className="text-white text-xl font-semibold">${metrics.stripe.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <SiSupabase className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-gray-400 text-sm">Total Records</p>
                      <p className="text-white text-xl font-semibold">{metrics.supabase.totalRecords.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <SiGithub className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Repositories</p>
                      <p className="text-white text-xl font-semibold">{metrics.github.totalRepositories}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <FiTrendingUp className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-gray-400 text-sm">Active Subscriptions</p>
                      <p className="text-white text-xl font-semibold">{metrics.stripe.activeSubscriptions}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { type: 'payment', message: 'Payment processed successfully', time: '2 minutes ago', status: 'success' },
                    { type: 'database', message: 'New user registered', time: '5 minutes ago', status: 'success' },
                    { type: 'repository', message: 'Pull request created', time: '10 minutes ago', status: 'info' },
                    { type: 'payment', message: 'Subscription renewed', time: '15 minutes ago', status: 'success' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-700 rounded-md">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-500' : 
                        activity.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-white text-sm">{activity.message}</p>
                        <p className="text-gray-400 text-xs">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stripe' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total Payments</p>
                  <p className="text-white text-2xl font-semibold">{metrics.stripe.totalPayments}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-white text-2xl font-semibold">${metrics.stripe.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Active Subscriptions</p>
                  <p className="text-white text-2xl font-semibold">{metrics.stripe.activeSubscriptions}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Failed Payments</p>
                  <p className="text-white text-2xl font-semibold text-red-500">{metrics.stripe.failedPayments}</p>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-4">Payment Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="p-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                    Create Payment Intent
                  </button>
                  <button className="p-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                    View Customers
                  </button>
                  <button className="p-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                    Manage Subscriptions
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'supabase' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total Tables</p>
                  <p className="text-white text-2xl font-semibold">{metrics.supabase.totalTables}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total Records</p>
                  <p className="text-white text-2xl font-semibold">{metrics.supabase.totalRecords.toLocaleString()}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Active Connections</p>
                  <p className="text-white text-2xl font-semibold">{metrics.supabase.activeConnections}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Query Count</p>
                  <p className="text-white text-2xl font-semibold">{metrics.supabase.queryCount.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-4">Database Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="p-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    Create Table
                  </button>
                  <button className="p-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    View Schema
                  </button>
                  <button className="p-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    Manage RLS
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Repositories</p>
                  <p className="text-white text-2xl font-semibold">{metrics.github.totalRepositories}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total Commits</p>
                  <p className="text-white text-2xl font-semibold">{metrics.github.totalCommits}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Open Issues</p>
                  <p className="text-white text-2xl font-semibold">{metrics.github.openIssues}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Pull Requests</p>
                  <p className="text-white text-2xl font-semibold">{metrics.github.openPullRequests}</p>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-4">Repository Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="p-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                    Create Repository
                  </button>
                  <button className="p-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                    View Repositories
                  </button>
                  <button className="p-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                    Create Pull Request
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegrationDashboard;
