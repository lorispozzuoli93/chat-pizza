import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Alert, CircularProgress, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginSuccess, logout } from '../../store/slices/authSlice';
import { loginApi } from '../../api/auth';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
    const dispatch = useAppDispatch();
    const userIdState = useAppSelector(s => s.auth.userId);
    const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated);
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const VALID_RE = /^[A-Za-z0-9_-]{1,64}$/;

    useEffect(() => {
        // se diventiamo autenticati, navighiamo alla app principale
        if (isAuthenticated) {
            navigate('/app', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async () => {
        setError(null);
        const trimmed = userId.trim();
        if (!trimmed) return setError('Inserisci user id');
        if (!VALID_RE.test(trimmed)) return setError('Formato non valido (solo lettere, numeri, - e _)');

        setLoading(true);
        try {
            const res = await loginApi(trimmed);
            if (!res.success) {
                setError(res.message ?? 'Errore di login');
            } else {
                // salva lo userId nello stato (e localStorage se implementato nello slice)
                dispatch(loginSuccess({ userId: trimmed }));
                // navigate verrà chiamato da useEffect quando isAuthenticated sarà true
                // ma puoi anche chiamarlo direttamente:
                // navigate('/app', { replace: true });
            }
        } catch (e: unknown) {
            let errorMessage = 'Errore sconosciuto';
            if (e instanceof Error) errorMessage = e.message;
            else if (typeof e === 'string') errorMessage = e;
            setError(errorMessage);
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
        // utente già loggato — mostra button logout
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
