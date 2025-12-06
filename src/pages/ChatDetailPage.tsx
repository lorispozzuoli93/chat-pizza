import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getChatById } from '../api/chat';
import { useAppDispatch } from '../store';
import { setMessages } from '../store/slices/chatSlice';
import ChatPage from './ChatPage';

export default function ChatDetailPage() {
    const { chatId } = useParams();
    const dispatch = useAppDispatch();

    useEffect(() => {
        (async () => {
            if (!chatId) return;
            try {
                const detail = await getChatById(chatId);
                // assumendo detail.messages è array
                dispatch(setMessages(detail.messages ?? []));
            } catch (e) {
                console.warn(e);
            }
        })();
    }, [chatId, dispatch]);

    // Mostra la ChatPage con lo store aggiornato
    return <ChatPage />;
}
