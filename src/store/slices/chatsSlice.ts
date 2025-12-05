import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ChatMeta {
    id: string;
    title?: string;
    last_message?: string;
    updated_at?: string;
    [k: string]: any;
}

interface ChatsState {
    list: ChatMeta[];
    loading: boolean;
    error: string | null;
    selectedId: string | null;
}

const initialState: ChatsState = {
    list: [],
    loading: false,
    error: null,
    selectedId: null,
};

const chatsSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) { state.loading = action.payload; },
        setError(state, action: PayloadAction<string | null>) { state.error = action.payload; },
        setList(state, action: PayloadAction<ChatMeta[]>) { state.list = action.payload; },
        selectChat(state, action: PayloadAction<string | null>) { state.selectedId = action.payload; },
        updateChatMeta(state, action: PayloadAction<Partial<ChatMeta> & { id: string }>) {
            const idx = state.list.findIndex(c => c.id === action.payload.id);
            if (idx >= 0) state.list[idx] = { ...state.list[idx], ...action.payload };
        },
        addChatToTop(state, action: PayloadAction<ChatMeta>) {
            state.list = [action.payload, ...state.list.filter(c => c.id !== action.payload.id)];
        }
    }
});

export const { setLoading, setError, setList, selectChat, updateChatMeta, addChatToTop } = chatsSlice.actions;
export default chatsSlice.reducer;
