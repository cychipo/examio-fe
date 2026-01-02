"use client";

import { useEffect } from "react";

const AUTH_COOKIE_NAME = "token";
const AUTH_STORAGE_KEY = "auth_token";

/**
 * Helper to set a cookie
 */
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Helper to delete a cookie
 */
function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

/**
 * Helper to get a cookie value
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

/**
 * Hook to sync auth token from localStorage to cookie
 * This enables middleware to access the token
 */
export function useAuthSync() {
  useEffect(() => {
    // Sync token from localStorage to cookie on mount
    const token = localStorage.getItem(AUTH_STORAGE_KEY);
    if (token) {
      // Only set cookie if it doesn't exist or is different
      const existingCookie = getCookie(AUTH_COOKIE_NAME);
      if (!existingCookie || existingCookie !== token) {
        setCookie(AUTH_COOKIE_NAME, token);
      }
    }
  }, []);
}

/**
 * Utility to set token in localStorage and cookie (for API headers and middleware)
 */
export function setAuthToken(token: string) {
  // Set in localStorage
  localStorage.setItem(AUTH_STORAGE_KEY, token);
  // Set in cookie for middleware access
  setCookie(AUTH_COOKIE_NAME, token);
}

/**
 * Utility to clear token from localStorage and cookie
 */
export function clearAuthToken() {
  // Clear localStorage
  localStorage.removeItem(AUTH_STORAGE_KEY);
  // Clear cookie
  deleteCookie(AUTH_COOKIE_NAME);
}
