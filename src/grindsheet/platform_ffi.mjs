export function readPassphrase() {
  try {
    return localStorage.getItem("grindsheet.passphrase") ?? "";
  } catch {
    return "";
  }
}

export function writePassphrase(value) {
  try {
    if (value) localStorage.setItem("grindsheet.passphrase", value);
    else localStorage.removeItem("grindsheet.passphrase");
  } catch {
    // Local storage can be blocked. The passphrase still lives in memory.
  }
}

export function decodeBase64(value) {
  try {
    const binary = atob(String(value).replace(/\s/g, ""));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return "";
  }
}

export function toggleTheme() {
  const root = document.documentElement;
  const current =
    root.dataset.theme ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try {
    localStorage.setItem("grindsheet.theme", next);
  } catch {
    // Storage can be blocked. The theme still applies until reload.
  }
}
