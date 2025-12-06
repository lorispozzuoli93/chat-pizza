import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ChatStream from '../components/Chat/ChatStream';
import ChatList from '../components/Chat/ChatList';
import { DocumentManager } from '../components/Documents/DocumentManager';
import DocsStatusBanner from '../components/DocsStatusBanner/DocsStatusBanner';

export default function ChatPage() {
    return (
        <Box>
            <DocsStatusBanner />
            <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2, height: '72vh', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom>Chat</Typography>
                        <Box sx={{ flex: 1, overflow: 'auto' }}>
                            <ChatStream />
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
                        <Typography variant="subtitle1">Conversazioni</Typography>
                        <ChatList />
                    </Paper>

                    <Paper sx={{ p: 2, height: 313, overflow: 'auto' }}>
                        <Typography variant="subtitle1">Documenti</Typography>
                        <DocumentManager compact={true} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
