import React, { useRef, useState } from 'react';
import { Box, TextField, IconButton, List, ListItem, ListItemText, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';
import { useAppDispatch, useAppSelector } from '../../store';
import { addMessage, updateMessage, appendToMessage } from '../../store/slices/chatSlice';
import { fetchNdjsonStream } from '../../api/stream';
import type { NDJSONEvent } from '../../types';

export const ChatStream: React.FC = () => {
    const [input, setInput] = useState('');
    const dispatch = useAppDispatch();
    const messages = useAppSelector((s) => s.chat.messages);
    const abortRef = useRef<AbortController | null>(null);
    const listRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const userId = `user-${Date.now()}`;
        dispatch(addMessage({ id: userId, role: 'user', content: input, createdAt: new Date().toISOString() }));

        const assistantId = `assistant-stream-${Date.now()}`;
        dispatch(addMessage({ id: assistantId, role: 'assistant', content: '', partial: true, createdAt: new Date().toISOString() }));

        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;

        fetchNdjsonStream(
            '/api/chat/stream',
            { prompt: input },
            (evt: NDJSONEvent) => {
                if (evt.type === 'token' || evt.type === 'content') {
                    const delta = typeof evt.payload === 'string' ? evt.payload : evt.payload?.delta ?? '';
                    if (delta) dispatch(appendToMessage({ id: assistantId, delta }));
                    // scroll after each update
                    setTimeout(scrollToBottom, 0);
                } else if (evt.type === 'done') {
                    dispatch(updateMessage({ id: assistantId, patch: { partial: false } }));
                    setTimeout(scrollToBottom, 0);
                } else if (evt.type === 'meta') {
                    dispatch(updateMessage({ id: assistantId, patch: { /* meta: evt.payload */ } }));
                } else if (evt.type === 'error') {
                    dispatch(updateMessage({ id: assistantId, patch: { partial: false } }));
                }
            },
            (err) => {
                console.error('Stream error', err);
                dispatch(updateMessage({ id: assistantId, patch: { partial: false } }));
            },
            ac.signal
        ).catch((e) => {
            console.error(e);
            dispatch(updateMessage({ id: assistantId, patch: { partial: false } }));
        });

        setInput('');
    };

    return (
        <Box display="flex" flexDirection="column" height="100%">
            <Paper ref={listRef} variant="outlined" sx={{ flex: 1, overflow: 'auto', p: 1, mb: 1 }}>
                <List>
                    {messages.map((m) => (
                        <ListItem key={m.id} alignItems="flex-start">
                            <ListItemText
                                primary={(m.role ?? 'assistant').toUpperCase()}
                                secondary={<span>{m.content}{m.partial ? '▌' : ''}</span>}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>

            <Box display="flex" gap={1}>
                <TextField
                    fullWidth
                    size="small"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Scrivi un messaggio..."
                />
                <IconButton color="primary" onClick={handleSend} aria-label="send">
                    <SendIcon />
                </IconButton>
                <IconButton color="inherit" onClick={() => abortRef.current?.abort()} aria-label="stop">
                    <StopIcon />
                </IconButton>
            </Box>
        </Box>
    );
};
