import { AuthUser, LoginCredentials, AuthResponse } from '../types';

export const DEMO_ADMIN_CREDENTIALS = [
  {
    username: 'admin1',
    password: 'lesgo',
    user: {
      username: 'admin1',
      name: 'System Admin 1',
      role: 'Admin' as const,
      email: 'admin1@imd-aws.gov.in',
      designation: 'Senior Synoptic Operations Lead',
    },
  },
  {
    username: 'admin2',
    password: 'lessgoo',
    user: {
      username: 'admin2',
      name: 'System Admin 2',
      role: 'Admin' as const,
      email: 'admin2@imd-aws.gov.in',
      designation: 'Network Integrity Controller',
    },
  },
  {
    username: 'admin3',
    password: 'lesssgooo',
    user: {
      username: 'admin3',
      name: 'System Admin 3',
      role: 'Admin' as const,
      email: 'admin3@imd-aws.gov.in',
      designation: 'Edge Sensor Calibration Lead',
    },
  },
];

const AUTH_STORAGE_KEY = 'skyguard_auth_user_session';

/**
 * Authentication service abstraction designed so that a real backend
 * REST/GraphQL/OAuth provider can easily replace this implementation.
 */
export const authService = {
  /**
   * Authenticate with username and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Simulate brief asynchronous network dispatch (150ms)
    await new Promise((resolve) => setTimeout(resolve, 150));

    const trimmedUsername = credentials.username.trim();
    const trimmedPassword = credentials.password.trim();

    const matchedAccount = DEMO_ADMIN_CREDENTIALS.find(
      (account) =>
        account.username.toLowerCase() === trimmedUsername.toLowerCase() &&
        account.password === trimmedPassword
    );

    if (matchedAccount) {
      const authUser = matchedAccount.user;
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      } catch (e) {
        console.warn('Unable to persist session to localStorage', e);
      }
      return {
        success: true,
        user: authUser,
      };
    }

    return {
      success: false,
      error: 'Invalid credentials. Please verify your username and password, or select a demo admin account below.',
    };
  },

  /**
   * Get currently authenticated user from persisted session
   */
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

  /**
   * Terminate user session
   */
  logout: async (): Promise<void> => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('Error clearing auth session', e);
    }
  },

  /**
   * Helper to retrieve list of available demo accounts for demo/testing display
   */
  getDemoAccounts: () => {
    return DEMO_ADMIN_CREDENTIALS.map((c) => ({
      username: c.username,
      password: c.password,
      role: c.user.role,
      name: c.user.name,
      designation: c.user.designation,
    }));
  },
};
