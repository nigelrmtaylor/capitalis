import { Hanko } from '@teamhanko/hanko-frontend-sdk';

export const useHanko = () => {
  const config = useRuntimeConfig();
  
  // Initialize Hanko client with the API URL from runtime config
  const hanko = new Hanko(config.public.hankoApiUrl);
  
  // Handle authentication state changes
  const handleAuthFlow = async () => {
    try {
      // Check if we're in the middle of an auth flow
      const authFlow = hanko.auth.getAuthFlow();
      
      if (authFlow) {
        await hanko.auth.finishAuthFlow();
        // Redirect to the dashboard or return URL after successful auth
        const returnTo = new URLSearchParams(window.location.search).get('return_to') || '/';
        window.location.href = returnTo;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      // Redirect to login page with error
      window.location.href = `/login?error=${encodeURIComponent(error.message)}`;
    }
  };
  
  // Get current user
  const getCurrentUser = async () => {
    try {
      return await hanko.user.getCurrent();
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  };
  
  // Logout
  const logout = async () => {
    try {
      await hanko.user.logout();
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  };
  
  return {
    hanko,
    handleAuthFlow,
    getCurrentUser,
    logout,
  };
};

// Helper function to initialize Hanko on the client side
export const initHanko = () => {
  if (process.client) {
    const { hanko } = useHanko();
    return hanko;
  }
  return null;
};
