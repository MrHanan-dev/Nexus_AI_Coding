export interface CollaborationSession {
  id: string;
  name: string;
  participants: Participant[];
  files: SharedFile[];
  chat: ChatMessage[];
  status: 'active' | 'paused' | 'ended';
  createdAt: Date;
  updatedAt: Date;
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'online' | 'away' | 'offline';
  cursor?: CursorPosition;
  lastActive: Date;
}

export interface SharedFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  version: number;
  changes: FileChange[];
  conflicts: Conflict[];
}

export interface FileChange {
  id: string;
  participantId: string;
  type: 'insert' | 'delete' | 'replace';
  position: number;
  oldText?: string;
  newText?: string;
  timestamp: Date;
  applied: boolean;
}

export interface Conflict {
  id: string;
  fileId: string;
  changes: FileChange[];
  resolved: boolean;
  resolution?: ConflictResolution;
}

export interface ConflictResolution {
  type: 'manual' | 'ai' | 'merge';
  resolvedBy: string;
  finalText: string;
  timestamp: Date;
}

export interface CursorPosition {
  line: number;
  column: number;
  selection?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

export interface ChatMessage {
  id: string;
  participantId: string;
  content: string;
  type: 'text' | 'code' | 'suggestion' | 'question';
  timestamp: Date;
  reactions: Reaction[];
  replies: ChatMessage[];
}

export interface Reaction {
  type: string;
  participantId: string;
  timestamp: Date;
}

export interface AISuggestion {
  id: string;
  type: 'refactor' | 'optimization' | 'bug-fix' | 'feature';
  description: string;
  code?: string;
  confidence: number;
  applied: boolean;
  suggestedBy: string;
  timestamp: Date;
}

export class CollaborativeCodingManager {
  private sessions: Map<string, CollaborationSession> = new Map();
  private connections: Map<string, WebSocket> = new Map();
  private aiSuggestions: Map<string, AISuggestion[]> = new Map();

  async createSession(name: string, ownerId: string): Promise<CollaborationSession> {
    const session: CollaborationSession = {
      id: this.generateId(),
      name,
      participants: [{
        id: ownerId,
        name: 'Owner',
        role: 'owner',
        status: 'online',
        lastActive: new Date()
      }],
      files: [],
      chat: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.sessions.set(session.id, session);
    return session;
  }

  async joinSession(sessionId: string, participantId: string, name: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'active') {
      return false;
    }

    const participant: Participant = {
      id: participantId,
      name,
      role: 'editor',
      status: 'online',
      lastActive: new Date()
    };

    session.participants.push(participant);
    session.updatedAt = new Date();

    this.broadcastToSession(sessionId, {
      type: 'participant_joined',
      participant
    });

    return true;
  }

  async leaveSession(sessionId: string, participantId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.participants = session.participants.filter(p => p.id !== participantId);
    session.updatedAt = new Date();

    if (session.participants.length === 0) {
      session.status = 'ended';
    }

    this.broadcastToSession(sessionId, {
      type: 'participant_left',
      participantId
    });
  }

  async updateCursor(sessionId: string, participantId: string, cursor: CursorPosition): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.id === participantId);
    if (participant) {
      participant.cursor = cursor;
      participant.lastActive = new Date();
    }

