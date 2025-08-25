'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  FiMic, 
  FiMicOff, 
  FiUsers, 
  FiCode, 
  FiShield, 
  FiZap, 
  FiStar,
  FiMessageSquare,
  FiTrendingUp,
  FiAward,

  FiGitBranch,
  FiDatabase,
  FiMonitor,
  FiSmartphone,
  FiGlobe,
  FiLock,
  FiUnlock,
  FiEye,
  FiEdit3,
  FiPlay,
  FiPause,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo
} from 'react-icons/fi';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: 'available' | 'beta' | 'coming-soon';
  onClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, status, onClick }) => {
  const statusColors = {
    'available': 'bg-green-100 text-green-800 border-green-200',
    'beta': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'coming-soon': 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const statusText = {
    'available': 'Available',
    'beta': 'Beta',
    'coming-soon': 'Coming Soon'
  };

  return (
    <div 
      className={`p-6 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer ${
        onClick ? 'hover:shadow-lg hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[status]}`}>
              {statusText[status]}
            </span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

export const InnovativeFeatures: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [collaborationSession, setCollaborationSession] = useState<string | null>(null);
  const [codeReviewResult, setCodeReviewResult] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const features = [
    {
      icon: <FiMic className="w-6 h-6" />,
      title: 'Voice-to-Code Interface',
      description: 'Write code using natural language voice commands. Create functions, components, and entire applications by speaking.',
      status: 'available' as const,
      onClick: () => handleVoiceToCode()
    },
    {
      icon: <FiUsers className="w-6 h-6" />,
      title: 'AI-Powered Collaborative Coding',
      description: 'Real-time collaborative coding with AI conflict resolution, live cursor tracking, and intelligent suggestions.',
      status: 'available' as const,
      onClick: () => handleCollaborativeCoding()
    },
    {
      icon: <FiCode className="w-6 h-6" />,
      title: 'Smart Code Templates',
      description: 'AI-generated contextual templates that learn from your patterns and adapt to your project structure.',
      status: 'available' as const,
      onClick: () => handleSmartTemplates()
    },
    {
      icon: <FiShield className="w-6 h-6" />,
      title: 'Advanced Code Review',
      description: 'Comprehensive AI-powered code analysis with security scanning, performance optimization, and best practice suggestions.',
      status: 'available' as const,
      onClick: () => handleCodeReview()
    },
    {
      icon: <FiZap className="w-6 h-6" />,
      title: 'Performance Prediction',
      description: 'Predict application performance before deployment with AI analysis of code patterns and optimization suggestions.',
      status: 'beta' as const
    },
    {
      icon: <FiGlobe className="w-6 h-6" />,
      title: 'Multi-language Translation',
      description: 'Automatically translate code comments, documentation, and UI text to multiple languages with context preservation.',
      status: 'beta' as const
    },
    {
      icon: <FiGitBranch className="w-6 h-6" />,
      title: 'Advanced Git Integration',
      description: 'AI-powered commit messages, automatic conflict resolution, and intelligent branch management with code analysis.',
      status: 'available' as const
    },
    {
      icon: <FiDatabase className="w-6 h-6" />,
      title: 'Smart Database Management',
      description: 'AI-assisted database schema design, query optimization, and automatic migration generation.',
      status: 'beta' as const
    },
    {
      icon: <FiMonitor className="w-6 h-6" />,
      title: 'Project Health Dashboard',
      description: 'Real-time project analytics with code quality metrics, performance insights, and team productivity tracking.',
      status: 'available' as const
    },
    {
      icon: <FiSmartphone className="w-6 h-6" />,
      title: 'Cross-Platform Development',
      description: 'Generate native mobile apps, web apps, and desktop applications from a single codebase with AI assistance.',
      status: 'coming-soon' as const
    },
    {
      icon: <FiLock className="w-6 h-6" />,
      title: 'Security-First Development',
      description: 'Built-in security scanning, vulnerability detection, and automatic security patch suggestions.',
      status: 'available' as const
    },
    {
      icon: <FiTrendingUp className="w-6 h-6" />,
      title: 'AI Learning Assistant',
      description: 'Personalized learning paths, code explanations, and skill development recommendations based on your coding patterns.',
      status: 'beta' as const
    }
  ];

  const handleVoiceToCode = async () => {
    if (!isListening) {
      setIsListening(true);
      // Start voice recognition
      try {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript;
            }
            setVoiceTranscript(transcript);
          };

          recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
          };

          recognition.start();
        }
      } catch (error) {
        console.error('Speech recognition not supported:', error);
        setIsListening(false);
      }
    } else {
      setIsListening(false);
      // Process the voice command
      if (voiceTranscript) {
        // Call voice-to-code API
        console.log('Processing voice command:', voiceTranscript);
      }
    }
  };

  const handleCollaborativeCoding = () => {
    const sessionId = Math.random().toString(36).substr(2, 9);
    setCollaborationSession(sessionId);
    // Initialize collaborative session
    console.log('Starting collaborative session:', sessionId);
  };

  const handleSmartTemplates = async () => {
    // Show template suggestions
    const suggestions = await fetch('/api/ai/generate-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: 'React component with TypeScript',
        language: 'typescript',
        category: 'component'
      })
    });
    
    const templates = await suggestions.json();
    setSelectedTemplate(templates[0]);
  };

  const handleCodeReview = async () => {
    const sampleCode = `
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}
    `;

    const review = await fetch('/api/ai/code-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Review this JavaScript function for best practices and improvements',
        code: sampleCode
      })
    });

    const result = await review.json();
    setCodeReviewResult(result);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Innovative Features That Set Us Apart
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover cutting-edge features that go beyond traditional IDEs like Cursor and VS Code, 
          powered by advanced AI and collaborative technologies.
        </p>
      </div>

      {/* Voice-to-Code Demo */}
      {isListening && (
        <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">Listening...</h3>
              <p className="text-blue-700">{voiceTranscript || 'Speak your code command...'}</p>
            </div>
            <Button onClick={handleVoiceToCode} variant="outline" size="sm">
              <FiMicOff className="w-4 h-4 mr-2" />
              Stop
            </Button>
          </div>
        </div>
      )}

      {/* Collaborative Session Demo */}
      {collaborationSession && (
        <div className="mb-8 p-6 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-900">Collaborative Session Active</h3>
              <p className="text-green-700">Session ID: {collaborationSession}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">A</div>
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">B</div>
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">C</div>
              </div>
              <Button onClick={() => setCollaborationSession(null)} variant="outline" size="sm">
                End Session
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Code Review Demo */}
      {codeReviewResult && (
        <div className="mb-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="font-semibold text-yellow-900 mb-4">Code Review Results</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FiCheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Score: {codeReviewResult.score}/100</span>
            </div>
            {codeReviewResult.suggestions?.slice(0, 2).map((suggestion: any, index: number) => (
              <div key={index} className="flex items-start space-x-2">
                <FiStar className="w-4 h-4 text-blue-500 mt-0.5" />
                <span className="text-sm text-gray-700">{suggestion.message}</span>
              </div>
            ))}
          </div>
          <Button onClick={() => setCodeReviewResult(null)} variant="outline" size="sm" className="mt-4">
            Close
          </Button>
        </div>
      )}

      {/* Smart Template Demo */}
      {selectedTemplate && (
        <div className="mb-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-900 mb-4">Smart Template Generated</h3>
          <div className="bg-white p-4 rounded border">
            <h4 className="font-medium text-purple-800">{selectedTemplate.name}</h4>
            <p className="text-sm text-purple-600 mb-3">{selectedTemplate.description}</p>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
              {selectedTemplate.code}
            </pre>
          </div>
          <Button onClick={() => setSelectedTemplate(null)} variant="outline" size="sm" className="mt-4">
            Close
          </Button>
        </div>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            status={feature.status}
            onClick={feature.onClick}
          />
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience the Future of Coding?</h2>
          <p className="text-xl mb-6 opacity-90">
            Join thousands of developers who are already using these innovative features 
            to build better software faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <FiPlay className="w-5 h-5 mr-2" />
              Start Coding Now
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <FiInfo className="w-5 h-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
