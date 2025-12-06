import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import type { ChatMessage, OpenCitationState } from '../../types';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import PdfViewerWithHighlights from '../PdViewer/PdfViewerWithHighlights';

// small sanitize schema (allow tables + basic tags)
const sanitizeSchema = {
    tagNames: [
        'b', 'i', 'strong', 'em', 'u', 'a', 'p', 'br', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'pre', 'code'
    ],
    attributes: {
        a: ['href', 'title', 'target', 'rel'],
    },
};

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const [openCitation, setOpenCitation] = useState<OpenCitationState>(null);

    const citations = (message.meta?.citations ?? []) as any[];

    const openCitationForRef = (ref: any) => {
        // page number suggested by the citation top-level (if present)
        const defaultPage = Number(ref.page_number ?? ref.page ?? 1);

        // bounding_regions might be an array with items having page_number + rects_in
        const bRegions = ref.bounding_regions ?? [];

        // build pages map: page -> rects[]
        const pagesMap: Record<number, number[][]> = {};

        // if there are explicit bounding_regions, use them grouped by br.page_number (fallback to defaultPage)
        bRegions.forEach((br: any) => {
            const brPage = Number(br.page_number ?? defaultPage);
            const rects = Array.isArray(br.rects_in) ? br.rects_in : [];
            if (!pagesMap[brPage]) pagesMap[brPage] = [];
            // ensure we push arrays of numbers
            rects.forEach((r: any) => {
                if (Array.isArray(r) && r.length >= 4) pagesMap[brPage].push(r.map((x: any) => Number(x)));
            });
        });

        // If no bounding_regions present but ref may have a single rect-like field, try to use it (defensive)
        if (Object.keys(pagesMap).length === 0) {
            // try common fallbacks (e.g. ref.rects or single br)
            const fallbackRects = ref.rects ?? ref.rects_in ?? [];
            if (Array.isArray(fallbackRects) && fallbackRects.length > 0 && Array.isArray(fallbackRects[0])) {
                pagesMap[defaultPage] = fallbackRects.map((r: any) => r.map((x: any) => Number(x)));
            }
        }

        // if still empty, open with empty highlights for that page
        if (Object.keys(pagesMap).length === 0) {
            pagesMap[defaultPage] = [];
        }

        // ensure selectedPage is present in pagesMap
        const selectedPage = pagesMap[defaultPage] ? defaultPage : Number(Object.keys(pagesMap)[0]);

        setOpenCitation({
            document_id: ref.document_id ?? ref.documentId ?? ref.id,
            filename: ref.filename,
            pagesMap,
            selectedPage
        });
    };

    const handlePrevPage = () => {
        if (!openCitation) return;
        const pages = Object.keys(openCitation.pagesMap).map(p => Number(p)).sort((a, b) => a - b);
        const idx = pages.indexOf(openCitation.selectedPage);
        if (idx > 0) {
            setOpenCitation({ ...openCitation, selectedPage: pages[idx - 1] });
        }
    };

    const handleNextPage = () => {
        if (!openCitation) return;
        const pages = Object.keys(openCitation.pagesMap).map(p => Number(p)).sort((a, b) => a - b);
        const idx = pages.indexOf(openCitation.selectedPage);
        if (idx < pages.length - 1) {
            setOpenCitation({ ...openCitation, selectedPage: pages[idx + 1] });
        }
    };

    return (
        <Box sx={{ p: 1 }}>
            <Typography variant="caption" color="text.secondary">{message.role}</Typography>

            <Box sx={{ mt: 0.5 }}>
                <ReactMarkdown rehypePlugins={[[rehypeRaw], [rehypeSanitize, sanitizeSchema]]}>
                    {message.content ?? ''}
                </ReactMarkdown>
            </Box>

            {Array.isArray(citations) && citations.length > 0 && (
                <Box sx={{ mt: 1, borderTop: '1px solid rgba(0,0,0,0.06)', pt: 1 }}>
                    <Typography variant="caption">Documenti correlati</Typography>
                    <List dense>
                        {citations.map((ref: any, idx: number) => (
                            <React.Fragment key={`${ref.document_id ?? ref.filename ?? idx}-${idx}`}>
                                <ListItem alignItems="flex-start" secondaryAction={
                                    <Button size="small" onClick={() => openCitationForRef(ref)}>Mostra</Button>
                                }>
                                    <ListItemText
                                        primary={`${ref.filename ?? ref.document_id} — pagina ${ref.page_number ?? ref.page ?? ''}`}
                                        secondary={ref.text_quote ?? ''}
                                    />
                                </ListItem>
                                <Divider component="li" />
                            </React.Fragment>
                        ))}
                    </List>
                </Box>
            )}

            <Dialog fullWidth maxWidth="lg" open={!!openCitation} onClose={() => setOpenCitation(null)}>
                <DialogContent sx={{ height: '80vh', p: 1 }}>
                    {openCitation && (
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle1">
                                    {openCitation.filename ?? openCitation.document_id} — Pagina {openCitation.selectedPage}
                                </Typography>

                                <Stack direction="row" spacing={1} alignItems="center">
                                    {/* prev / next only if multiple pages present */}
                                    {Object.keys(openCitation.pagesMap).length > 1 && (
                                        <>
                                            <IconButton size="small" onClick={handlePrevPage} disabled={
                                                Object.keys(openCitation.pagesMap).length <= 1 ||
                                                Object.keys(openCitation.pagesMap).map(p => Number(p)).sort((a, b) => a - b)[0] === openCitation.selectedPage
                                            }>
                                                <ArrowBackIosNewIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={handleNextPage} disabled={
                                                Object.keys(openCitation.pagesMap).length <= 1 ||
                                                Object.keys(openCitation.pagesMap).map(p => Number(p)).sort((a, b) => a - b).slice(-1)[0] === openCitation.selectedPage
                                            }>
                                                <ArrowForwardIosIcon fontSize="small" />
                                            </IconButton>
                                        </>
                                    )}

                                    <Button size="small" variant="outlined" onClick={() => setOpenCitation(null)}>Chiudi</Button>
                                </Stack>
                            </Box>

                            <Box sx={{ flex: 1, minHeight: 0 }}>
                                <PdfViewerWithHighlights
                                    documentId={openCitation.document_id}
                                    pageNumber={openCitation.selectedPage}
                                    highlights={openCitation.pagesMap[openCitation.selectedPage] ?? []}
                                    fileUrl={undefined}
                                />
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default MessageBubble;
