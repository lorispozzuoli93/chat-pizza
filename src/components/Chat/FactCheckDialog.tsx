import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { getDocumentDetail } from '../../api/documents';
import PdfViewer from '../PdViewer/PdfViewer';

type Citation = {
    document_id: string;
    page: number;
    text_quote?: string;
    bbox?: any;
};

export const FactCheckDialog: React.FC<{ open: boolean; onClose: () => void; citations: Citation[] }> = ({ open, onClose, citations }) => {
    const [selected, setSelected] = useState<Citation | null>(null);
    const [docMeta, setDocMeta] = useState<any | null>(null);

    useEffect(() => {
        if (!selected) return;
        (async () => {
            try {
                const meta = await getDocumentDetail(selected.document_id);
                setDocMeta(meta);
            } catch (e) {
                console.error('getDocumentDetail', e);
                setDocMeta(null);
            }
        })();
    }, [selected]);

    return (
        <Dialog fullWidth maxWidth="lg" open={open} onClose={() => { setSelected(null); onClose(); }}>
            <DialogTitle>Documenti correlati</DialogTitle>
            <DialogContent sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ width: 360, maxHeight: '70vh', overflow: 'auto' }}>
                    <List>
                        {citations.map((c, i) => (
                            <ListItem key={i} divider secondaryAction={
                                <Button size="small" onClick={() => setSelected(c)}>Mostra</Button>
                            }>
                                <ListItemText
                                    primary={c.document_id}
                                    secondary={
                                        <>
                                            <Typography variant="body2">Pagina: {c.page}</Typography>
                                            <Typography variant="caption" color="text.secondary">{c.text_quote ?? ''}</Typography>
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Box sx={{ flex: 1, height: '70vh' }}>
                    {selected ? (
                        <>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>{docMeta?.filename ?? selected.document_id} — pagina {selected.page}</Typography>
                            <PdfViewer fileId={selected.document_id} page={selected.page} highlights={[
                                { page: selected.page, bbox: selected.bbox, color: 'rgba(255,200,0,0.35)', label: selected.text_quote }
                            ]} />
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="body2">Seleziona una citation per visualizzare la pagina e le bounding regions.</Typography>
                        </Box>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};
