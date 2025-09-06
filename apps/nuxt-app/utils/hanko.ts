import { Hanko, UnauthorizedError, TechnicalError } from '@teamhanko/hanko-frontend-sdk';
import type { FlowName } from '@teamhanko/hanko-frontend-sdk';
import { useRuntimeConfig } from '#imports';



export const useHanko = () => {
  const config = useRuntimeConfig();

  const hanko = new Hanko(config.public.hankoApiUrl);

  const handleAuthFlow = async (flowName: FlowName = 'login') => {
    try {
      const state = await hanko.createState(flowName, {
        dispatchAfterStateChangeEvent: true,
        loadFromCache: true,
      });

      return state;
    } catch (error: unknown) {
      console.error('Authentication error:', error);

      // Type guard for proper error handling
      if (error instanceof TechnicalError) {
        console.error('Technical error:', error.message);
      } else if (error instanceof UnauthorizedError) {
        console.error('Unauthorized error:', error.message);
      } else if (error instanceof Error) {
        console.error('General error:', error.message);
      }

      if (import.meta.client) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        window.location.href = `/login?error=${encodeURIComponent(errorMessage)}`;
      }
    }
  };

  const getCurrentUser = async () => {
    try {
      return await hanko.getUser();
    } catch (error: unknown) {
      console.error('Failed to get current user:', error);

      // Handle specific error types
      if (error instanceof UnauthorizedError) {
        // User is not authenticated
        return null;
      } else if (error instanceof TechnicalError) {
        // Technical/network error
        console.error('Technical error getting user:', error.message);
        return null;
      }

      return null;
    }
  };

  const validateSession = async () => {
    try {
      return await hanko.validateSession();
    } catch (error: unknown) {
      console.error('Session validation failed:', error);

      if (error instanceof TechnicalError) {
        console.error('Technical error during session validation:', error.message);
      }

      return { is_valid: false };
    }
  };

  const logout = async () => {
    try {
      await hanko.logout();
      return true;
    } catch (error: unknown) {
      console.error('Logout failed:', error);

      if (error instanceof TechnicalError) {
        console.error('Technical error during logout:', error.message);
      }

      return false;
    }
  };

  return {
    hanko,
    handleAuthFlow,
    getCurrentUser,
    validateSession,
    logout,
  };
};