import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    userId?: string | null;
}

const initialState: AuthState = { userId: null };

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess(state, action: PayloadAction<string>) {
            state.userId = action.payload;
        },
        logout(state) {
            state.userId = null;
        },
    },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;