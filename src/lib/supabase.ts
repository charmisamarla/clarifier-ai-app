import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Mock mode only when credentials are genuinely missing/placeholder
export const IS_MOCK_MODE = !import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder') ||
  !import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY === 'placeholder-anon-key';

class MockQueryBuilder {
  tableName: string;
  filters: Array<(item: any) => boolean> = [];
  orderCol: string | null = null;
  orderAscending: boolean = true;
  limitCount: number | null = null;
  isSingle: boolean = false;
  isCount: boolean = false;
  operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  opData: any = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields?: string, options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }) {
    if (options?.count) {
      this.isCount = true;
    }
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push(item => {
      return item[column] === value;
    });
    return this;
  }

  ilike(column: string, pattern: string) {
    const regexStr = pattern.replace(/%/g, '.*');
    const regex = new RegExp(`^${regexStr}$`, 'i');
    this.filters.push(item => {
      return regex.test(item[column] || '');
    });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderCol = column;
    this.orderAscending = options?.ascending !== false;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  insert(data: any) {
    this.operation = 'insert';
    this.opData = data;
    return this;
  }

  update(data: any) {
    this.operation = 'update';
    this.opData = data;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  upsert(data: any, options?: { onConflict?: string }) {
    this.operation = 'upsert';
    this.opData = data;
    return this;
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const result = await this.execute();
      return onfulfilled ? onfulfilled(result) : result;
    } catch (err) {
      if (onrejected) return onrejected(err);
      throw err;
    }
  }

  private async execute() {
    const storageKey = `mock_supabase_${this.tableName}`;
    let items = JSON.parse(localStorage.getItem(storageKey) || '[]');

    let data: any = null;
    let count: number | null = null;
    let error: any = null;

    if (this.operation === 'select') {
      let filtered = items.filter((item: any) => this.filters.every(f => f(item)));
      
      if (this.orderCol) {
        filtered.sort((a: any, b: any) => {
          const valA = a[this.orderCol!];
          const valB = b[this.orderCol!];
          if (valA === valB) return 0;
          if (valA === undefined || valA === null) return 1;
          if (valB === undefined || valB === null) return -1;
          const comparison = valA < valB ? -1 : 1;
          return this.orderAscending ? comparison : -comparison;
        });
      }

      if (this.limitCount !== null) {
        filtered = filtered.slice(0, this.limitCount);
      }

      if (this.isCount) {
        count = filtered.length;
      }

      if (this.isSingle) {
        data = filtered[0] || null;
        if (!data) {
          error = { message: 'Row not found', code: 'PGRST116' };
        }
      } else {
        data = filtered;
      }

      // Populate nested questions object for bookmarks/revision_queue
      if (Array.isArray(data) && (this.tableName === 'bookmarks' || this.tableName === 'revision_queue')) {
        const questions = JSON.parse(localStorage.getItem('mock_supabase_questions') || '[]');
        data = data.map(item => {
          const q = questions.find((qi: any) => qi.id === item.question_id);
          return {
            ...item,
            questions: q || null
          };
        });
      }

    } else if (this.operation === 'insert') {
      const toInsert = Array.isArray(this.opData) ? this.opData : [this.opData];
      const newItems = toInsert.map((item: any) => ({
        id: item.id || crypto.randomUUID(),
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
        ...item
      }));

      items.push(...newItems);
      localStorage.setItem(storageKey, JSON.stringify(items));
      data = Array.isArray(this.opData) ? newItems : newItems[0];

    } else if (this.operation === 'update') {
      items = items.map((item: any) => {
        const match = this.filters.every(f => f(item));
        if (match) {
          return {
            ...item,
            ...this.opData,
            updated_at: new Date().toISOString()
          };
        }
        return item;
      });

      localStorage.setItem(storageKey, JSON.stringify(items));
      
      const filtered = items.filter((item: any) => this.filters.every(f => f(item)));
      data = this.isSingle ? (filtered[0] || null) : filtered;

    } else if (this.operation === 'upsert') {
      const toUpsert = Array.isArray(this.opData) ? this.opData : [this.opData];
      const results: any[] = [];

      toUpsert.forEach((item: any) => {
        const existingIdx = items.findIndex((i: any) => i.id === item.id);
        const now = new Date().toISOString();
        if (existingIdx >= 0) {
          items[existingIdx] = {
            ...items[existingIdx],
            ...item,
            updated_at: now
          };
          results.push(items[existingIdx]);
        } else {
          const newItem = {
            id: item.id || crypto.randomUUID(),
            created_at: now,
            updated_at: now,
            ...item
          };
          items.push(newItem);
          results.push(newItem);
        }
      });

      localStorage.setItem(storageKey, JSON.stringify(items));
      data = Array.isArray(this.opData) ? results : results[0];

    } else if (this.operation === 'delete') {
      items = items.filter((item: any) => !this.filters.every(f => f(item)));
      localStorage.setItem(storageKey, JSON.stringify(items));
      data = null;
    }

    return { data, error, count };
  }
}

