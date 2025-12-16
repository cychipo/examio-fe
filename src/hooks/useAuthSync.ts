"use client";

import { useEffect } from "react";

const AUTH_COOKIE_NAME = "token";
const AUTH_STORAGE_KEY = "auth_token";

/**
 * Hook to sync auth token from localStorage to cookie
 * This enables middleware to access the token
 */
export function useAuthSync() {
  // Logic removed: No longer syncing localStorage to cookie.
  // The backend sets the HttpOnly cookie for auth.
}

/**
 * Utility to set token in localStorage (for API headers)
 */
export function setAuthToken(token: string) {
  // Set in localStorage
  localStorage.setItem(AUTH_STORAGE_KEY, token);
}

/**
 * Utility to clear token from localStorage
 */
export function clearAuthToken() {
  // Clear localStorage
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
