import { createClient } from '@supabase/supabase-js';
import { Octokit } from '@octokit/rest';
import Stripe from 'stripe';

export interface IntegrationConfig {
  stripe: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  github: {
    personalAccessToken: string;
    username: string;
  };
}

export interface IntegrationStatus {
  stripe: 'connected' | 'disconnected' | 'error';
  supabase: 'connected' | 'disconnected' | 'error';
  github: 'connected' | 'disconnected' | 'error';
}

export interface RealTimeEvent {
  type: 'payment' | 'database' | 'repository' | 'subscription';
  action: string;
  data: any;
  timestamp: Date;
}

export class IntegrationManager {
  private stripe: Stripe | null = null;
  private supabase: any = null;
  private github: Octokit | null = null;
  private status: IntegrationStatus = {
    stripe: 'disconnected',
    supabase: 'disconnected',
    github: 'disconnected'
  };
  private eventListeners: ((event: RealTimeEvent) => void)[] = [];

  constructor(private config: IntegrationConfig) {}

  // Initialize all integrations
  async initialize(): Promise<IntegrationStatus> {
    try {
      await Promise.all([
        this.initializeStripe(),
        this.initializeSupabase(),
        this.initializeGitHub()
      ]);

      return this.status;
    } catch (error) {
      console.error('Failed to initialize integrations:', error);
      throw error;
    }
  }

  // Stripe Integration
  private async initializeStripe(): Promise<void> {
    try {
      this.stripe = new Stripe(this.config.stripe.secretKey, {
        apiVersion: '2025-07-30.basil',
      });

      // Test connection
      await this.stripe.paymentMethods.list({ limit: 1 });
      this.status.stripe = 'connected';
      
      this.emitEvent({
        type: 'payment',
        action: 'connected',
        data: { provider: 'stripe' },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Stripe initialization failed:', error);
      this.status.stripe = 'error';
      throw error;
    }
  }

  // Supabase Integration
  private async initializeSupabase(): Promise<void> {
    try {
      this.supabase = createClient(
        this.config.supabase.url,
        this.config.supabase.serviceRoleKey
      );

      // Test connection
      const { data, error } = await this.supabase.from('_test_connection').select('*').limit(1);
      if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist"
        throw error;
      }

      this.status.supabase = 'connected';
      
      this.emitEvent({
        type: 'database',
        action: 'connected',
        data: { provider: 'supabase' },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Supabase initialization failed:', error);
      this.status.supabase = 'error';
      throw error;
    }
  }

  // GitHub Integration
  private async initializeGitHub(): Promise<void> {
    try {
      this.github = new Octokit({
        auth: this.config.github.personalAccessToken,
      });

      // Test connection
      await this.github.rest.users.getAuthenticated();
      this.status.github = 'connected';
      
      this.emitEvent({
        type: 'repository',
        action: 'connected',
        data: { provider: 'github' },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('GitHub initialization failed:', error);
      this.status.github = 'error';
      throw error;
    }
  }

  // Payment Processing (Stripe)
  async processPayment(amount: number, currency: string = 'usd', metadata: any = {}): Promise<any> {
    if (!this.stripe || this.status.stripe !== 'connected') {
      throw new Error('Stripe not connected');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        metadata,
        automatic_payment_methods: { enabled: true },
      });

      this.emitEvent({
        type: 'payment',
        action: 'payment_intent_created',
        data: { paymentIntentId: paymentIntent.id, amount, currency },
        timestamp: new Date()
      });

      return paymentIntent;
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    }
  }

  async createSubscription(customerId: string, priceId: string): Promise<any> {
    if (!this.stripe || this.status.stripe !== 'connected') {
      throw new Error('Stripe not connected');
    }

    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
      });

      this.emitEvent({
        type: 'subscription',
        action: 'subscription_created',
        data: { subscriptionId: subscription.id, customerId, priceId },
        timestamp: new Date()
      });

      return subscription;
    } catch (error) {
      console.error('Subscription creation failed:', error);
      throw error;
    }
  }

