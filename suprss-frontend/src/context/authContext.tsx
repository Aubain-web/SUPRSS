import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { authService } from '../services/authService'; // ← mets l’extension .ts, pas .tsx
import type {AuthState, User} from '../api/types';

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    loginWithOAuth: (provider: 'google' | 'github' | 'microsoft') => Promise<void>;
    register: (email: string, password: string, username: string) => Promise<void>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => Promise<void>;
    refreshToken: () => Promise<void>;
}

type AuthAction =
    | { type: 'AUTH_START' }
    | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
    | { type: 'AUTH_ERROR' }
    | { type: 'AUTH_LOGOUT' }
    | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'AUTH_START':
            return { ...state, isLoading: true };
        case 'AUTH_SUCCESS':
            return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, isLoading: false };
        case 'AUTH_ERROR':
            return { ...state, user: null, token: null, isAuthenticated: false, isLoading: false };
        case 'AUTH_LOGOUT':
            return { ...state, user: null, token: null, isAuthenticated: false, isLoading: false };
        case 'UPDATE_USER':
            return { ...state, user: action.payload };
        default:
            return state;
    }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) return dispatch({ type: 'AUTH_ERROR' });
            try {
                const user = await authService.verifyToken(token);
                dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
            } catch {
                localStorage.removeItem('token');
                dispatch({ type: 'AUTH_ERROR' });
            }
        };
        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        dispatch({ type: 'AUTH_START' });
        try {
            const { user, token } = await authService.login(email, password);
            localStorage.setItem('token', token);
            dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
        } catch (e) {
            dispatch({ type: 'AUTH_ERROR' });
            throw e;
        }
    };

    const loginWithOAuth = async (provider: 'google' | 'github' | 'microsoft') => {
        // Pas de dispatch ici : on part en redirection
        authService.redirectToOAuth(provider);
    };

    const register = async (email: string, password: string, username: string) => {
        dispatch({ type: 'AUTH_START' });
        try {
            const { user, token } = await authService.register(email, password, username);
            localStorage.setItem('token', token);
            dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
        } catch (e) {
            dispatch({ type: 'AUTH_ERROR' });
            throw e;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        dispatch({ type: 'AUTH_LOGOUT' });
    };

    const updateUser = async (userData: Partial<User>) => {
        const updated = await authService.updateUser(userData);
        dispatch({ type: 'UPDATE_USER', payload: updated });
    };

    const refreshToken = async () => {
        try {
            const { user, token } = await authService.refreshToken();
            localStorage.setItem('token', token);
            dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
        } catch (e) {
            logout();
            throw e;
        }
    };

    const value: AuthContextType = {
        ...state,
        login,
        loginWithOAuth,
        register,
        logout,
        updateUser,
        refreshToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
