import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { createMMKV, type MMKV, deleteMMKV } from 'react-native-mmkv';
import * as Keychain from 'react-native-keychain';

const mmkv: MMKV = createMMKV({ id: 'forge-store' });

export const KEYCHAIN = {
  ACCESS: 'forge-access-token',
  REFRESH: 'forge-refresh-token',
} as const;

const KEYCHAIN_OPTIONS = {
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
} as const;

type User = {
  id: number;
  name: string;
  email: string;
};


interface AppState {
  user: User | null;
  accessToken: string | null;
  isHydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  updateAccessToken: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  getRefreshToken: () => Promise<string | null>;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  accessToken: null,
  isHydrated: false,
  
  setAuth: async (user, accessToken, refreshToken) => {
    await Promise.all([
      Keychain.setGenericPassword('token', accessToken,
        {service: KEYCHAIN.ACCESS, ...KEYCHAIN_OPTIONS}),
      Keychain.setGenericPassword('token', refreshToken,
        {service: KEYCHAIN.REFRESH, ...KEYCHAIN_OPTIONS}),
    ]);
    mmkv.set('user', JSON.stringify(user));
    set({ user, accessToken });
  },

  updateAccessToken: async (accessToken, refreshToken) => {
    await Promise.all([
      Keychain.setGenericPassword('token', accessToken,
        {service: KEYCHAIN.ACCESS, ...KEYCHAIN_OPTIONS}),
      Keychain.setGenericPassword('token', refreshToken,
        {service: KEYCHAIN.REFRESH, ...KEYCHAIN_OPTIONS}),
    ]);
    set({ accessToken });
  },
  
  logout: async () => {
    await Promise.all([
      Keychain.resetGenericPassword({service: KEYCHAIN.ACCESS}),
      Keychain.resetGenericPassword({service: KEYCHAIN.REFRESH}),
    ]);
    deleteMMKV('user');
    set({ user: null, accessToken: null });
  },

  hydrate: async () => {
    try{
      const [accessCreds, userRaw] = await Promise.all([
        Keychain.getGenericPassword({service: KEYCHAIN.ACCESS}),
        Promise.resolve(mmkv.getString('user')),
      ]);
      set({
        accessToken: accessCreds ? accessCreds.password : null,
        user: userRaw ? JSON.parse(userRaw) : null,
        isHydrated: true,
      });
    } catch{
      set({ isHydrated: true, user: null, accessToken: null });
    }
  },
  getRefreshToken: async () => {
    const refreshCreds = await Keychain.getGenericPassword({service: KEYCHAIN.REFRESH});
    return refreshCreds ? refreshCreds.password : null;
  },
}));