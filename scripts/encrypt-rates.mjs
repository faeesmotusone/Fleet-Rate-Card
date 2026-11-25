/**
 * Build-time script: encrypts src/data/rates.json → public/rates.enc
 * using AES-256-GCM with PBKDF2-derived key from the password.
 * Run: node scripts/encrypt-rates.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { webcrypto } from 'crypto';

const PASSWORD = '123';

async function encrypt() {
  const json = readFileSync('src/data/rates.json', 'utf-8');
  const plaintext = new TextEncoder().encode(json);

  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const iv = webcrypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await webcrypto.subtle.importKey(
    'raw', new TextEncoder().encode(PASSWORD), 'PBKDF2', false, ['deriveKey']
  );
  const key = await webcrypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  const ciphertext = await webcrypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key, plaintext
  );

  // Combine: salt (16) + iv (12) + ciphertext
  const result = new Uint8Array(16 + 12 + ciphertext.byteLength);
  result.set(salt, 0);
  result.set(iv, 16);
  result.set(new Uint8Array(ciphertext), 28);

  mkdirSync('public', { recursive: true });
  writeFileSync('public/rates.enc', result);

  const sizeKB = Math.round(result.byteLength / 1024);
  console.log(`✓ Encrypted rates.json (${sizeKB} KB) → public/rates.enc`);
}

encrypt().catch(err => { console.error(err); process.exit(1); });
