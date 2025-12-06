import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DocumentManager } from '../components/Documents/DocumentManager';

export default function DocumentsPage() {
    return (
        <Box>
            <Typography variant="h5" gutterBottom>Gestione Documenti</Typography>
            <DocumentManager compact={false} />
        </Box>
    );
}
