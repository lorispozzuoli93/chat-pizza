import { Alert, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';

export default function DocsStatusBanner() {
    const docs = useAppSelector((s) => s.documents?.items ?? []);
    const navigate = useNavigate();

    if (docs.length > 0) return null;

    return (
        <Box sx={{ mb: 2 }}>
            <Alert
                severity="info"
                action={
                    <Button color="inherit" size="small" onClick={() => navigate('/app/documents')}>
                        Carica documenti
                    </Button>
                }
            >
                Nessun documento caricato — per avere risposte con riferimenti (fact-checking), carica i PDF richiesti.
            </Alert>
        </Box>
    );
};;
