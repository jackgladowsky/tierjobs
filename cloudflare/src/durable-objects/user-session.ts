/**
 * User Session Durable Object
 * 
 * Maintains stateful user sessions for:
 * - Saved jobs
 * - Search preferences
 * - Chat history context
 */

export interface UserSessionState {
  id: string;
  savedJobs: string[];
  preferences: {
    preferredTiers?: string[];
    preferredLevels?: string[];
    preferredLocations?: string[];
    remoteOnly?: boolean;
  };
  recentSearches: string[];
  createdAt: number;
  lastActiveAt: number;
}

export class UserSession {
  private state: DurableObjectState;
  private session: UserSessionState | null = null;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async initialize(id: string): Promise<UserSessionState> {
    const stored = await this.state.storage.get<UserSessionState>('session');
    
    if (stored) {
      this.session = stored;
      this.session.lastActiveAt = Date.now();
      await this.state.storage.put('session', this.session);
      return this.session;
    }
    
    this.session = {
      id,
      savedJobs: [],
      preferences: {},
      recentSearches: [],
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };
    
    await this.state.storage.put('session', this.session);
    return this.session;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Initialize session if needed
    if (!this.session) {
      const id = url.searchParams.get('id') || crypto.randomUUID();
      await this.initialize(id);
    }
    
    switch (request.method) {
      case 'GET':
        if (path === '/') {
          return Response.json(this.session);
        }
        if (path === '/saved-jobs') {
          return Response.json({ savedJobs: this.session?.savedJobs || [] });
        }
        if (path === '/preferences') {
          return Response.json({ preferences: this.session?.preferences || {} });
        }
        break;
        
      case 'POST':
        if (path === '/save-job') {
          const { jobId } = await request.json() as { jobId: string };
          if (this.session && !this.session.savedJobs.includes(jobId)) {
            this.session.savedJobs.push(jobId);
            this.session.lastActiveAt = Date.now();
            await this.state.storage.put('session', this.session);
          }
          return Response.json({ success: true, savedJobs: this.session?.savedJobs });
        }
        
        if (path === '/unsave-job') {
          const { jobId } = await request.json() as { jobId: string };
          if (this.session) {
            this.session.savedJobs = this.session.savedJobs.filter(id => id !== jobId);
            this.session.lastActiveAt = Date.now();
            await this.state.storage.put('session', this.session);
          }
          return Response.json({ success: true, savedJobs: this.session?.savedJobs });
        }
        
        if (path === '/preferences') {
          const { preferences } = await request.json() as { preferences: UserSessionState['preferences'] };
          if (this.session) {
            this.session.preferences = { ...this.session.preferences, ...preferences };
            this.session.lastActiveAt = Date.now();
            await this.state.storage.put('session', this.session);
          }
          return Response.json({ success: true, preferences: this.session?.preferences });
        }
        
        if (path === '/search') {
          const { query } = await request.json() as { query: string };
          if (this.session && query) {
            this.session.recentSearches = [
              query,
              ...this.session.recentSearches.filter(s => s !== query),
            ].slice(0, 10);
            this.session.lastActiveAt = Date.now();
            await this.state.storage.put('session', this.session);
          }
          return Response.json({ success: true, recentSearches: this.session?.recentSearches });
        }
        break;
        
      case 'DELETE':
        if (path === '/') {
          await this.state.storage.delete('session');
          this.session = null;
          return Response.json({ success: true });
        }
        break;
    }
    
    return new Response('Not Found', { status: 404 });
  }
}
