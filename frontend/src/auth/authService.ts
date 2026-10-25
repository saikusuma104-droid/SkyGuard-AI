import { AuthUser, LoginCredentials, AuthResponse } from '../types';

const AUTH_STORAGE_KEY = 'skyguard_auth_user_session';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const username = credentials.username.trim();
    const password = credentials.password.trim();

    if (!username || !password) {
      return {
        success: false,
        error: 'Please enter both username and password.',
      };
    }

    const authUser: AuthUser = {
      username: username,
      name: username.toUpperCase(),
      role: 'Admin',
      email: `${username}@skyguard.ai`,
      designation: 'Weather Operations Lead',
    };

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    } catch (e) {
      console.warn('Unable to persist session to localStorage', e);
    }

    return {
      success: true,
      user: authUser,
    };
  },

  getCurrentUser: (): AuthUser | null => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as AuthUser;
      }
    } catch (e) {
      console.warn('Error reading auth session', e);
    }
    return null;
  },

  logout: async (): Promise<void> => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('Error clearing auth session', e);
    }
  },
};
