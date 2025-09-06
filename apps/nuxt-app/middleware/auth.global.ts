import { defineNuxtRouteMiddleware } from '#imports';
// Public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/auth/callback'];

// Simple middleware function
export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware on server
  if (import.meta.server) return;

  // Allow access to public routes
  if (publicRoutes.includes(to.path)) return;

  // For now, just allow all routes
  // TODO: Implement proper authentication check
  return;
});
