/**
 * AES-256-GCM encryption/decryption using Web Crypto API.
 * The password is hashed with PBKDF2 (100k iterations) to derive the AES key.
 * File format: 16-byte salt + 12-byte IV + ciphertext
 */

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
}

/** Decrypt an ArrayBuffer (salt+iv+ciphertext) with a password. Throws on wrong password. */
export async function decryptData(encrypted: ArrayBuffer, password: string): Promise<string> {
  const bytes = new Uint8Array(encrypted);
  const salt = bytes.slice(0, 16);
  const iv = bytes.slice(16, 28);
  const ciphertext = bytes.slice(28);
  const key = await deriveKey(password, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
}
