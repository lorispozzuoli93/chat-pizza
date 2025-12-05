import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { getDocumentFileUrl } from '../../api/documents';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjs as any).version}/pdf.worker.min.js`;

type BBox = number[] | { x: number; y: number; w: number; h: number };
type Highlight = { page: number; bbox: BBox; color?: string; label?: string };

type Props = {
    fileUrl?: string;            // absolute or relative (if not provided we'll use getDocumentFileUrl)
    fileId?: string;             // if provided, we build url with getDocumentFileUrl(fileId)
    page?: number;
    width?: number;
    highlights?: Highlight[];    // highlight boxes across pages
    onLoad?: () => void;
};

export const PdfViewer: React.FC<Props> = ({ fileUrl, fileId, page = 1, width, highlights = [], onLoad }) => {
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
                const url = fileUrl ?? (fileId ? getDocumentFileUrl(fileId) : null);
                if (!url) throw new Error('No fileUrl or fileId provided to PdfViewer');

                const res = await fetch(url, { credentials: 'include' });
                if (!res.ok) {
                    const txt = await res.text().catch(() => '');
                    throw new Error(`Server returned ${res.status} ${res.statusText}: ${txt}`);
                }

                const contentType = res.headers.get('content-type') ?? '';
                if (!contentType.toLowerCase().includes('pdf')) {
                    const txt = await res.text().catch(() => '');
                    throw new Error(`Risposta non è un PDF (content-type: ${contentType}). Server response: ${txt}`);
                }

                const blob = await res.blob();
                objectUrl = URL.createObjectURL(blob);
                if (!cancelled) setBlobUrl(objectUrl);
                onLoad?.();
            } catch (err: any) {
                console.error('PdfViewer load error', err);
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
    }, [fileUrl, fileId]);

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
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
            <Document file={blobUrl} loading={<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}><CircularProgress /></Box>} error={<Alert severity="error">Impossibile caricare PDF</Alert>}>
                <Page
                    pageNumber={page}
                    width={width ?? 800}
                    renderTextLayer={true}
                    renderAnnotationLayer={false}
                    loading={<CircularProgress />}
                />
            </Document>

            {/* Overlay highlights for the specified page */}
            {highlights.filter(h => h.page === page).map((h, i) => (
                <HighlightOverlay key={i} highlight={h} pageNumber={page} containerWidth={width ?? 800} />
            ))}
        </Box>
    );
};

export default PdfViewer;

/* --- Overlay component --- */
function HighlightOverlay({ highlight, pageNumber, containerWidth }: { highlight: Highlight; pageNumber: number; containerWidth: number }) {
    // We don't have direct page height here, so we assume typical PDF aspect ratio.
    // A better approach: render Page with onLoadSuccess and capture viewport.width/height then compute scaling.
    // For simplicity we position using containerWidth and assume viewportScale = containerWidth / pdfViewport.width
    // We'll implement a best-effort scaling assuming bbox normalized (0..1). If bbox absolute, we still try to scale.
    const { bbox, color = 'rgba(255, 165, 0, 0.35)' } = highlight;
    // normalize bbox to object {x,y,w,h}
    const toObj = (b: BBox) => {
        if (Array.isArray(b)) {
            return { x: b[0], y: b[1], w: b[2], h: b[3] };
        } else {
            return b;
        }
    };
    const b = toObj(bbox);

    // If values seem normalized (<= 1) treat relative to container
    const isNormalized = [b.x, b.y, b.w, b.h].every(v => typeof v === 'number' && v <= 1);

    const style: React.CSSProperties = isNormalized ? {
        position: 'absolute',
        left: `${b.x * 100}%`,
        top: `${b.y * 100}%`,
        width: `${b.w * 100}%`,
        height: `${b.h * 100}%`,
        background: color,
        border: '1px solid rgba(255,165,0,0.9)',
        pointerEvents: 'none',
        boxSizing: 'border-box',
    } : {
        // absolute values — we don't know page original dims, so treat same as normalized but scaled heuristically
        position: 'absolute',
        left: `${Math.max(0, b.x / containerWidth * 100)}%`,
        top: `${Math.max(0, b.y / containerWidth * 100)}%`,
        width: `${(b.w / containerWidth) * 100}%`,
        height: `${(b.h / containerWidth) * 100}%`,
        background: color,
        border: '1px solid rgba(255,165,0,0.9)',
        pointerEvents: 'none',
        boxSizing: 'border-box',
    };

    return <div style={style} />;
}
