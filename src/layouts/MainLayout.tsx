import { Outlet, Link as RouterLink } from 'react-router-dom';
import { Box, Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/slices/authSlice';

export default function MainLayout() {
    const dispatch = useAppDispatch();
    const userId = useAppSelector(s => s.auth.userId);

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <AppBar position="static" color="default" elevation={1}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="h6">🍕 Datapizza</Typography>
                        <Button component={RouterLink} to="/app" size="small">Nuova chat</Button>
                        <Button component={RouterLink} to="/app/documents" size="small">Documenti</Button>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">Loggato come <strong>{userId}</strong></Typography>
                        <Button onClick={() => dispatch(logout())} size="small">Logout</Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ py: 3, flex: 1 }}>
                <Outlet />
            </Container>
        </Box>
    );
}
