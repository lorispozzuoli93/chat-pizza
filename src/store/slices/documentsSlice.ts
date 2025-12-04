import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DocumentItem } from '../../types';

interface DocumentsState {
    items: DocumentItem[];
    loading: boolean;
    error?: string | null;
}

const initialState: DocumentsState = { items: [], loading: false, error: null };

const documentsSlice = createSlice({
    name: 'documents',
    initialState,
    reducers: {
        setDocuments(state, action: PayloadAction<DocumentItem[]>) {
            state.items = action.payload;
            state.error = null;
        },
        setLoading(state, action: PayloadAction<boolean>) { state.loading = action.payload; },
        setError(state, action: PayloadAction<string | null>) { state.error = action.payload; },
        addDocument(state, action: PayloadAction<DocumentItem>) { state.items.unshift(action.payload); },
    },
});

export const { setDocuments, setLoading, setError, addDocument } = documentsSlice.actions;
export default documentsSlice.reducer;
