export function navigateTo(path: string, replace: boolean = false) {
  if (typeof window === "undefined") {
    return;
  }

  if (replace) {
    window.location.replace(path);
    return;
  }

  window.location.assign(path);
}
