import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import { Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/slices/authSlice';

export default function MainLayout() {
    const dispatch = useAppDispatch();
    const auth = useAppSelector(s => s.auth);

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', p: 2 }}>
            <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="h4">Datapizza — Frontend Test</Typography>
                        <Typography variant="body2" color="text.secondary">MVP</Typography>
                    </Box>

                    {auth.isAuthenticated && (
                        <IconButton color="error" onClick={() => dispatch(logout())}>
                            <LogoutIcon />
                        </IconButton>
                    )}
                </Box>

                {/* content area centered inside a Paper for visual focus */}
                <Paper elevation={0} sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    {/* limit inner width to avoid full-bleed content */}
                    <Box sx={{ width: '100%', maxWidth: 1200 }}>
                        <Outlet />
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
