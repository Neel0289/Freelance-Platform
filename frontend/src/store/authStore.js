import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isInitialized: false,
            login: (user) => set({ user, isAuthenticated: true, isInitialized: true }),
            logout: () => set({ user: null, isAuthenticated: false, isInitialized: true }),
            setInitialized: (value) => set({ isInitialized: value }),
            updateUser: (updatedFields) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updatedFields } : null,
                })),
        }),
        {
            name: 'freelancer-auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
