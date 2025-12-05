import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { ChatStream } from '../components/Chat/ChatStream';
import { ChatList } from '../components/Chat/ChatList';
import { DocumentManager } from '../components/Documents/DocumentManager';

export default function ChatPage() {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: 1200 }}>
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
                        <Paper sx={{ p: 2, mb: 2, height: 300, overflow: 'auto' }}>
                            <Typography variant="subtitle1" gutterBottom>Conversazioni</Typography>
                            <ChatList />
                        </Paper>

                        <Paper sx={{ p: 2, mb: 2 }}>
                            <Typography variant="subtitle1">Documenti</Typography>
                            <DocumentManager />
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