  // Database Operations (Supabase)
  async createTable(tableName: string, columns: any[], enableRLS: boolean = true): Promise<any> {
    if (!this.supabase || this.status.supabase !== 'connected') {
      throw new Error('Supabase not connected');
    }

    try {
      let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (`;
      sql += columns.map(col => 
        `${col.name} ${col.type}${col.primary ? ' PRIMARY KEY' : ''}${col.nullable ? '' : ' NOT NULL'}`
      ).join(', ');
      sql += ');';

      if (enableRLS) {
        sql += `\nALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`;
      }

      const { data, error } = await this.supabase.rpc('exec_sql', { sql });
      if (error) throw error;

      this.emitEvent({
        type: 'database',
        action: 'table_created',
        data: { tableName, columns },
        timestamp: new Date()
      });

      return { tableName, success: true };
    } catch (error) {
      console.error('Table creation failed:', error);
      throw error;
    }
  }

  async insertData(tableName: string, data: any): Promise<any> {
    if (!this.supabase || this.status.supabase !== 'connected') {
      throw new Error('Supabase not connected');
    }

    try {
      const { data: result, error } = await this.supabase
        .from(tableName)
        .insert(data)
        .select();

      if (error) throw error;

      this.emitEvent({
        type: 'database',
        action: 'data_inserted',
        data: { tableName, recordCount: result.length },
        timestamp: new Date()
      });

      return result;
    } catch (error) {
      console.error('Data insertion failed:', error);
      throw error;
    }
  }

  async queryData(tableName: string, select: string = '*', filters: any = {}): Promise<any> {
    if (!this.supabase || this.status.supabase !== 'connected') {
      throw new Error('Supabase not connected');
    }

    try {
      let query = this.supabase.from(tableName).select(select);

      Object.entries(filters).forEach(([column, value]) => {
        if (value && typeof value === 'object' && 'operator' in value && 'value' in value) {
          query = query.filter(column, (value as any).operator, (value as any).value);
        } else if (value !== null && value !== undefined) {
          query = query.eq(column, value);
        }
      });

      const { data, error } = await query;
      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Data query failed:', error);
      throw error;
    }
  }

  // Repository Operations (GitHub)
  async createRepository(name: string, description: string, isPrivate: boolean = false): Promise<any> {
    if (!this.github || this.status.github !== 'connected') {
      throw new Error('GitHub not connected');
    }

    try {
      const { data: repo } = await this.github.repos.createForAuthenticatedUser({
        name,
        description,
        private: isPrivate,
        auto_init: true,
      });

      this.emitEvent({
        type: 'repository',
        action: 'repository_created',
        data: { repositoryName: name, cloneUrl: repo.clone_url },
        timestamp: new Date()
      });

      return repo;
    } catch (error) {
      console.error('Repository creation failed:', error);
      throw error;
    }
  }

  async createFile(owner: string, repo: string, path: string, content: string, message: string): Promise<any> {
    if (!this.github || this.status.github !== 'connected') {
      throw new Error('GitHub not connected');
    }

    try {
      const { data: file } = await this.github.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        branch: 'main',
      });

      this.emitEvent({
        type: 'repository',
        action: 'file_created',
        data: { repository: `${owner}/${repo}`, path, message },
        timestamp: new Date()
      });

      return file;
    } catch (error) {
      console.error('File creation failed:', error);
      throw error;
    }
  }

  async createPullRequest(owner: string, repo: string, title: string, body: string, head: string, base: string = 'main'): Promise<any> {
    if (!this.github || this.status.github !== 'connected') {
      throw new Error('GitHub not connected');
    }

    try {
      const { data: pr } = await this.github.pulls.create({
        owner,
        repo,
        title,
        body,
        head,
        base,
      });

      this.emitEvent({
        type: 'repository',
        action: 'pull_request_created',
        data: { repository: `${owner}/${repo}`, title, url: pr.html_url },
        timestamp: new Date()
      });

      return pr;
    } catch (error) {
      console.error('Pull request creation failed:', error);
      throw error;
    }
  }

  // Real-time event handling
  onEvent(callback: (event: RealTimeEvent) => void): void {
    this.eventListeners.push(callback);
  }

  private emitEvent(event: RealTimeEvent): void {
    this.eventListeners.forEach(callback => callback(event));
  }

  // Status management
  getStatus(): IntegrationStatus {
    return { ...this.status };
  }

  async testConnections(): Promise<IntegrationStatus> {
    const testPromises = [
      this.testStripeConnection(),
      this.testSupabaseConnection(),
      this.testGitHubConnection()
    ];

    await Promise.allSettled(testPromises);
    return this.getStatus();
  }

  private async testStripeConnection(): Promise<void> {
    try {
      if (this.stripe) {
        await this.stripe.paymentMethods.list({ limit: 1 });
        this.status.stripe = 'connected';
      }
    } catch (error) {
      this.status.stripe = 'error';
    }
  }

  private async testSupabaseConnection(): Promise<void> {
    try {
      if (this.supabase) {
        const { error } = await this.supabase.from('_test_connection').select('*').limit(1);
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        this.status.supabase = 'connected';
      }
    } catch (error) {
      this.status.supabase = 'error';
    }
  }

  private async testGitHubConnection(): Promise<void> {
    try {
      if (this.github) {
        await this.github.rest.users.getAuthenticated();
        this.status.github = 'connected';
      }
    } catch (error) {
      this.status.github = 'error';
    }
  }

  // Cleanup
  async disconnect(): Promise<void> {
    this.stripe = null;
    this.supabase = null;
    this.github = null;
    
    this.status = {
      stripe: 'disconnected',
      supabase: 'disconnected',
      github: 'disconnected'
    };

    this.eventListeners = [];
  }
}
