import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ChatMessage } from '../../types';
import { v4 as uuidv4 } from 'uuid';

type PartialMessage = Partial<ChatMessage>;

interface ChatState { messages: ChatMessage[]; }

const initialState: ChatState = { messages: [] };

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        addMessage(state, action: PayloadAction<PartialMessage>) {
            const m = action.payload;
            const msg: ChatMessage = {
                id: m.id ?? uuidv4(),
                role: (m.role as ChatMessage['role']) ?? 'assistant',
                content: m.content ?? '',
                createdAt: m.createdAt ?? new Date().toISOString(),
                partial: m.partial ?? false,
            };
            state.messages.push(msg);
        },
        updateMessage(state, action: PayloadAction<{ id: string; patch: PartialMessage }>) {
            const { id, patch } = action.payload;
            const idx = state.messages.findIndex(m => m.id === id);
            if (idx >= 0) state.messages[idx] = { ...state.messages[idx], ...patch };
        },
        appendToMessage(state, action: PayloadAction<{ id: string; delta: string }>) {
            const { id, delta } = action.payload;
            const idx = state.messages.findIndex(m => m.id === id);
            if (idx >= 0) {
                state.messages[idx].content = (state.messages[idx].content || '') + delta;
                state.messages[idx].partial = true;
            }
        },
        clearMessages(state) { state.messages = []; },
    },
});

export const { addMessage, updateMessage, appendToMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