    this.broadcastToSession(sessionId, {
      type: 'cursor_update',
      participantId,
      cursor
    });
  }

  async makeFileChange(sessionId: string, fileId: string, participantId: string, change: Omit<FileChange, 'id' | 'timestamp' | 'applied'>): Promise<FileChange> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const file = session.files.find(f => f.id === fileId);
    if (!file) throw new Error('File not found');

    const fileChange: FileChange = {
      ...change,
      id: this.generateId(),
      timestamp: new Date(),
      applied: false
    };

    // Apply change to file content
    const newContent = this.applyChange(file.content, fileChange);
    
    // Check for conflicts
    const conflicts = this.detectConflicts(file, fileChange);
    
    if (conflicts.length > 0) {
      // AI-powered conflict resolution
      const resolution = await this.resolveConflicts(conflicts, newContent);
      file.conflicts.push(...conflicts);
      
      if (resolution) {
        file.content = resolution.finalText;
        fileChange.applied = true;
      }
    } else {
      file.content = newContent;
      fileChange.applied = true;
    }

    file.changes.push(fileChange);
    file.version++;
    session.updatedAt = new Date();

    this.broadcastToSession(sessionId, {
      type: 'file_change',
      fileId,
      change: fileChange,
      newContent: file.content
    });

    // Generate AI suggestions based on the change
    await this.generateAISuggestions(sessionId, fileId, file.content);

    return fileChange;
  }

  async addChatMessage(sessionId: string, participantId: string, content: string, type: ChatMessage['type'] = 'text'): Promise<ChatMessage> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const message: ChatMessage = {
      id: this.generateId(),
      participantId,
      content,
      type,
      timestamp: new Date(),
      reactions: [],
      replies: []
    };

    session.chat.push(message);
    session.updatedAt = new Date();

    this.broadcastToSession(sessionId, {
      type: 'chat_message',
      message
    });

    // AI-powered chat analysis and suggestions
    if (type === 'question' || content.includes('?')) {
      await this.generateChatSuggestions(sessionId, message);
    }

    return message;
  }

  async generateAISuggestions(sessionId: string, fileId: string, content: string): Promise<void> {
    try {
      const response = await fetch('/api/ai/collaborative-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          fileId,
          content,
          context: this.getSessionContext(sessionId)
        })
      });

      const suggestions: AISuggestion[] = await response.json();
      
      if (!this.aiSuggestions.has(sessionId)) {
        this.aiSuggestions.set(sessionId, []);
      }
      
      this.aiSuggestions.get(sessionId)!.push(...suggestions);

      this.broadcastToSession(sessionId, {
        type: 'ai_suggestions',
        fileId,
        suggestions
      });
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
    }
  }

  async generateChatSuggestions(sessionId: string, message: ChatMessage): Promise<void> {
    try {
      const response = await fetch('/api/ai/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: message.content,
          context: this.getSessionContext(sessionId)
        })
      });

      const suggestions = await response.json();

      this.broadcastToSession(sessionId, {
        type: 'chat_suggestions',
        messageId: message.id,
        suggestions
      });
    } catch (error) {
      console.error('Failed to generate chat suggestions:', error);
    }
  }

  private async resolveConflicts(conflicts: Conflict[], proposedContent: string): Promise<ConflictResolution | null> {
    try {
      const response = await fetch('/api/ai/resolve-conflicts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conflicts,
          proposedContent
        })
      });

      const resolution: ConflictResolution = await response.json();
      return resolution;
    } catch (error) {
      console.error('Failed to resolve conflicts:', error);
      return null;
    }
  }

  private detectConflicts(file: SharedFile, newChange: FileChange): Conflict[] {
    const conflicts: Conflict[] = [];
    
    // Check for overlapping changes
    for (const existingChange of file.changes) {
      if (existingChange.applied && this.changesOverlap(existingChange, newChange)) {
        conflicts.push({
          id: this.generateId(),
          fileId: file.id,
          changes: [existingChange, newChange],
          resolved: false
        });
      }
    }

    return conflicts;
  }

  private changesOverlap(change1: FileChange, change2: FileChange): boolean {
    // Simple overlap detection - can be enhanced with more sophisticated algorithms
    const range1 = this.getChangeRange(change1);
    const range2 = this.getChangeRange(change2);
    
    return range1.start <= range2.end && range2.start <= range1.end;
  }

  private getChangeRange(change: FileChange): { start: number; end: number } {
    const start = change.position;
    const end = change.position + (change.newText?.length || 0);
    return { start, end };
  }

  private applyChange(content: string, change: FileChange): string {
    switch (change.type) {
      case 'insert':
        return content.slice(0, change.position) + (change.newText || '') + content.slice(change.position);
      case 'delete':
        return content.slice(0, change.position) + content.slice(change.position + (change.oldText?.length || 0));
      case 'replace':
        return content.slice(0, change.position) + (change.newText || '') + content.slice(change.position + (change.oldText?.length || 0));
      default:
        return content;
    }
  }

  private getSessionContext(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (!session) return {};

    return {
      participants: session.participants.length,
      files: session.files.length,
      recentChanges: session.files.flatMap(f => f.changes.slice(-5)),
      chatHistory: session.chat.slice(-10)
    };
  }

  private broadcastToSession(sessionId: string, message: any): void {
    // In a real implementation, this would use WebSocket to broadcast to all connected clients
    console.log(`Broadcasting to session ${sessionId}:`, message);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  getSession(sessionId: string): CollaborationSession | undefined {
    return this.sessions.get(sessionId);
  }

  getSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values());
  }

  getAISuggestions(sessionId: string): AISuggestion[] {
    return this.aiSuggestions.get(sessionId) || [];
  }
}

export const collaborativeCoding = new CollaborativeCodingManager();
