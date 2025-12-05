import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import GppGoodIcon from '@mui/icons-material/HelpOutline';
import { FactCheckDialog } from './FactCheckDialog';
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

    const [fcOpen, setFcOpen] = useState(false);

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
                {message.meta?.citations && (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption">Riferimenti:</Typography>
                            <IconButton size="small" onClick={() => setFcOpen(true)}><GppGoodIcon fontSize="small" /></IconButton>
                        </Box>

                        <FactCheckDialog open={fcOpen} onClose={() => setFcOpen(false)} citations={message.meta.citations} />
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default MessageBubble;
