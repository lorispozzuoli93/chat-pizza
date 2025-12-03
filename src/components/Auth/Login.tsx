import React, { useState } from 'react';
import { TextField, Button, Box, Alert } from '@mui/material';
import { useAppDispatch } from '../../store';
import { loginSuccess } from '../../store/slices/authSlice';

export const Login: React.FC = () => {
    const [userId, setUserId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const dispatch = useAppDispatch();

    const submit = async () => {
        if (!userId.trim()) return setError('Inserisci user_id');
        if (!/^[a-zA-Z0-9_-]{1,64}$/.test(userId)) return setError('Formato user_id non valido');

        try {
            // se hai un endpoint reale, chiamalo qui. Per ora mock:
            // const res = await fetch('/api/auth/login', {...})
            dispatch(loginSuccess(userId.trim()));
            setError(null);
        } catch (e: any) {
            setError(e.message || 'Errore login');
        }
    };

    return (
        <Box display="flex" flexDirection="column" gap={1}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="user_id" size="small" value={userId} onChange={(e) => setUserId(e.target.value)} />
            <Box display="flex" gap={1}>
                <Button onClick={submit}>Login</Button>
                <Button variant="outlined" onClick={() => setUserId('')}>Reset</Button>
            </Box>
        </Box>
    );
};
