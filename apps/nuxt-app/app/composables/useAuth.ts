import { ref, onMounted } from 'vue';
import { navigateTo, useNuxtApp } from '#imports';
import type { User } from '@teamhanko/hanko-frontend-sdk';

/**
 * Unified authentication composable for Hanko authentication
 * Combines functionality from both useAuth.ts and useHankoAuth.ts
 */
export const useAuth = () => {

  // State
  interface AuthUser extends Partial<User> {
    authenticated: boolean;
    email?: string;
  }

  const user = ref<AuthUser | null>(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(true);
  const error = ref<Error | null>(null);

  // Initialize auth state
  if (import.meta.client) {
    try {
      // Get the Hanko client from the plugin
      const nuxtApp = useNuxtApp();
      // Use type assertion with any to bypass TypeScript errors
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hankoFn = (nuxtApp as any).$hanko;
      
      if (typeof hankoFn === 'function') {
        const hanko = hankoFn();
        
        if (hanko && typeof hanko.onAuthFlowCompleted === 'function') {
          // Register auth flow completion handler
          hanko.onAuthFlowCompleted((userData: Record<string, unknown>) => {
            isAuthenticated.value = true;
            user.value = { 
              authenticated: true,
              email: (userData.email as string) || '',
              ...userData as Partial<User>
            };
            isLoading.value = false;
          });
        }
      }
    } catch (err) {
      console.error('Failed to initialize Hanko client:', err);
    }
  }

  /**
   * Check if the user is authenticated
   * Uses localStorage to check for token presence
   */
  const checkAuth = async () => {
    try {
      if (!import.meta.client) return;

      isLoading.value = true;

      // Check for authentication token
      const token = localStorage.getItem('hanko_token');
      if (token) {
        isAuthenticated.value = true;
        // Store minimal user info
        user.value = { authenticated: true };
        error.value = null;
        return true;
      } else {
        user.value = null;
        isAuthenticated.value = false;
        return false;
      }
    } catch (err) {
      console.error('Authentication check failed:', err);
      user.value = null;
      isAuthenticated.value = false;
      error.value = err as Error;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Login with email
   * Triggers a custom event for Hanko web component to handle
   */
  const login = async (email: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Use the Hanko web component for login
      // This avoids direct API calls to private methods
      const loginEvent = new CustomEvent('hanko-login-requested', {
        detail: { email }
      });
      document.dispatchEvent(loginEvent);

      // User will receive a magic link via email
      return { success: true };
    } catch (err) {
      console.error('Login failed:', err);
      error.value = err as Error;
      return { success: false, error: err };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Logout the user
   * Removes token and redirects to login page
   */
  const logout = async () => {
    try {
      // Simple logout by removing the token
      localStorage.removeItem('hanko_token');

      user.value = null;
      isAuthenticated.value = false;
      await navigateTo('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      error.value = err as Error;
      throw err;
    }
  };

  // Check auth status when the composable is used
  if (import.meta.client) {
    onMounted(() => {
      checkAuth();
    });
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkAuth
  };
};
