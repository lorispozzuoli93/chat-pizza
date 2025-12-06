import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getChatById } from '../api/chat';
import { useAppDispatch } from '../store';
import { setMessages } from '../store/slices/chatSlice';
import ChatPage from './ChatPage';
import type { ChatInteraction, ChatMessage } from '../types';

export default function ChatDetailPage() {
    const { chatId } = useParams();
    const dispatch = useAppDispatch();

    useEffect(() => {
        (async () => {
            if (!chatId) return;

            try {
                const detail: ChatInteraction = await getChatById(chatId);

                const userMessage: ChatMessage = {
                    id: detail.id + '-user',
                    role: 'user',
                    content: detail.query,
                    createdAt: detail.created_at,
                    partial: false,
                    meta: null,
                };

                const assistantMessage: ChatMessage = {
                    id: detail.id + '-assistant',
                    role: 'assistant',
                    content: detail.response,
                    createdAt: detail.created_at,
                    partial: false,
                    meta: { citations: detail.citations }
                };

                dispatch(setMessages([userMessage, assistantMessage]));

            } catch (error) {
                console.error("Errore nel caricamento della chat:", error);
            }
        })();
        // Il dependency array è corretto: dipende solo da chatId e dispatch
    }, [chatId, dispatch]);

    // Mostra la ChatPage con lo store aggiornato
    return <ChatPage />;
}
