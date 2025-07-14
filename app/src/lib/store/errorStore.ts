// lib/store/errorStore.ts
import {create} from 'zustand';

export type ErrorState = {
    authError: boolean;
    setAuthError: (error: boolean) => void;
    resetAuthError: () => void;
};

export const useErrorStore = create<ErrorState>((set) => ({
    authError: false,
    setAuthError: (error: boolean) => set({authError: error}),
    resetAuthError: () => set({authError: false}),
}));
