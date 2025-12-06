import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { getChatList } from '../../api/chat';
import { setList, setLoading, setError, selectChat } from '../../store/slices/chatsSlice';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ListItemButton from '@mui/material/ListItemButton';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { Link as RouterLink } from 'react-router-dom';

export default function ChatList() {
    const dispatch = useAppDispatch();
    const { list = [], loading = false, error = null } = useAppSelector(s => s.chats || {});

    useEffect(() => {
        (async () => {
            dispatch(setLoading(true));
            try {
                const res = await getChatList();
                // mappa la risposta se serve (assumiamo array di chat metadata)
                dispatch(setList(res ?? []));
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

    if (loading) return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
            <CircularProgress size={20} />
        </Box>
    );

    if (error) return <Alert severity="error">{String(error)}</Alert>;

    return (
        <List sx={{ width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
            {list.length === 0 && (
                <Typography
                    variant="caption"
                    sx={{ p: 2 }}
                    component="div"
                >
                    Nessuna chat trovata
                </Typography>
            )}

            {list.map(c => (
                <React.Fragment key={c.id}>
                    <ListItemButton
                        component={RouterLink}
                        to={`chat/${c.id}`}
                        onClick={() => dispatch(selectChat(c.id))}
                        alignItems="flex-start"
                    >
                        <ListItemText
                            secondaryTypographyProps={{ component: 'div' }}

                            primary={c.title ?? `Chat ${String(c.id).slice(0, 8)}`}
                            secondary={
                                <>
                                    <Typography variant="caption" color="text.secondary" component="div" noWrap>
                                        {c.last_message ?? ''}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" component="div">
                                        {c.updated_at ?? ''}
                                    </Typography>
                                </>
                            }
                        />
                    </ListItemButton>
                    <Divider component="li" />
                </React.Fragment>
            ))}
        </List>
    );
};