const authListeners = new Set<(event: string, session: any) => void>();

const mockAuth = {
  signUp: async ({ email, password, options }: any) => {
    const users = JSON.parse(localStorage.getItem('mock_supabase_users') || '[]');
    if (users.some((u: any) => u.email === email)) {
      return { data: { user: null }, error: { message: 'User already exists' } };
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      user_metadata: options?.data || {},
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('mock_supabase_users', JSON.stringify(users));

    const profiles = JSON.parse(localStorage.getItem('mock_supabase_profiles') || '[]');
    const newProfile = {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.user_metadata.full_name || null,
      avatar_url: null,
      xp: 0,
      level: 1,
      streak: 0,
      longest_streak: 0,
      theme: 'dark',
      onboarding_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    profiles.push(newProfile);
    localStorage.setItem('mock_supabase_profiles', JSON.stringify(profiles));

    const session = {
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: newUser,
    };

    localStorage.setItem('mock_supabase_session', JSON.stringify(session));
    
    setTimeout(() => {
      authListeners.forEach(listener => listener('SIGNED_IN', session));
    }, 10);

    return { data: { user: newUser, session }, error: null };
  },

  signInWithPassword: async ({ email, password }: any) => {
    const users = JSON.parse(localStorage.getItem('mock_supabase_users') || '[]');
    const user = users.find((u: any) => u.email === email);
    if (!user) {
      return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
    }

    const session = {
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user,
    };

    localStorage.setItem('mock_supabase_session', JSON.stringify(session));

    setTimeout(() => {
      authListeners.forEach(listener => listener('SIGNED_IN', session));
    }, 10);

    return { data: { user, session }, error: null };
  },

  signInWithOAuth: async ({ provider, options }: any) => {
    // Generate a stable unique ID per browser (not shared across browsers/machines)
    // This ensures each browser gets its own isolated Google user in localStorage
    let browserOAuthId = localStorage.getItem('mock_oauth_browser_id');
    if (!browserOAuthId) {
      browserOAuthId = crypto.randomUUID();
      localStorage.setItem('mock_oauth_browser_id', browserOAuthId);
    }

    // Generate a unique but stable display name based on browser ID
    const shortId = browserOAuthId.slice(0, 6).toUpperCase();

    const mockUser = {
      id: browserOAuthId,
      email: `user-${shortId}@mock-google.local`,
      user_metadata: {
        full_name: `Google User (${shortId})`,
        avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${browserOAuthId}`
      },
      created_at: new Date().toISOString(),
    };

    const session = {
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: mockUser,
    };

    localStorage.setItem('mock_supabase_session', JSON.stringify(session));

    // Create profile if it doesn't exist for this browser's unique ID
    const profiles = JSON.parse(localStorage.getItem('mock_supabase_profiles') || '[]');
    if (!profiles.some((p: any) => p.id === mockUser.id)) {
      const newProfile = {
        id: mockUser.id,
        email: mockUser.email,
        full_name: mockUser.user_metadata.full_name,
        avatar_url: mockUser.user_metadata.avatar_url,
        xp: 0,
        level: 1,
        streak: 0,
        longest_streak: 0,
        theme: 'dark',
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      profiles.push(newProfile);
      localStorage.setItem('mock_supabase_profiles', JSON.stringify(profiles));
    }

    setTimeout(() => {
      authListeners.forEach(listener => listener('SIGNED_IN', session));
      if (options?.redirectTo) {
        window.location.href = options.redirectTo;
      }
    }, 500);

    return { data: { provider, url: '#' }, error: null };
  },

  signOut: async () => {
    localStorage.removeItem('mock_supabase_session');
    setTimeout(() => {
      authListeners.forEach(listener => listener('SIGNED_OUT', null));
    }, 10);
    return { error: null };
  },

  getSession: async () => {
    const session = JSON.parse(localStorage.getItem('mock_supabase_session') || 'null');
    return { data: { session }, error: null };
  },

  onAuthStateChange: (callback: any) => {
    authListeners.add(callback);
    const session = JSON.parse(localStorage.getItem('mock_supabase_session') || 'null');
    setTimeout(() => {
      callback('INITIAL_SESSION', session);
    }, 10);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            authListeners.delete(callback);
          }
        }
      }
    };
  }
};

class MockSupabaseClient {
  auth = mockAuth;

  from(tableName: string) {
    return new MockQueryBuilder(tableName);
  }
}

export const supabase = IS_MOCK_MODE
  ? (new MockSupabaseClient() as any)
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })

if (!IS_MOCK_MODE && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  console.warn(
    '⚠️ Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).\n' +
    'Copy .env.example to .env and fill in your Supabase credentials.\n' +
    'The app will load but authentication and data features will not work.'
  )
}

export default supabase
