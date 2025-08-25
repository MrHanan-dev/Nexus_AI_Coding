'use client';

import { useState, useEffect } from 'react';
import { aiBrain, BrainMemory, LearningPattern } from '@/lib/ai-brain';
import { 
  FiCpu, 
  FiTrendingUp, 
  FiUser, 
  FiBook, 
  FiBookOpen,
  FiZap,
  FiRefreshCw,
  FiActivity,
  FiTarget,
  FiAward,
  FiClock,
  FiBarChart,
  FiGrid,
  FiList,
  FiEye,
  FiEyeOff,
  FiX
} from '@/lib/icons';

interface BrainDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BrainDashboard({ isOpen, onClose }: BrainDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'memory' | 'learning' | 'performance' | 'insights'>('overview');
  const [brainStatus, setBrainStatus] = useState(aiBrain.getBrainStatus());
  const [learningInsights, setLearningInsights] = useState(aiBrain.getLearningInsights());
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      updateBrainData();
      const interval = setInterval(updateBrainData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const updateBrainData = () => {
    setBrainStatus(aiBrain.getBrainStatus());
    setLearningInsights(aiBrain.getLearningInsights());
  };

  const handleRegeneration = async () => {
    setIsRegenerating(true);
    try {
      const result = await aiBrain.regenerateCapabilities();
      updateBrainData();
      // You could show a toast notification here
      console.log('Brain regeneration result:', result);
    } catch (error) {
      console.error('Regeneration failed:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-orange-400';
      case 'expert': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getPerformanceColor = (value: number, max: number = 100) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-11/12 h-5/6 max-w-6xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <FiCpu className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">🧠 AI Brain Dashboard</h2>
              <p className="text-gray-400 text-sm">
                {brainStatus.isLearning ? '🔄 Learning in progress...' : '✅ Brain active and ready'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
            >
              {showDetails ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
            <button
              onClick={handleRegeneration}
              disabled={isRegenerating}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg text-sm font-medium"
            >
              <FiRefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              {isRegenerating ? 'Regenerating...' : 'Regenerate Brain'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'overview', label: 'Overview', icon: FiBarChart },
            { id: 'memory', label: 'Memory', icon: FiBookOpen },
            { id: 'learning', label: 'Learning', icon: FiBook },
            { id: 'performance', label: 'Performance', icon: FiActivity },
            { id: 'insights', label: 'Insights', icon: FiTarget }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-400 bg-purple-500 bg-opacity-10'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-800'
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Brain Status Card */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <FiCpu className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Brain Status</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Learning Mode:</span>
                    <span className={brainStatus.isLearning ? 'text-green-400' : 'text-gray-400'}>
                      {brainStatus.isLearning ? 'Active' : 'Idle'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Memory Count:</span>
                    <span className="text-white">{brainStatus.memoryCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pattern Count:</span>
                    <span className="text-white">{brainStatus.patternCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Knowledge Base:</span>
                    <span className="text-white">{brainStatus.knowledgeCount}</span>
                  </div>
                </div>
              </div>

              {/* Learning Progress Card */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <FiTrendingUp className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Learning Progress</h3>
                </div>
                <div className="space-y-3">
                  {learningInsights.userProgress.map((user: { id: string; skill_level: string; mastered_concepts: number; areas_of_improvement: number }, index) => (
                    <div key={user.id || index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Skill Level:</span>
                        <span className={getSkillLevelColor(user.skill_level)}>
                          {user.skill_level.charAt(0).toUpperCase() + user.skill_level.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mastered:</span>
                        <span className="text-white">{user.mastered_concepts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Improving:</span>
                        <span className="text-white">{user.areas_of_improvement}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics Card */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <FiActivity className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Performance</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Response:</span>
                    <span className={getPerformanceColor(brainStatus.performance.response_time[brainStatus.performance.response_time.length - 1] || 0, 1000)}>
                      {brainStatus.performance.response_time.length > 0 
                        ? `${(brainStatus.performance.response_time[brainStatus.performance.response_time.length - 1] || 0).toFixed(0)}ms`
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Accuracy:</span>
                    <span className={getPerformanceColor((brainStatus.performance.accuracy_rate[brainStatus.performance.accuracy_rate.length - 1] || 0) * 100)}>
                      {brainStatus.performance.accuracy_rate.length > 0 
                        ? `${((brainStatus.performance.accuracy_rate[brainStatus.performance.accuracy_rate.length - 1] || 0) * 100).toFixed(1)}%`
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Satisfaction:</span>
                    <span className={getPerformanceColor((brainStatus.performance.user_satisfaction[brainStatus.performance.user_satisfaction.length - 1] || 0) * 100)}>
                      {brainStatus.performance.user_satisfaction.length > 0 
                        ? `${((brainStatus.performance.user_satisfaction[brainStatus.performance.user_satisfaction.length - 1] || 0) * 100).toFixed(1)}%`
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Adaptation History Card */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <FiZap className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Adaptations</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Adaptations:</span>
                    <span className="text-white">{brainStatus.adaptationCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Users:</span>
                    <span className="text-white">{brainStatus.userCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Update:</span>
                    <span className="text-gray-400 text-xs">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'memory' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Memories</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {learningInsights.recentMemories.slice(0, 5).map((memory, index) => (
                      <div key={memory.id} className="bg-gray-700 rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                            {memory.type}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(memory.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2">
                          {typeof memory.content === 'string' 
                            ? memory.content 
                            : JSON.stringify(memory.content).substring(0, 100)
                          }
                        </p>
                        <div className="flex gap-1 mt-2">
                          {memory.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span key={tagIndex} className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Memory Types</h3>
                  <div className="space-y-3">
                    {Object.entries(aiBrain.getMemoryStats().byType).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-gray-400 capitalize">{type.replace('_', ' ')}:</span>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Memory Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Memories:</span>
                      <span className="text-white">{aiBrain.getMemoryStats().total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Recent (24h):</span>
                      <span className="text-white">{aiBrain.getMemoryStats().recent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Importance:</span>
                      <span className="text-white">
                        {(aiBrain.getMemoryStats().total > 0 
                          ? learningInsights.recentMemories.reduce((sum, m) => sum + m.importance, 0) / learningInsights.recentMemories.length 
                          : 0
                        ).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Top Learning Patterns</h3>
                  <div className="space-y-4">
                    {learningInsights.topPatterns.map((pattern, index) => (
                      <div key={pattern.id} className="bg-gray-700 rounded p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-white">
                            {pattern.pattern.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(pattern.last_used)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Frequency:</span>
                          <span className="text-white">{pattern.frequency}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Success Rate:</span>
                          <span className={getPerformanceColor(pattern.success_rate * 100)}>
                            {(pattern.success_rate * 100).toFixed(1)}%
                          </span>
                        </div>
                        {showDetails && pattern.improvements.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-600">
                            <p className="text-xs text-gray-400 mb-1">Improvements:</p>
                            <div className="space-y-1">
                              {pattern.improvements.slice(0, 2).map((improvement, idx) => (
                                <p key={idx} className="text-xs text-gray-300">• {improvement}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Learning Insights</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-700 rounded p-4">
                      <h4 className="text-sm font-medium text-white mb-3">Improvement Suggestions</h4>
                      <div className="space-y-2">
                        {learningInsights.improvementSuggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <FiTarget className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-300">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded p-4">
                      <h4 className="text-sm font-medium text-white mb-3">Current Focus Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {['code_generation', 'user_interaction', 'error_prevention'].map((focus) => (
                          <span key={focus} className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                            {focus.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Response Time Trends</h3>
                  <div className="space-y-3">
                    {brainStatus.performance.response_time.slice(-10).map((time, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-16 text-xs text-gray-400">
                          #{brainStatus.performance.response_time.length - 10 + index + 1}
                        </div>
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((time / 1000) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="w-16 text-xs text-white text-right">
                          {time.toFixed(0)}ms
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Accuracy Trends</h3>
                  <div className="space-y-3">
                    {brainStatus.performance.accuracy_rate.slice(-10).map((accuracy, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-16 text-xs text-gray-400">
                          #{brainStatus.performance.accuracy_rate.length - 10 + index + 1}
                        </div>
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${accuracy * 100}%` }}
                          />
                        </div>
                        <div className="w-16 text-xs text-white text-right">
                          {(accuracy * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">User Progress Insights</h3>
                  <div className="space-y-4">
                    {learningInsights.userProgress.map((user: { id: string; skill_level: string; mastered_concepts: number; areas_of_improvement: number }, index) => (
                      <div key={user.id || index} className="bg-gray-700 rounded p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium text-white">
                            User {user.id || 'Default'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${getSkillLevelColor(user.skill_level)}`}>
                            {user.skill_level.charAt(0).toUpperCase() + user.skill_level.slice(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Mastered:</span>
                            <span className="text-white ml-2">{user.mastered_concepts}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Improving:</span>
                            <span className="text-white ml-2">{user.areas_of_improvement}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Brain Recommendations</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-700 rounded p-4">
                      <h4 className="text-sm font-medium text-white mb-3">Learning Focus</h4>
                      <div className="space-y-2">
                        {learningInsights.improvementSuggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <FiAward className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-300">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded p-4">
                      <h4 className="text-sm font-medium text-white mb-3">Next Steps</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FiClock className="w-4 h-4 text-blue-400" />
                          <p className="text-sm text-gray-300">Continue pattern recognition training</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiTarget className="w-4 h-4 text-green-400" />
                          <p className="text-sm text-gray-300">Expand knowledge base coverage</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiZap className="w-4 h-4 text-purple-400" />
                          <p className="text-sm text-gray-300">Optimize response time</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
