'use client';

import React, { useState } from 'react';
import { FiSettings, FiPlus, FiChevronDown, FiExternalLink, FiCheck, FiLoader, FiActivity } from 'react-icons/fi';
import { SiStripe, SiSupabase, SiGithub } from 'react-icons/si';
import IntegrationDashboard from './IntegrationDashboard';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'available' | 'connected' | 'connecting' | 'error';
  category: 'suggested' | 'database' | 'payment' | 'version-control';
}

const Integrations: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIntegration, setActiveIntegration] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Add payments to your project',
      icon: <SiStripe className="w-6 h-6 text-purple-500" />,
      status: 'available',
      category: 'suggested'
    },
    {
      id: 'supabase',
      name: 'Supabase',
      description: 'Add a database/edge functions',
      icon: <SiSupabase className="w-6 h-6 text-green-500" />,
      status: 'available',
      category: 'suggested'
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Manage versions of your project',
      icon: <SiGithub className="w-6 h-6 text-gray-400" />,
      status: 'available',
      category: 'suggested'
    }
  ]);

  // Check integration status on component mount
  React.useEffect(() => {
    const checkIntegrationStatus = async () => {
      const integrationIds = ['stripe', 'supabase', 'github'];
      
      for (const integrationId of integrationIds) {
        try {
          let testUrl = '';
                     switch (integrationId) {
             case 'stripe':
               testUrl = '/api/integrations/stripe?action=test-connection';
               break;
             case 'supabase':
               testUrl = '/api/integrations/supabase?action=get-tables';
               break;
             case 'github':
               testUrl = '/api/integrations/github?action=get-repositories';
               break;
           }

          const response = await fetch(testUrl);
          
          if (response.ok) {
            setIntegrations(prevIntegrations => 
              prevIntegrations.map(integration => 
                integration.id === integrationId 
                  ? { ...integration, status: 'connected' as const }
                  : integration
              )
            );
          }
        } catch (error) {
          console.error(`Failed to check ${integrationId} status:`, error);
        }
      }
    };

    checkIntegrationStatus();
  }, []);

  const handleConnect = async (integrationId: string) => {
    setConnecting(integrationId);
    
    try {
             // Test the integration by calling the API
       let testUrl = '';
       switch (integrationId) {
         case 'stripe':
           testUrl = '/api/integrations/stripe?action=test-connection';
           break;
         case 'supabase':
           testUrl = '/api/integrations/supabase?action=get-tables';
           break;
         case 'github':
           testUrl = '/api/integrations/github?action=get-repositories';
           break;
         default:
           throw new Error('Unknown integration');
       }

      const response = await fetch(testUrl);
      
      if (response.ok) {
        // Update integration status to connected
        setIntegrations(prevIntegrations => 
          prevIntegrations.map(integration => 
            integration.id === integrationId 
              ? { ...integration, status: 'connected' as const }
              : integration
          )
        );
        
        console.log(`Successfully connected to ${integrationId}`);
      } else {
        throw new Error(`Failed to connect to ${integrationId}`);
      }
    } catch (error) {
      console.error(`Failed to connect to ${integrationId}:`, error);
      // Update integration status to error
      setIntegrations(prevIntegrations => 
        prevIntegrations.map(integration => 
          integration.id === integrationId 
            ? { ...integration, status: 'error' as const }
            : integration
        )
      );
    } finally {
      setConnecting(null);
      setActiveIntegration(null);
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <FiCheck className="w-4 h-4 text-green-500" />;
      case 'connecting':
        return <FiLoader className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error':
        return <FiSettings className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Error';
      default:
        return 'Connect';
    }
  };

  return (
    <div className="relative">
      {/* Integrations Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowDashboard(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          title="Integration Dashboard"
        >
          <FiActivity className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Integrations
          <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Add an integration</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Suggested</h4>
                <div className="space-y-2">
                  {integrations.map((integration) => (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {integration.icon}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{integration.name}</span>
                            {integration.id === 'supabase' && (
                              <FiExternalLink className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{integration.description}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleConnect(integration.id)}
                        disabled={integration.status === 'connected' || connecting === integration.id}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          integration.status === 'connected'
                            ? 'bg-green-600 text-white cursor-not-allowed'
                            : connecting === integration.id
                            ? 'bg-blue-600 text-white cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {getStatusIcon(integration.status)}
                        {getStatusText(integration.status)}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Integration Dashboard */}
      <IntegrationDashboard 
        isOpen={showDashboard} 
        onClose={() => setShowDashboard(false)} 
      />
    </div>
  );
};

export default Integrations;
