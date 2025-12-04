import React, { useState } from 'react';
import { TextField, Button, Box, Alert, CircularProgress, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginSuccess, logout } from '../../store/slices/authSlice';
import { loginApi } from '../../api/auth';

export const Login: React.FC = () => {
    const dispatch = useAppDispatch();
    const userIdState = useAppSelector(s => s.auth.userId);
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const VALID_RE = /^[A-Za-z0-9_-]{1,64}$/;

    const handleLogin = async () => {
        setError(null);
        if (!userId.trim()) return setError('Inserisci user id');
        if (!VALID_RE.test(userId.trim())) return setError('Formato non valido (solo lettere, numeri, - e _)');

        setLoading(true);
        try {
            const res = await loginApi(userId.trim());
            if (!res.success) {
                setError(res.message ?? 'Errore di login');
            } else {
                dispatch(loginSuccess(res.user_id ?? userId.trim()));
            }
        } catch (e: any) {
            setError(e?.message ?? 'Errore di rete');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        dispatch(logout());
        setLoading(false);
    };

    if (userIdState) {
        // utente già loggato (mock) — mostra button logout
        return (
            <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="body2">Loggato come <strong>{userIdState}</strong></Typography>
                <Box display="flex" gap={1}>
                    <Button onClick={handleLogout} disabled={loading} variant="outlined">Logout</Button>
                    {loading && <CircularProgress size={20} />}
                </Box>
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="column" gap={1}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
                label="User id"
                placeholder="es: marco_01"
                size="small"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
            />
            <Box display="flex" gap={1} alignItems="center">
                <Button onClick={handleLogin} disabled={loading}>Login</Button>
                {loading && <CircularProgress size={20} />}
            </Box>
        </Box>
    );
};
