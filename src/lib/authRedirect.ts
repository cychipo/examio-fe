const RETURN_TO_KEY = "auth_return_to";

export function normalizeReturnPath(path?: string | null) {
  if (!path || !path.startsWith("/")) {
    return "/k";
  }

  if (path.startsWith("//")) {
    return "/k";
  }

  return path;
}

export function getCurrentReturnPath() {
  if (typeof window === "undefined") {
    return "/k";
  }

  return normalizeReturnPath(
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
  );
}

export function setRedirectBackTarget(path?: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(RETURN_TO_KEY, normalizeReturnPath(path));
}

export function getRedirectBackTarget() {
  if (typeof window === "undefined") {
    return "/k";
  }

  const stored = window.localStorage.getItem(RETURN_TO_KEY);
  if (!stored) {
    return "/k";
  }

  return normalizeReturnPath(stored);
}

export function clearRedirectBackTarget() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(RETURN_TO_KEY);
}
