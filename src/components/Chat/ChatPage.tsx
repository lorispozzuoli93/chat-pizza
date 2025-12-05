import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { getChatById } from '../../api/chat';
import { clear, addMessage } from '../../store/slices/chatSlice';
import Box from '@mui/material/Box';
import { ChatStream } from './ChatStream';

export const ChatPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const selectedId = useAppSelector(s => s.chats.selectedId);

    useEffect(() => {
        if (!selectedId) return;
        (async () => {
            try {
                dispatch(clear());
                const payload = await getChatById(selectedId);
                // payload dovrebbe essere un oggetto con messages array; se è array, adattalo
                const messages = Array.isArray(payload) ? payload : (payload.messages ?? []);
                messages.forEach((m: any) => {
                    dispatch(addMessage({
                        id: m.id ?? `srv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                        role: m.role ?? 'assistant',
                        content: m.content ?? '',
                        createdAt: m.created_at ?? new Date().toISOString(),
                        partial: false,
                        meta: m.meta ?? null
                    }));
                });
            } catch (e) {
                console.error('getChatById error', e);
            }
        })();
    }, [selectedId, dispatch]);

    // If no chat selected, show a placeholder
    if (!selectedId) {
        return <Box sx={{ p: 2 }}>Seleziona una chat dalla lista a sinistra o crea una nuova conversazione.</Box>;
    }

    return (
        <Box sx={{ height: '100%' }}>
            {/* ChatStream consumer: se usa lo store.chat.messages mostrerà i messaggi caricati sopra */}
            <ChatStream />
        </Box>
    );
};
