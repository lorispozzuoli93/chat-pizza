import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type Props = {
    fileUrl: string;
    page?: number;
    width?: number;
};

export const PdfViewer: React.FC<Props> = ({ fileUrl, page = 1, width }) => {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        let objectUrl: string | null = null;

        const load = async () => {
            setLoading(true);
            setError(null);
            setBlobUrl(null);

            try {
                const BASE = import.meta.env.VITE_API_BASE_URL ?? '';
                const url = fileUrl.startsWith('http') ? fileUrl : (BASE + fileUrl);

                const res = await fetch(url, { credentials: 'include' }); // important
                if (!res.ok) {
                    // prova a leggere body per capire messaggio server (json o text)
                    let bodyText = '';
                    try {
                        bodyText = await res.text();
                    } catch { }
                    throw new Error(`Server returned ${res.status} ${res.statusText}: ${bodyText}`);
                }

                const contentType = res.headers.get('content-type') ?? '';
                if (!contentType.toLowerCase().includes('pdf')) {
                    const txt = await res.text().catch(() => '');
                    throw new Error(`Risposta non è un PDF (content-type: ${contentType}). Server response: ${txt}`);
                }

                const blob = await res.blob();
                objectUrl = URL.createObjectURL(blob);
                if (!cancelled) setBlobUrl(objectUrl);
            } catch (err: any) {
                setError(err?.message ?? 'Errore caricamento PDF');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            setBlobUrl(null);
        };
    }, [fileUrl]);

    if (loading) {
        return (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error">
                    <Typography variant="body2">{error}</Typography>
                </Alert>
            </Box>
        );
    }

    if (!blobUrl) return null;

    return (
        <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
            <Document file={blobUrl} loading={<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}><CircularProgress /></Box>} error={<Alert severity="error">Impossibile caricare PDF</Alert>}>
                <Page pageNumber={page} width={width ?? 800} />
            </Document>
        </Box>
    );
};

export default PdfViewer;
