import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { addMessage, appendToMessage, updateMessage } from '../../store/slices/chatSlice';
import { fetchNdjsonStream } from '../../api/stream';
import type { NDJSONEvent } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { MessageBubble } from './MessageBubble';
import { getChatHistory } from '../../api/chat';

export const ChatStream: React.FC = () => {
    const dispatch = useAppDispatch();
    const messages = useAppSelector(s => s.chat.messages);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const handleSend = async () => {
        setError(null);
        const prompt = input.trim();
        if (!prompt) { setError('Inserisci una domanda'); return; }

        const userId = `user-${Date.now()}`;
        dispatch(addMessage({
            id: userId,
            role: 'user',
            content: prompt,
            createdAt: new Date().toISOString(),
            partial: false
        }));

        const assistantId = `assistant-${uuidv4()}`;
        dispatch(addMessage({
            id: assistantId,
            role: 'assistant',
            content: '',
            createdAt: new Date().toISOString(),
            partial: true
        }));

        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;
        setLoading(true);

        try {
            await fetchNdjsonStream(
                '/api/chat/',
                { query: prompt }, // <- API expects "query"
                (evt: NDJSONEvent) => {
                    if (evt.type === 'content' || evt.type === 'token') {
                        const delta = typeof (evt as any).payload === 'string' ? (evt as any).payload : (evt as any).payload?.delta ?? '';
                        if (delta) dispatch(appendToMessage({ id: assistantId, delta }));
                    } else if (evt.type === 'citations') {
                        // final chunk with references
                        const refs = (evt as any).references ?? [];
                        dispatch(updateMessage({ id: assistantId, patch: { partial: false, meta: { citations: refs } } }));
                        setLoading(false);
                    } else if (evt.type === 'meta') {
                        dispatch(updateMessage({ id: assistantId, patch: { meta: (evt as any).payload } }));
                    } else if (evt.type === 'done') {
                        dispatch(updateMessage({ id: assistantId, patch: { partial: false } }));
                        setLoading(false);
                    } else {
                        // fallback: append string payload if present
                        const maybe = (evt as any).payload;
                        if (typeof maybe === 'string') dispatch(appendToMessage({ id: assistantId, delta: maybe }));
                    }
                },
                (err) => {
                    console.error('Stream error', err);
                    dispatch(updateMessage({ id: assistantId, patch: { partial: false } }));
                    setError('Errore nello stream: ' + (err?.message ?? String(err)));
                    setLoading(false);
                },
                ac.signal
            );
        } catch (err: any) {
            console.error('fetchNdjsonStream thrown', err);
            setError(err?.message ?? 'Errore rete');
            setLoading(false);
            dispatch(updateMessage({ id: assistantId, patch: { partial: false } }));
        } finally {
            setInput('');
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const hist = await getChatHistory();
                if (!Array.isArray(hist)) return;
                // opzionale: se vuoi evitare duplicazioni pulisci lo store (se hai un'azione clear)
                // dispatch(clear());

                // mappiamo i messaggi ricevuti dal backend in ChatMessage
                hist.forEach((m: any) => {
                    dispatch(addMessage({
                        id: m.id ?? `srv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                        role: (m.role as any) ?? 'assistant',
                        content: m.content ?? '',
                        createdAt: m.created_at ?? m.uploaded_at ?? new Date().toISOString(),
                        partial: false,
                        meta: m.meta ?? null
                    }));
                });
            } catch (e) {
                console.warn('No chat history / error', e);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Box>
            <Box sx={{ maxHeight: 360, overflow: 'auto', mb: 1, p: 1 }}>
                <Stack spacing={1}>
                    {messages.map(m => <MessageBubble key={m.id} message={m} />)}
                    {loading && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} /></Box>}
                </Stack>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

            <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                    placeholder="Fai una domanda..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    fullWidth
                    size="small"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                />
                <Button variant="contained" onClick={handleSend} disabled={loading}>Invia</Button>
                <Button variant="outlined" onClick={() => { abortRef.current?.abort(); setLoading(false); }}>Annulla</Button>
            </Stack>
        </Box>
    );
};
