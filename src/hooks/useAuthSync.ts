"use client";

import { useEffect } from "react";

const AUTH_COOKIE_NAME = "token";
const AUTH_STORAGE_KEY = "auth_token";

/**
 * Hook to sync auth token from localStorage to cookie
 * This enables middleware to access the token
 */
export function useAuthSync() {
  useEffect(() => {
    // Check if token exists in localStorage but not in cookie
    const storageToken = localStorage.getItem(AUTH_STORAGE_KEY);

    if (storageToken) {
      // Check if cookie already has token
      const cookieHasToken = document.cookie
        .split("; ")
        .some((row) => row.startsWith(`${AUTH_COOKIE_NAME}=`));

      if (!cookieHasToken) {
        // Sync localStorage token to cookie
        // Set cookie with 7 days expiry
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);

        document.cookie = `${AUTH_COOKIE_NAME}=${storageToken}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`;

        console.log("Token synced from localStorage to cookie");
      }
    }
  }, []);
}

/**
 * Utility to set token in both localStorage and cookie
 */
export function setAuthToken(token: string) {
  // Set in localStorage
  localStorage.setItem(AUTH_STORAGE_KEY, token);

  // Set in cookie with 7 days expiry
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);

  document.cookie = `${AUTH_COOKIE_NAME}=${token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`;
}

/**
 * Utility to clear token from both localStorage and cookie
 */
export function clearAuthToken() {
  // Clear localStorage
  localStorage.removeItem(AUTH_STORAGE_KEY);

  // Clear cookie
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
