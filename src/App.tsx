import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { ChatStream } from './components/Chat/ChatStream';
import { Login } from './components/Auth/Login';
import { PdfViewer } from './components/PdViewer/PdfViewer';

export default function App() {
  const samplePdf = '/sample.pdf';
  const showPdf = true;

  return (
    <Container maxWidth="lg" sx={{ pt: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Typography variant="h4">Datapizza — Frontend Test</Typography>
        <Typography variant="body2" color="text.secondary">MVP</Typography>
      </Box>

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
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1">Autenticazione</Typography>
            <Login />
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">PDF Viewer</Typography>
            {showPdf ? (
              <Box sx={{ mt: 1 }}>
                <PdfViewer fileUrl={samplePdf} />
              </Box>
            ) : (
              <Typography variant="body2">PDF viewer disabilitato</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
