import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ChatMessage } from '../../types';

interface ChatState {
    messages: ChatMessage[];
}

const initialState: ChatState = { messages: [] };

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        addMessage(state, action: PayloadAction<ChatMessage>) {
            state.messages.push(action.payload);
        },
        updateMessage(state, action: PayloadAction<{ id: string; patch: Partial<ChatMessage> }>) {
            const { id, patch } = action.payload;
            state.messages = state.messages.map(m => m.id === id ? { ...m, ...patch } : m);
        },
        appendToMessage(state, action: PayloadAction<{ id: string; delta: string }>) {
            const { id, delta } = action.payload;
            state.messages = state.messages.map(m => m.id === id ? { ...m, content: (m.content ?? '') + delta, partial: true } : m);
        },
        clear(state) {
            state.messages = [];
        },
    },
});

export const { addMessage, updateMessage, appendToMessage, clear } = chatSlice.actions;
export default chatSlice.reducer;
