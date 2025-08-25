import { appConfig } from '@/config/app.config';

// Types for the AI Brain
export interface BrainMemory {
  id: string;
  type: 'interaction' | 'code_pattern' | 'user_preference' | 'error' | 'success' | 'learning';
  content: any;
  timestamp: Date;
  importance: number; // 1-10 scale
  tags: string[];
  context: string;
  outcome?: 'positive' | 'negative' | 'neutral';
}

export interface LearningPattern {
  id: string;
  pattern: string;
  frequency: number;
  success_rate: number;
  last_used: Date;
  improvements: string[];
  related_patterns: string[];
}

export interface UserProfile {
  id: string;
  coding_style: {
    preferred_languages: string[];
    indentation_style: 'spaces' | 'tabs';
    indentation_size: number;
    naming_conventions: 'camelCase' | 'snake_case' | 'kebab-case' | 'PascalCase';
    comment_style: 'minimal' | 'detailed' | 'documentation';
  };
  preferences: {
    theme: string;
    font_size: number;
    auto_save: boolean;
    auto_complete: boolean;
    debug_mode: boolean;
  };
  interaction_history: {
    total_sessions: number;
    average_session_duration: number;
    most_used_features: string[];
    common_errors: string[];
    successful_patterns: string[];
  };
  learning_progress: {
    skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    areas_of_improvement: string[];
    mastered_concepts: string[];
    current_learning_focus: string[];
  };
}

export interface BrainState {
  memory: BrainMemory[];
  learning_patterns: LearningPattern[];
  user_profiles: Map<string, UserProfile>;
  knowledge_base: Map<string, any>;
  self_improvement_log: string[];
  adaptation_history: string[];
  current_focus: string[];
  performance_metrics: {
    response_time: number[];
    accuracy_rate: number[];
    user_satisfaction: number[];
    learning_efficiency: number[];
  };
}

