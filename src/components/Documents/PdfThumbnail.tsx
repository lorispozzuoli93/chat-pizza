import React from 'react';
import { Document, Page } from 'react-pdf';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';

type Props = {
    file: File | string;
    width?: number;
    filename?: string;
};

export const PdfThumbnail: React.FC<Props> = ({ file, width = 140, filename }) => {
    const loader = (
        <Box
            sx={{
                width,
                height: Math.round(width * 1.3),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <CircularProgress />
        </Box>
    );

    const pageLoading = (
        <Box
            sx={{
                width,
                height: Math.round(width * 1.3),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <CircularProgress size={28} />
        </Box>
    );

    const errorBox = (
        <Box
            sx={{
                width,
                height: Math.round(width * 1.3),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 1,
            }}
        >
            <Typography variant="caption" color="error">Impossibile caricare anteprima</Typography>
        </Box>
    );

    return (
        <Paper elevation={0} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1 }}>
            <Box sx={{ width }}>
                <Document
                    file={file}
                    loading={loader}
                    error={errorBox}
                    noData={errorBox}
                >
                    <Page
                        pageNumber={1}
                        width={width}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        loading={pageLoading}
                        error={errorBox}
                    />
                </Document>
            </Box>

            {filename && (
                <Typography
                    variant="caption"
                    sx={{
                        mt: 0.5,
                        textAlign: 'center',
                        maxWidth: width,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {filename}
                </Typography>
            )}
        </Paper>
    );
};
