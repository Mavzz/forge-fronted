import * as Keychain from 'react-native-keychain';
import { KEYCHAIN, useAppStore } from '../store/useAppStore';

const BASE_URL = process.env.API_URL ?? 'http://10.0.2.2:8080/api/v1';

// ─── ApiError ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Shared response handler ──────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new ApiError(res.status, data?.error ?? 'Request failed');
  return data as T;
}

// ─── publicFetch — no token, no refresh ───────────────────────────────────────
// Use for: login, register, token refresh endpoint itself

export async function publicFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  return handleResponse<T>(res);
}

// ─── apiFetch — authenticated, with 401 refresh ───────────────────────────────
// Use for: all protected API calls

interface AuthenticatedRequestOptions extends RequestInit {
  _retry?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: AuthenticatedRequestOptions = {},
): Promise<T> {
  const { _retry, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);
  headers.set('Content-Type', 'application/json');

  const creds = await Keychain.getGenericPassword({ service: KEYCHAIN.ACCESS });
  if (creds) headers.set('Authorization', `Bearer ${creds.password}`);

  const res = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers });

  // Success
  if (res.ok) return handleResponse<T>(res);

  // 401 — try refresh once
  if (res.status === 401 && !_retry) {
    const newToken = await attemptRefresh();
    headers.set('Authorization', `Bearer ${newToken}`);
    const retryRes = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers });
    if (retryRes.ok) return handleResponse<T>(retryRes);
    await useAppStore.getState().logout();
    throw new ApiError(retryRes.status, 'Session expired');
  }

  return handleResponse<T>(res); // throws ApiError for non-401 errors
}

// ─── Refresh queue (single in-flight refresh) ─────────────────────────────────

let isRefreshing = false;
type QueueEntry  = { resolve: (t: string) => void; reject: (e: unknown) => void };
let queue: QueueEntry[] = [];

const flushQueue = (token: string | null, error: unknown = null) => {
  queue.forEach(({ resolve, reject }) => (token ? resolve(token) : reject(error)));
  queue = [];
};

async function attemptRefresh(): Promise<string> {
  if (isRefreshing) {
    return new Promise((resolve, reject) => queue.push({ resolve, reject }));
  }

  isRefreshing = true;

  try {
    const refreshToken = await useAppStore.getState().getRefreshToken();
    if (!refreshToken) throw new ApiError(401, 'No refresh token');

    // Uses publicFetch — the refresh endpoint itself needs no auth header
    const data = await publicFetch<{ access_token: string; refresh_token: string }>(
      '/auth/refresh',
      {
        method: 'POST',
        body:   JSON.stringify({ refresh_token: refreshToken }),
      },
    );

    await useAppStore.getState().updateAccessToken(data.access_token, data.refresh_token);
    flushQueue(data.access_token);
    return data.access_token;
  } catch (err) {
    flushQueue(null, err);
    await useAppStore.getState().logout();
    throw err;
  } finally {
    isRefreshing = false;
  }
}