export class AIBrain {
  private state: BrainState;
  private isLearning: boolean = false;
  private learningQueue: string[] = [];
  private adaptationTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.state = this.initializeBrain();
    this.startAdaptationCycle();
    this.loadPersistedState();
  }

  private initializeBrain(): BrainState {
    return {
      memory: [],
      learning_patterns: [],
      user_profiles: new Map(),
      knowledge_base: new Map(),
      self_improvement_log: [],
      adaptation_history: [],
      current_focus: ['code_generation', 'user_interaction', 'error_prevention'],
      performance_metrics: {
        response_time: [],
        accuracy_rate: [],
        user_satisfaction: [],
        learning_efficiency: []
      }
    };
  }

  // 🧠 MEMORY SYSTEM
  public storeMemory(memory: Omit<BrainMemory, 'id' | 'timestamp'>): string {
    const id = `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMemory: BrainMemory = {
      ...memory,
      id,
      timestamp: new Date()
    };

    this.state.memory.push(newMemory);
    this.analyzeMemory(newMemory);
    this.persistState();
    
    return id;
  }

  public retrieveMemory(query: string, limit: number = 10): BrainMemory[] {
    const relevantMemories = this.state.memory
      .filter(memory => 
        memory.content.toString().toLowerCase().includes(query.toLowerCase()) ||
        memory.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
        memory.context.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit);

    return relevantMemories;
  }

  public getMemoryStats(): { total: number; byType: Record<string, number>; recent: number } {
    const byType = this.state.memory.reduce((acc, memory) => {
      acc[memory.type] = (acc[memory.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recent = this.state.memory.filter(
      memory => Date.now() - memory.timestamp.getTime() < 24 * 60 * 60 * 1000
    ).length;

    return {
      total: this.state.memory.length,
      byType,
      recent
    };
  }

  // 🎓 LEARNING ENGINE
  private analyzeMemory(memory: BrainMemory): void {
    if (memory.type === 'interaction') {
      this.learnFromInteraction(memory);
    } else if (memory.type === 'code_pattern') {
      this.learnFromCodePattern(memory);
    } else if (memory.type === 'error') {
      this.learnFromError(memory);
    } else if (memory.type === 'success') {
      this.learnFromSuccess(memory);
    }
  }

  private learnFromInteraction(memory: BrainMemory): void {
    const content = memory.content as { user_input: string; ai_response: string; user_feedback?: string };
    
    // Learn user preferences
    this.updateUserProfile(content.user_input, content.ai_response, content.user_feedback);
    
    // Identify patterns
    const patterns = this.extractPatterns(content.user_input);
    patterns.forEach(pattern => {
      this.updateLearningPattern(pattern, content.user_feedback === 'positive');
    });
  }

  private learnFromCodePattern(memory: BrainMemory): void {
    const content = memory.content as { code: string; language: string; context: string };
    
    // Store code patterns for future reference
    const patternKey = `${content.language}_${content.context}`;
    this.state.knowledge_base.set(patternKey, {
      code: content.code,
      usage_count: (this.state.knowledge_base.get(patternKey)?.usage_count || 0) + 1,
      last_used: new Date()
    });
  }

  private learnFromError(memory: BrainMemory): void {
    const content = memory.content as { error: string; context: string; solution?: string };
    
    // Store error patterns to prevent future occurrences
    this.state.knowledge_base.set(`error_${content.error}`, {
      context: content.context,
      solution: content.solution,
      occurrence_count: (this.state.knowledge_base.get(`error_${content.error}`)?.occurrence_count || 0) + 1,
      last_occurrence: new Date()
    });
  }

  private learnFromSuccess(memory: BrainMemory): void {
    const content = memory.content as { success: string; context: string; approach: string };
    
    // Store successful approaches
    this.state.knowledge_base.set(`success_${content.success}`, {
      context: content.context,
      approach: content.approach,
      success_count: (this.state.knowledge_base.get(`success_${content.success}`)?.success_count || 0) + 1,
      last_success: new Date()
    });
  }

  private extractPatterns(input: string): string[] {
    const patterns: string[] = [];
    
    // Extract common programming patterns
    if (input.includes('create a') && input.includes('app')) patterns.push('app_creation');
    if (input.includes('fix') || input.includes('error')) patterns.push('error_fixing');
    if (input.includes('optimize') || input.includes('performance')) patterns.push('optimization');
    if (input.includes('add') && input.includes('feature')) patterns.push('feature_addition');
    if (input.includes('refactor') || input.includes('clean')) patterns.push('refactoring');
    
    return patterns;
  }

  private updateLearningPattern(pattern: string, wasSuccessful: boolean): void {
    const existingPattern = this.state.learning_patterns.find(p => p.pattern === pattern);
    
    if (existingPattern) {
      existingPattern.frequency += 1;
      existingPattern.last_used = new Date();
      
      if (wasSuccessful) {
        existingPattern.success_rate = (existingPattern.success_rate + 1) / 2;
      } else {
        existingPattern.success_rate = existingPattern.success_rate * 0.9;
      }
    } else {
      this.state.learning_patterns.push({
        id: `pattern_${Date.now()}`,
        pattern,
        frequency: 1,
        success_rate: wasSuccessful ? 1 : 0.5,
        last_used: new Date(),
        improvements: [],
        related_patterns: []
      });
    }
  }

  // 👤 USER PROFILE MANAGEMENT
  private updateUserProfile(userInput: string, aiResponse: string, feedback?: string): void {
    const userId = 'default_user'; // In a real app, this would be the actual user ID
    let profile = this.state.user_profiles.get(userId);
    
    if (!profile) {
      profile = this.createDefaultUserProfile(userId);
    }

    // Update coding style preferences
    this.analyzeCodingStyle(userInput, aiResponse, profile);
    
    // Update interaction history
    profile.interaction_history.total_sessions += 1;
    
    // Update learning progress based on feedback
    if (feedback === 'positive') {
      profile.learning_progress.mastered_concepts.push(this.extractConcept(userInput));
    } else if (feedback === 'negative') {
      profile.learning_progress.areas_of_improvement.push(this.extractConcept(userInput));
    }

    this.state.user_profiles.set(userId, profile);
  }

  private createDefaultUserProfile(userId: string): UserProfile {
    return {
      id: userId,
      coding_style: {
        preferred_languages: [],
        indentation_style: 'spaces',
        indentation_size: 2,
        naming_conventions: 'camelCase',
        comment_style: 'minimal'
      },
      preferences: {
        theme: 'dark',
        font_size: 14,
        auto_save: true,
        auto_complete: true,
        debug_mode: false
      },
      interaction_history: {
        total_sessions: 0,
        average_session_duration: 0,
        most_used_features: [],
        common_errors: [],
        successful_patterns: []
      },
      learning_progress: {
        skill_level: 'beginner',
        areas_of_improvement: [],
        mastered_concepts: [],
        current_learning_focus: []
      }
    };
  }

  private analyzeCodingStyle(userInput: string, aiResponse: string, profile: UserProfile): void {
    // Analyze language preferences
    const languages = ['javascript', 'typescript', 'python', 'java', 'csharp', 'php', 'ruby', 'go', 'rust'];
    languages.forEach(lang => {
      if (userInput.toLowerCase().includes(lang) || aiResponse.toLowerCase().includes(lang)) {
        if (!profile.coding_style.preferred_languages.includes(lang)) {
          profile.coding_style.preferred_languages.push(lang);
        }
      }
    });

    // Analyze naming conventions
    if (aiResponse.includes('camelCase')) profile.coding_style.naming_conventions = 'camelCase';
    if (aiResponse.includes('snake_case')) profile.coding_style.naming_conventions = 'snake_case';
    if (aiResponse.includes('PascalCase')) profile.coding_style.naming_conventions = 'PascalCase';
  }

  private extractConcept(input: string): string {
    // Extract the main concept from user input
    const concepts = ['react', 'node', 'database', 'api', 'authentication', 'testing', 'deployment'];
    for (const concept of concepts) {
      if (input.toLowerCase().includes(concept)) {
        return concept;
      }
    }
    return 'general_programming';
  }

  // 🔄 SELF-REGENERATION SYSTEM
  public async regenerateCapabilities(): Promise<string> {
    this.isLearning = true;
    const improvements = [];

    try {
      // Analyze current performance
      const performanceAnalysis = this.analyzePerformance();
      improvements.push(`Performance Analysis: ${performanceAnalysis}`);

      // Identify areas for improvement
      const improvementAreas = this.identifyImprovementAreas();
      improvements.push(`Improvement Areas: ${improvementAreas.join(', ')}`);

      // Generate new learning strategies
      const newStrategies = this.generateLearningStrategies();
      improvements.push(`New Learning Strategies: ${newStrategies.join(', ')}`);

      // Update knowledge base
      await this.updateKnowledgeBase();

      // Optimize memory
      this.optimizeMemory();

      // Update learning patterns
      this.updateLearningPatterns();

      this.state.self_improvement_log.push(`Regeneration completed at ${new Date().toISOString()}`);
      this.persistState();

      return `🧠 Brain regeneration completed! Improvements: ${improvements.join(' | ')}`;
    } catch (error) {
      return `❌ Regeneration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    } finally {
      this.isLearning = false;
    }
  }

  private analyzePerformance(): string {
    const metrics = this.state.performance_metrics;
    const avgResponseTime = metrics.response_time.length > 0 
      ? metrics.response_time.reduce((a, b) => a + b, 0) / metrics.response_time.length 
      : 0;
    
    const avgAccuracy = metrics.accuracy_rate.length > 0
      ? metrics.accuracy_rate.reduce((a, b) => a + b, 0) / metrics.accuracy_rate.length
      : 0;

    return `Avg Response: ${avgResponseTime.toFixed(2)}ms, Accuracy: ${(avgAccuracy * 100).toFixed(1)}%`;
  }

  private identifyImprovementAreas(): string[] {
    const areas: string[] = [];
    const memoryStats = this.getMemoryStats();
    
    if (memoryStats.byType.error > memoryStats.byType.success) {
      areas.push('error_prevention');
    }
    
    if (this.state.learning_patterns.length < 10) {
      areas.push('pattern_recognition');
    }
    
    if (this.state.knowledge_base.size < 100) {
      areas.push('knowledge_expansion');
    }

    return areas;
  }

  private generateLearningStrategies(): string[] {
    const strategies: string[] = [];
    
    // Add strategies based on current focus
    this.state.current_focus.forEach(focus => {
      strategies.push(`enhance_${focus}`);
    });

    // Add adaptive strategies
    strategies.push('context_awareness');
    strategies.push('user_preference_learning');
    strategies.push('error_pattern_recognition');

    return strategies;
  }

  private async updateKnowledgeBase(): Promise<void> {
    // Simulate knowledge base updates
    const newKnowledge = [
      { key: 'latest_react_patterns', value: 'React 18+ patterns and best practices' },
      { key: 'modern_js_features', value: 'ES2022+ JavaScript features and usage' },
      { key: 'ai_integration_patterns', value: 'AI integration patterns for web applications' }
    ];

    newKnowledge.forEach(({ key, value }) => {
      this.state.knowledge_base.set(key, {
        content: value,
        last_updated: new Date(),
        source: 'self_learning'
      });
    });
  }

  private optimizeMemory(): void {
    // Remove old, low-importance memories
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    this.state.memory = this.state.memory.filter(memory => 
      memory.importance > 3 || memory.timestamp > cutoffDate
    );
  }

  private updateLearningPatterns(): void {
    // Update pattern relationships
    this.state.learning_patterns.forEach(pattern => {
      const relatedPatterns = this.state.learning_patterns
        .filter(p => p.pattern !== pattern.pattern && p.frequency > 5)
        .map(p => p.pattern);
      pattern.related_patterns = relatedPatterns.slice(0, 5);
    });
  }

  // 🎯 ADAPTIVE BEHAVIOR
  public adaptToUser(userId: string): UserProfile | null {
    const profile = this.state.user_profiles.get(userId);
    if (!profile) return null;

    // Adapt based on user's learning progress
    if (profile.learning_progress.mastered_concepts.length > 10) {
      profile.learning_progress.skill_level = 'intermediate';
    }
    if (profile.learning_progress.mastered_concepts.length > 25) {
      profile.learning_progress.skill_level = 'advanced';
    }
    if (profile.learning_progress.mastered_concepts.length > 50) {
      profile.learning_progress.skill_level = 'expert';
    }

    return profile;
  }

  public getPersonalizedResponse(userInput: string, userId: string = 'default_user'): string {
    const profile = this.state.user_profiles.get(userId);
    if (!profile) return userInput;

    // Personalize response based on user profile
    let personalizedInput = userInput;

    // Add context based on user's skill level
    if (profile.learning_progress.skill_level === 'beginner') {
      personalizedInput += ' (explain in detail for beginners)';
    } else if (profile.learning_progress.skill_level === 'expert') {
      personalizedInput += ' (provide advanced implementation)';
    }

    // Add context based on preferred languages
    if (profile.coding_style.preferred_languages.length > 0) {
      personalizedInput += ` (prefer ${profile.coding_style.preferred_languages.join(', ')})`;
    }

    return personalizedInput;
  }

  // 🔄 ADAPTATION CYCLE
  private startAdaptationCycle(): void {
    this.adaptationTimer = setInterval(() => {
      this.performAdaptation();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private performAdaptation(): void {
    const adaptation = `Adaptation cycle at ${new Date().toISOString()}`;
    this.state.adaptation_history.push(adaptation);
    
    // Perform light adaptations
    this.optimizeMemory();
    this.updateLearningPatterns();
    
    // Log adaptation
    if (this.state.adaptation_history.length > 100) {
      this.state.adaptation_history = this.state.adaptation_history.slice(-50);
    }
  }

  // 💾 PERSISTENCE
  private persistState(): void {
    try {
      const stateToPersist = {
        ...this.state,
        user_profiles: Array.from(this.state.user_profiles.entries()),
        knowledge_base: Array.from(this.state.knowledge_base.entries())
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('ai_brain_state', JSON.stringify(stateToPersist));
      }
    } catch (error) {
      console.error('Failed to persist brain state:', error);
    }
  }

  private loadPersistedState(): void {
    try {
      if (typeof window !== 'undefined') {
        const persisted = localStorage.getItem('ai_brain_state');
        if (persisted) {
          const parsed = JSON.parse(persisted);
          
          // Convert timestamp strings back to Date objects
          const memory = (parsed.memory || []).map((mem: any) => ({
            ...mem,
            timestamp: new Date(mem.timestamp)
          }));
          
          const learningPatterns = (parsed.learning_patterns || []).map((pattern: any) => ({
            ...pattern,
            last_used: new Date(pattern.last_used)
          }));
          
          this.state = {
            ...parsed,
            memory,
            learning_patterns: learningPatterns,
            user_profiles: new Map(parsed.user_profiles || []),
            knowledge_base: new Map(parsed.knowledge_base || [])
          };
        }
      }
    } catch (error) {
      console.error('Failed to load persisted brain state:', error);
    }
  }

  // 📊 BRAIN STATUS AND METRICS
  public getBrainStatus(): {
    isLearning: boolean;
    memoryCount: number;
    patternCount: number;
    userCount: number;
    knowledgeCount: number;
    adaptationCount: number;
    performance: any;
  } {
    return {
      isLearning: this.isLearning,
      memoryCount: this.state.memory.length,
      patternCount: this.state.learning_patterns.length,
      userCount: this.state.user_profiles.size,
      knowledgeCount: this.state.knowledge_base.size,
      adaptationCount: this.state.adaptation_history.length,
      performance: this.state.performance_metrics
    };
  }

  public getLearningInsights(): {
    topPatterns: LearningPattern[];
    recentMemories: BrainMemory[];
    userProgress: any;
    improvementSuggestions: string[];
  } {
    const topPatterns = this.state.learning_patterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    const recentMemories = this.state.memory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    const userProgress = Array.from(this.state.user_profiles.values()).map(profile => ({
      id: profile.id,
      skill_level: profile.learning_progress.skill_level,
      mastered_concepts: profile.learning_progress.mastered_concepts.length,
      areas_of_improvement: profile.learning_progress.areas_of_improvement.length
    }));

    const improvementSuggestions = this.generateImprovementSuggestions();

    return {
      topPatterns,
      recentMemories,
      userProgress,
      improvementSuggestions
    };
  }

  private generateImprovementSuggestions(): string[] {
    const suggestions: string[] = [];
    const memoryStats = this.getMemoryStats();

    if (memoryStats.byType.error > memoryStats.byType.success) {
      suggestions.push('Focus on error prevention and debugging strategies');
    }

    if (this.state.learning_patterns.length < 10) {
      suggestions.push('Expand pattern recognition capabilities');
    }

    if (this.state.knowledge_base.size < 100) {
      suggestions.push('Increase knowledge base coverage');
    }

    return suggestions;
  }

  // 🧹 CLEANUP
  public cleanup(): void {
    if (this.adaptationTimer) {
      clearInterval(this.adaptationTimer);
    }
  }
}

// Global brain instance
export const aiBrain = new AIBrain();
