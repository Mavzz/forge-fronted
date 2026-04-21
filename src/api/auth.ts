import { publicFetch } from './client';
import { useAppStore } from '../store/useAppStore';

export interface LoginPayload    { email: string; password: string }
export interface RegisterPayload { name: string; email: string; password: string }

interface AuthResponse {
  access_token:  string;
  refresh_token: string;
  user: { id: number; name: string; email: string };
}

export async function login(payload: LoginPayload) {
  const data = await publicFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body:   JSON.stringify(payload),
  });
  await useAppStore.getState().setAuth(data.user, data.access_token, data.refresh_token);
}

export async function register(payload: RegisterPayload) {
  const data = await publicFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body:   JSON.stringify(payload),
  });
  await useAppStore.getState().setAuth(data.user, data.access_token, data.refresh_token);
}

export async function logout() {
  const refreshToken = await useAppStore.getState().getRefreshToken();
  if (refreshToken) {
    // Best-effort server-side revocation — always clear local state regardless
    await publicFetch('/auth/logout', {
      method: 'POST',
      body:   JSON.stringify({ refresh_token: refreshToken }),
    }).catch(() => {});
  }
  await useAppStore.getState().logout();
}