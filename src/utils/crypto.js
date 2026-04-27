/**
 * Abyssinia AES-256-GCM encryption for localStorage persistence.
 * Uses the Web Crypto API — works in all modern browsers.
 */

const SALT = new TextEncoder().encode('Abyssinia-Smart-2026');
const KEY_USAGE = ['encrypt', 'decrypt'];

// Derive a stable AES key from a passphrase
async function deriveKey(passphrase = 'boa-device-key') {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: SALT, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    KEY_USAGE
  );
}

/**
 * Encrypt a JSON-serializable value → Base64 string
 */
export async function encryptData(data) {
  try {
    const key = await deriveKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plaintext = new TextEncoder().encode(JSON.stringify(data));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
    // Combine IV + ciphertext into a single buffer
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);
    return btoa(String.fromCharCode(...combined));
  } catch {
    // Fallback: return unencrypted JSON string
    return JSON.stringify(data);
  }
}

/**
 * Decrypt a Base64 string → parsed JSON object
 */
export async function decryptData(encryptedStr) {
  try {
    // Check if it's plain JSON (legacy/fallback data)
    if (encryptedStr.startsWith('{') || encryptedStr.startsWith('[')) {
      return JSON.parse(encryptedStr);
    }
    const key = await deriveKey();
    const combined = Uint8Array.from(atob(encryptedStr), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return JSON.parse(new TextDecoder().decode(plaintext));
  } catch {
    // If decryption fails, try plain JSON parse as last resort
    try { return JSON.parse(encryptedStr); } catch { return {}; }
  }
}

/**
 * Synchronous read for initial store hydration (reads from cache or returns {})
 * The async encrypted read happens in the background and re-hydrates.
 */
export function readPersistedSync(storageKey = 'boa-state') {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return {};
    // Try plain JSON first (for backward compat)
    if (raw.startsWith('{')) return JSON.parse(raw);
    return {}; // encrypted data will be loaded async
  } catch { return {}; }
}

/**
 * Async read — decrypts the stored data
 */
export async function readPersistedAsync(storageKey = 'boa-state') {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return {};
    return await decryptData(raw);
  } catch { return {}; }
}

/**
 * Async write — encrypts before storing
 */
export async function writePersisted(data, storageKey = 'boa-state') {
  try {
    const encrypted = await encryptData(data);
    localStorage.setItem(storageKey, encrypted);
  } catch {
    // Fallback to plain JSON
    localStorage.setItem(storageKey, JSON.stringify(data));
  }
}
