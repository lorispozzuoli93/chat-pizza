import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    userId?: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error?: string | null;
}

const initialState: AuthState = {
    userId: (typeof window !== 'undefined' ? localStorage.getItem('userId') : null) || null,
    isAuthenticated: !!(typeof window !== 'undefined' ? localStorage.getItem('userId') : null),
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) { state.loading = action.payload; },
        setError(state, action: PayloadAction<string | null>) { state.error = action.payload; },
        loginSuccess(state, action: PayloadAction<{ userId: string }>) {
            state.userId = action.payload.userId;
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
            localStorage.setItem('userId', action.payload.userId);
        },
        logout(state) {
            state.userId = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            localStorage.removeItem('userId');
        },
    },
});

export const { setLoading, setError, loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
