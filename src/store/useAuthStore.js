import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  groqApiKey: null,
  isGuest: false,
  setUserData: (user, key, isGuest = false) => set({ user, groqApiKey: key, isGuest }),
  setGroqApiKey: (key) => set({ groqApiKey: key }),
  logout: async (supabase) => {
    if (supabase) await supabase.auth.signOut();
    set({ user: null, groqApiKey: null, isGuest: false });
  }
}));