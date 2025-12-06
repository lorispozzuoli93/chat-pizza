import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { addMessage, appendToMessage, updateMessage } from '../../store/slices/chatSlice';
import { fetchNdjsonStream } from '../../api/stream';
import type { NDJSONEvent, ChatMessageMeta, ChatRequestBody, Citation } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import MessageBubble from './MessageBubble';


export default function CheatStram() {
    const dispatch = useAppDispatch();
    const messages = useAppSelector(s => s.chat.messages);
    const selectedChatId = useAppSelector(s => s.chats?.selectedId);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    // ref per il container dei messaggi (scroll)
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    const handleSend = async () => {
        setError(null);
        const prompt = input.trim();
        if (!prompt) { return; }

        const userId = `user-${Date.now()}`;
        // 1. Aggiunge messaggio utente
        dispatch(addMessage({
            id: userId,
            role: 'user',
            content: prompt,
            createdAt: new Date().toISOString(),
            partial: false,
            meta: null
        }));

        const assistantId = `assistant-${uuidv4()}`;
        // 2. Aggiunge placeholder assistente (in streaming)
        dispatch(addMessage({
            id: assistantId,
            role: 'assistant',
            content: '',
            createdAt: new Date().toISOString(),
            partial: true,
            meta: null
        }));

        // 3. Avvia lo streaming
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;
        setLoading(true);
        setInput('');

        // Crea il corpo della richiesta con il tipo corretto ChatRequestBody
        const requestBody: ChatRequestBody = {
            query: prompt,
            chat_id: selectedChatId || undefined
        };

        try {
            await fetchNdjsonStream(
                '/api/chat/',
                requestBody,
                (evt: NDJSONEvent) => {
                    // Gestione dei token
                    if (evt.type === 'content' || evt.type === 'token') {
                        const delta = typeof evt.payload === 'string' ? evt.payload : evt.payload?.delta ?? '';
                        if (delta) dispatch(appendToMessage({ id: assistantId, delta }));
                    } else if (evt.type === 'citations') {
                        const citationsEvent = evt as { type: 'citations'; references: Citation[] };

                        const refs = citationsEvent.references ?? [];
                        const newMeta: ChatMessageMeta = { citations: refs };
                        dispatch(updateMessage({ id: assistantId, patch: { meta: newMeta } }));
                        setLoading(false);

                        // Gestione di altri metadati
                    } else if (evt.type === 'meta') {
                        dispatch(updateMessage({ id: assistantId, patch: { meta: evt.payload } }));
                    } else if (evt.type === 'done') {
                        dispatch(updateMessage({ id: assistantId, patch: { partial: false } }));
                        setLoading(false);
                    } else {
                        const maybe = (evt as { type: string; payload?: never }).payload;
                        if (typeof maybe === 'string') dispatch(appendToMessage({ id: assistantId, delta: maybe }));
                    }
                },
                (err) => {
                    // Gestione errore durante lo stream
                    dispatch(updateMessage({ id: assistantId, patch: { partial: false } }));
                    setError('Errore nello stream: ' + (err?.message ?? String(err)));
                    setLoading(false);
                },
                ac.signal
            );
        } catch (err: unknown) {
            // Gestione errore avvio stream/rete
            let errorMessage = 'Errore di rete';
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }
            setError(errorMessage);
            setLoading(false);
            dispatch(updateMessage({ id: assistantId, patch: { partial: false } }));
        }
    };

    // Scroll to bottom (ottimizzato)
    useEffect(() => {
        const el = messagesContainerRef.current;
        if (!el) return;

        setTimeout(() => {
            el.scrollTop = el.scrollHeight;
        }, 50);
    }, [messages]);


    return (
        <Box>
            <Box
                sx={{ position: 'relative' }}
            >
                <Box
                    ref={messagesContainerRef}
                    sx={{ maxHeight: 360, overflow: 'auto', mb: 1, p: 1 }}
                >
                    <Stack spacing={1}>
                        {messages.length === 0 && !selectedChatId ? (
                            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                                Inizia una nuova conversazione.
                            </Box>
                        ) : (
                            messages.map(m => <MessageBubble key={m.id} message={m} />)
                        )}
                    </Stack>
                </Box>

                {/* Loading overlay */}
                {loading && (
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(255,255,255,0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10,
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}
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
                    disabled={loading}
                />
                <Button
                    variant="contained"
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                >
                    Invia
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => { abortRef.current?.abort(); setLoading(false); }}
                    disabled={!loading}
                >
                    Annulla
                </Button>
            </Stack>
        </Box>
    );
};