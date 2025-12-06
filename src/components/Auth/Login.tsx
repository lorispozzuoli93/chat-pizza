import { useState, useEffect } from 'react';
import { TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginSuccess } from '../../store/slices/authSlice';
import { loginApi } from '../../api/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated);
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Costanti per la validazione
    const MIN_LENGTH = 3;
    const MAX_LENGTH = 64;
    // Regex che controlla SOLO se i caratteri sono validi (senza controllare la lunghezza)
    const CHARS_RE = /^[A-Za-z0-9_-]+$/;

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/app', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async () => {
        setError(null);
        const trimmed = userId.trim();

        // 1. Controllo User ID vuoto
        if (!trimmed) {
            setError('Il campo User ID non può essere vuoto.');
            return;
        }

        // 2. Controllo Lunghezza Massima
        if (trimmed.length > MAX_LENGTH) {
            setError(`User ID troppo lungo. Il massimo consentito è di ${MAX_LENGTH} caratteri.`);
            return;
        }

        // 3. Controllo Lunghezza Minima (Opzionale, ma consigliato per evitare ID come "a")
        if (trimmed.length < MIN_LENGTH) {
            setError(`User ID troppo corto. Inserisci almeno ${MIN_LENGTH} caratteri.`);
            return;
        }

        // 4. Controllo Caratteri non permessi
        if (!CHARS_RE.test(trimmed)) {
            setError('Formato non valido. Sono permessi solo lettere, numeri, trattini (-) e underscore (_).');
            return;
        }

        setLoading(true);
        try {
            const res = await loginApi(trimmed);
            if (!res.success) {
                setError(res.message ?? 'Errore durante il login. Riprova.');
            } else {
                dispatch(loginSuccess({ userId: trimmed }));
            }
        } catch (e: unknown) {
            let errorMessage = 'Errore di connessione al server.';
            if (e instanceof Error) errorMessage = e.message;
            else if (typeof e === 'string') errorMessage = e;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box display="flex" flexDirection="column" gap={2} maxWidth={400} mx="auto" mt={4}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
                label="User ID"
                placeholder="es: marco_01"
                size="small"
                value={userId}
                error={!!error}
                onChange={(e) => {
                    setUserId(e.target.value);
                    if (error) setError(null);
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
                fullWidth
            />

            <Box display="flex" gap={2} alignItems="center">
                <Button
                    variant="contained"
                    onClick={handleLogin}
                    disabled={loading}
                    fullWidth
                >
                    {loading ? 'Accesso in corso...' : 'Accedi'}
                </Button>
                {loading && <CircularProgress size={24} />}
            </Box>
        </Box>
    );
};