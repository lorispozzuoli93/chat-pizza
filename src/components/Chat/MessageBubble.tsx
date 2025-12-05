// src/components/Chat/MessageBubble.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import type { ChatMessage } from '../../types';

const sanitizeSchema = {
    tagNames: [
        'b', 'i', 'strong', 'em', 'u', 'a', 'p', 'br', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'pre', 'code'
    ],
    attributes: {
        a: ['href', 'title', 'target', 'rel'],
    },
};

export const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <Box sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', mb: 1 }}>
            <Paper elevation={0} sx={{
                p: 1.25,
                maxWidth: '78%',
                backgroundColor: isUser ? 'primary.main' : 'background.paper',
                color: isUser ? 'primary.contrastText' : 'text.primary',
                borderRadius: 2
            }}>
                {/* contenuto (Markdown + HTML inline sanitizzato) */}
                <Typography component="div" variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    <ReactMarkdown rehypePlugins={[rehypeRaw, [rehypeSanitize as any, sanitizeSchema]]}>
                        {message.content}
                    </ReactMarkdown>
                </Typography>

                {/* qui mostriamo il cursore se il messaggio è parziale */}
                {message.partial && <Typography variant="caption" sx={{ opacity: 0.6 }}>▌</Typography>}

                {/* ---- QUI: rendering delle citations (se presenti in message.meta) ---- */}
                {message.meta?.citations && Array.isArray(message.meta.citations) && (
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="caption">Riferimenti:</Typography>
                        <List dense>
                            {message.meta.citations.map((ref: any, i: number) => (
                                <ListItem key={i} alignItems="flex-start" sx={{ py: 0.5 }}>
                                    <ListItemText
                                        primary={ref.title ?? ref.document_id ?? `Documento ${ref.document_id ?? (i + 1)}`}
                                        secondary={ref.snippet ?? (ref.region ? JSON.stringify(ref.region) : undefined)}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default MessageBubble;
