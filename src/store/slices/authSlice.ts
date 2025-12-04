import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState { userId?: string | null; }

const initialState: AuthState = { userId: null };

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess(state, action: PayloadAction<string>) { state.userId = action.payload; },
        logout(state) { state.userId = null; },
        setUser(state, action: PayloadAction<string | null>) { state.userId = action.payload; },
    },
});

export const { loginSuccess, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
