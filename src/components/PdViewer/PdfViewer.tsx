import React, { useState } from 'react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Document, Page, pdfjs } from 'react-pdf';
import { Paper, Box, Typography } from '@mui/material';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjs as any).version}/pdf.worker.min.js`;


export const PdfViewer: React.FC<{ fileUrl: string }> = ({ fileUrl }) => {
    const [numPages, setNumPages] = useState<number | null>(null);

    function onDocumentLoadSuccess({ numPages: n }: any) {
        setNumPages(n);
    }

    return (
        <Paper variant="outlined" sx={{ p: 1 }}>
            <Box>
                <Typography variant="body2">Pagine: {numPages ?? '-'}</Typography>
                <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                    {Array.from({ length: numPages ?? 0 }).map((_, i) => (
                        <Box key={i} sx={{ position: 'relative', mb: 1 }}>
                            <Page pageNumber={i + 1} width={350} />
                        </Box>
                    ))}
                </Document>
            </Box>
        </Paper>
    );
};
