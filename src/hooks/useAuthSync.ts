"use client";

import { useEffect } from "react";

import { syncRefreshTokenApi } from "@/apis/authApi";

const AUTH_COOKIE_NAME = "token";
const AUTH_STORAGE_KEY = "auth_token";
const REFRESH_STORAGE_KEY = "refresh_token";
const SESSION_STORAGE_KEY = "session_id";

/**
 * Helper to set a cookie
 */
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  const isProduction = window.location.hostname === "kma.fayedark.com";
  const domain = isProduction ? ";domain=.fayedark.com" : "";
  const secure = isProduction ? ";Secure" : "";
  const sameSite = isProduction ? ";SameSite=None" : ";SameSite=Lax";

  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/${domain}${sameSite}${secure}`;
}

/**
 * Helper to delete a cookie
 */
function deleteCookie(name: string) {
  const isProduction =
    typeof window !== "undefined" &&
    window.location.hostname === "kma.fayedark.com";
  const domain = isProduction ? ";domain=.fayedark.com" : "";
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${domain}`;
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
    console.log("[auth-sync] bootstrap start", {
      href: window.location.href,
      authToken: localStorage.getItem(AUTH_STORAGE_KEY),
      refreshToken: localStorage.getItem(REFRESH_STORAGE_KEY),
      sessionId: localStorage.getItem(SESSION_STORAGE_KEY),
      cookieToken: getCookie(AUTH_COOKIE_NAME),
    });

    // Sync token from localStorage to cookie on mount
    const token = localStorage.getItem(AUTH_STORAGE_KEY);
    if (token) {
      // Only set cookie if it doesn't exist or is different
      const existingCookie = getCookie(AUTH_COOKIE_NAME);
      if (!existingCookie || existingCookie !== token) {
        setCookie(AUTH_COOKIE_NAME, token);
        console.log("[auth-sync] synced auth_token to cookie");
      }
    }

    const url = new URL(window.location.href);
    const tokenFromQuery = url.searchParams.get("token");
    const refreshTokenFromQuery = url.searchParams.get("refreshToken");
    const sessionIdFromQuery = url.searchParams.get("sessionId");

    if (tokenFromQuery) {
      console.log("[auth-sync] token found in query");
      setAuthToken(tokenFromQuery);
      url.searchParams.delete("token");
    }

    if (refreshTokenFromQuery) {
      console.log("[auth-sync] refreshToken found in query");
      setStoredRefreshToken(refreshTokenFromQuery);
      url.searchParams.delete("refreshToken");
    }

    if (sessionIdFromQuery) {
      console.log("[auth-sync] sessionId found in query", sessionIdFromQuery);
      localStorage.setItem(SESSION_STORAGE_KEY, sessionIdFromQuery);
      url.searchParams.delete("sessionId");
    }

    if (tokenFromQuery || refreshTokenFromQuery || sessionIdFromQuery) {
      console.log("[auth-sync] cleaned auth query params from url");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }

    const storedToken = localStorage.getItem(AUTH_STORAGE_KEY);
    const storedRefreshToken = localStorage.getItem(REFRESH_STORAGE_KEY);
    const storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);

    console.log("[auth-sync] post-query storage snapshot", {
      storedToken,
      storedRefreshToken,
      storedSessionId,
    });

    if (storedToken && !storedRefreshToken && storedSessionId) {
      console.log("[auth-sync] missing refresh_token, calling sync-refresh-token", {
        sessionId: storedSessionId,
      });
      void syncRefreshTokenApi(storedSessionId || undefined)
        .then((response) => {
          console.log("[auth-sync] sync-refresh-token success", response);
          if (response.refreshToken) {
            setStoredRefreshToken(response.refreshToken);
            console.log("[auth-sync] stored refresh_token from sync API");
          }
        })
        .catch((error) => {
          console.error("[auth-sync] sync-refresh-token failed", error);
        });
    } else if (storedToken && !storedRefreshToken) {
      console.warn("[auth-sync] skip sync-refresh-token because session_id is missing");
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

export function setStoredRefreshToken(refreshToken: string) {
  localStorage.setItem(REFRESH_STORAGE_KEY, refreshToken);
}

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_STORAGE_KEY);
}

export function getStoredSessionId() {
  return localStorage.getItem(SESSION_STORAGE_KEY);
}

export function setStoredSessionId(sessionId: string) {
  localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
}

export function clearStoredSessionId() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function clearStoredRefreshToken() {
  localStorage.removeItem(REFRESH_STORAGE_KEY);
}
