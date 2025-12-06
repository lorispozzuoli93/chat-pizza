import React, { useCallback, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

// set worker (usa CDN oppure copia locale se preferisci)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


type Props = {
    documentId: string;
    pageNumber?: number;
    highlights?: number[][]; // array of rects [x_in, y_in, w_in, h_in]
    fileUrl?: string; // optional override
};

const PdfViewerWithHighlights: React.FC<Props> = ({ documentId, pageNumber = 1, highlights = [], fileUrl }) => {
    const [pageDims, setPageDims] = useState<{ widthPts: number; heightPts: number } | null>(null);
    const [loading, setLoading] = useState(true);


    const url = fileUrl ?? `/api/documents/${documentId}/file`;


    const onDocumentLoadSuccess = useCallback((doc: any) => {
        setLoading(false);
    }, []);


    const onPageRenderSuccess = useCallback((pdfPage: any) => {
        const viewport = pdfPage.getViewport({ scale: 1 });
        setPageDims({ widthPts: viewport.width, heightPts: viewport.height });
    }, []);


    const rectToStyle = (rectIn: number[]) => {
        if (!pageDims) return { display: 'none' } as any;
        const [xIn, yIn, wIn, hIn] = rectIn;
        const xPts = xIn * 72;
        const yPts = yIn * 72;
        const wPts = wIn * 72;
        const hPts = hIn * 72;

        const leftPct = (xPts / pageDims.widthPts) * 100;
        const topPct = ((pageDims.heightPts - (yPts + hPts)) / pageDims.heightPts) * 100;
        const widthPct = (wPts / pageDims.widthPts) * 100;
        const heightPct = (hPts / pageDims.heightPts) * 100;


        return {
            position: 'absolute' as const,
            left: `${leftPct}%`,
            top: `${topPct}%`,
            width: `${widthPct}%`,
            height: `${heightPct}%`,
            border: '2px solid rgba(255,165,0,0.9)',
            backgroundColor: 'rgba(255,165,0,0.15)',
            pointerEvents: 'none' as const,
            boxSizing: 'border-box' as const,
        };
    };

    return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="subtitle1">Document: {documentId} — Pagina {pageNumber}</Typography>
                {loading && <CircularProgress size={16} />}
            </Box>


            <Box sx={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                <Document file={url} onLoadSuccess={onDocumentLoadSuccess} loading={<Typography>Caricamento PDF…</Typography>}>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Page
                            pageNumber={pageNumber}
                            width={800}
                            renderAnnotationLayer={false}
                            renderTextLayer={false}
                            onRenderSuccess={onPageRenderSuccess}
                        />

                        <Box sx={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
                            {pageDims && highlights.length > 0 && highlights.map((r, i) => (
                                <Box key={i} sx={{ ...rectToStyle(r) }} />
                            ))}
                        </Box>
                    </Box>
                </Document>
            </Box>
        </Box>
    );
};

export default PdfViewerWithHighlights;