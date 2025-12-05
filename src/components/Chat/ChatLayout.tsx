import React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { ChatList } from './ChatList';
import { ChatPage } from './ChatPage';

export const ChatLayout: React.FC = () => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={4} lg={3}>
                <Paper sx={{ height: '80vh', p: 1 }}>
                    <ChatList />
                </Paper>
            </Grid>

            <Grid item xs={12} md={8} lg={9}>
                <Paper sx={{ height: '80vh', p: 1 }}>
                    <ChatPage />
                </Paper>
            </Grid>
        </Grid>
    );
};
