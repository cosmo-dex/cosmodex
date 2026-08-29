export const SESSION_COOKIE = 'cosmo_session';

export interface SessionPayload {
  userId: string;
  username: string;
  email: string;
  role?: string;
  avatarId?: string | null;
  experienceLevel?: string | null;
  interests?: string[];
  xpTotal?: number;
  level?: number;
  createdAt?: string;
  exp?: number;
}

const SECRET_KEY = (() => {
  const key =
    process.env.SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET;
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET, NEXTAUTH_SECRET, or AUTH_SECRET must be set in production');
    }
    return 'cosmodex-dev-only-fallback-key-not-for-production!!';
  }
  return key;
})();

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

/**
 * Converts ArrayBuffer to Base64URL string
 */
function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Converts Base64URL string to Uint8Array
 */
function base64UrlToBuffer(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Imports and caches the HMAC-SHA256 CryptoKey in memory for high-performance session validation
 */
let cachedCryptoKeyPromise: Promise<CryptoKey> | null = null;

async function getCryptoKey(): Promise<CryptoKey> {
  if (!cachedCryptoKeyPromise) {
    cachedCryptoKeyPromise = crypto.subtle.importKey(
      'raw',
      textEncoder.encode(SECRET_KEY),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
  }
  return cachedCryptoKeyPromise;
}

/**
 * Signs a session payload and returns a tamper-proof session token (<payloadBase64>.<signatureBase64>)
 */
export async function signSession(
  payload: Omit<SessionPayload, 'exp'> & { exp?: number },
  expiresInSeconds: number = 60 * 60 * 24 * 7 // 7 days default
): Promise<string> {
  const key = await getCryptoKey();
  const exp = payload.exp ?? Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload: SessionPayload = { ...payload, exp };

  const payloadJson = JSON.stringify(fullPayload);
  const payloadBase64 = bufferToBase64Url(textEncoder.encode(payloadJson).buffer as ArrayBuffer);

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    textEncoder.encode(payloadBase64)
  );
  const signatureBase64 = bufferToBase64Url(signatureBuffer);

  return `${payloadBase64}.${signatureBase64}`;
}

/**
 * Verifies a session token's cryptographic HMAC signature and expiration.
 * Returns the decoded SessionPayload if valid, or null if tampered or expired.
 */
export async function verifySession(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [payloadBase64, signatureBase64] = parts;
  if (!payloadBase64 || !signatureBase64) {
    return null;
  }

  try {
    const key = await getCryptoKey();
    const signatureBytes = base64UrlToBuffer(signatureBase64);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes.buffer as ArrayBuffer,
      textEncoder.encode(payloadBase64).buffer as ArrayBuffer
    );

    if (!isValid) {
      return null;
    }

    const payloadBytes = base64UrlToBuffer(payloadBase64);
    const payloadJson = textDecoder.decode(payloadBytes);
    const payload = JSON.parse(payloadJson) as SessionPayload;

    // Check expiration timestamp
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    if (!payload.userId) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Standard secure cookie options for session storage
 */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
};
