import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { getChatList } from '../../api/chat';
import { setList, setLoading, setError, selectChat } from '../../store/slices/chatsSlice';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

export const ChatList: React.FC = () => {
    const dispatch = useAppDispatch();
    const { list, loading } = useAppSelector(s => s.chats);

    useEffect(() => {
        (async () => {
            dispatch(setLoading(true));
            try {
                const res = await getChatList();
                // mappa la risposta se serve (assumiamo array di chat metadata)
                dispatch(setList(res));
            }
            catch (e: unknown) {
                let errorMessage = 'Errore caricamento chat';
                if (e instanceof Error) errorMessage = e.message;
                else if (typeof e === 'string') errorMessage = e;
                dispatch(setError(errorMessage));
            } finally {
                dispatch(setLoading(false));
            }
        })();
    }, [dispatch]);

    if (loading) return <CircularProgress size={20} />;

    return (
        <List sx={{ width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
            {list.map(c => (
                <React.Fragment key={c.id}>
                    <ListItem button onClick={() => dispatch(selectChat(c.id))}>
                        <ListItemText
                            primary={c.title ?? `Chat ${c.id.slice(0, 8)}`}
                            secondary={<>
                                <Typography variant="caption" color="text.secondary">{c.last_message ?? ''}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{c.updated_at ?? ''}</Typography>
                            </>}
                        />
                    </ListItem>
                    <Divider />
                </React.Fragment>
            ))}
            {list.length === 0 && <Typography variant="caption" sx={{ p: 2 }}>Nessuna chat trovata</Typography>}
        </List>
    );
};
