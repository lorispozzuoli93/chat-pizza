import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Login from '../components/Auth/Login';

export default function LoginPage() {
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
            <Container maxWidth="xs">
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Accedi
                    </Typography>
                    <Login />
                </Paper>
            </Container>
        </Box>
    );
}
