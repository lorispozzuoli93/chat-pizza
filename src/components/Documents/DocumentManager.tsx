// src/components/Documents/DocumentManager.tsx
import React, { useEffect, useState } from 'react';
import {
    Box, Button, LinearProgress, Typography, List, ListItem, ListItemText,
    IconButton, Alert, Stack, Dialog, DialogContent
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAppDispatch, useAppSelector } from '../../store';
import { setDocuments, setLoading, setError, addDocument } from '../../store/slices/documentsSlice';
import { getDocuments, uploadFiles } from '../../api/documents';
import type { UploadProgress, DocumentItem } from '../../types';
import { PdfViewer } from '../PdViewer/PdfViewer';

export const DocumentManager: React.FC = () => {
    const dispatch = useAppDispatch();
    const docs = useAppSelector((s) => s.documents?.items ?? []);
    const loading = useAppSelector((s) => s.documents?.loading ?? false);
    console.log(loading)
    const error = useAppSelector((s) => s.documents?.error ?? null);

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [progressList, setProgressList] = useState<UploadProgress[]>([]);
    const [viewDoc, setViewDoc] = useState<DocumentItem | null>(null);

    useEffect(() => { fetchList(); }, []);

    async function fetchList() {
        dispatch(setLoading(true));
        try {
            const list = await getDocuments();
            dispatch(setDocuments(list));
        } catch (e: any) {
            dispatch(setError(e?.message ?? 'Errore caricamento documenti'));
        } finally {
            dispatch(setLoading(false));
        }
    }

    const onFilesSelected = (files: FileList | null) => {
        if (!files) return;
        const arr = Array.from(files);
        setSelectedFiles(arr);
        setProgressList(arr.map(f => ({ filename: f.name, progress: 0, status: 'pending' as const })));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            setProgressList([{ filename: 'Nessun file selezionato', progress: 0, status: 'error', error: 'Nessun file selezionato' }]);
            return;
        }

        // chiamiamo uploadFiles che carica sequenzialmente e invoca onProgress per ogni file
        const results = await uploadFiles(selectedFiles, (filename, percent) => {
            setProgressList(prev => prev.map(p => p.filename === filename ? { ...p, progress: percent, status: percent < 100 ? 'uploading' : p.status } : p));
        });

        // process results
        for (const r of results) {
            if (r.ok) {
                setProgressList(prev => prev.map(p => p.filename === r.filename ? { ...p, progress: 100, status: 'done' } : p));
                // proviamo a ottenere il doc dal server response: backend potrebbe ritornare object o array
                const doc: DocumentItem = Array.isArray(r.data) ? (r.data[0] ?? { id: String(Date.now()), filename: r.filename }) : (r.data ?? { id: String(Date.now()), filename: r.filename });
                dispatch(addDocument(doc));
            } else {
                const msg = (r.error?.response?.data?.detail ?? r.error?.message) ?? 'Errore upload';
                setProgressList(prev => prev.map(p => p.filename === r.filename ? { ...p, status: 'error', error: String(msg) } : p));
            }
        }

        // pulizia e refresh
        setSelectedFiles([]);
        await fetchList();
    };

    return (
        <Box>
            <Typography variant="h6">Carica documenti PDF</Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <Stack direction="row" spacing={2} alignItems="center" sx={{ my: 2 }}>
                <input
                    id="documents-input"
                    type="file"
                    accept="application/pdf"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => onFilesSelected(e.target.files)}
                />
                <label htmlFor="documents-input">
                    <Button variant="contained" component="span" startIcon={<UploadFileIcon />}>Scegli file</Button>
                </label>

                <Button variant="outlined" onClick={handleUpload} disabled={selectedFiles.length === 0}>Upload</Button>
            </Stack>

            <Box>
                {progressList.map(p => (
                    <Box key={p.filename} sx={{ mb: 1 }}>
                        <Typography variant="body2">{p.filename} {p.status === 'uploading' && `— ${p.progress}%`}</Typography>
                        <LinearProgress variant="determinate" value={p.progress} />
                        {p.status === 'error' && <Alert severity="error" sx={{ mt: 1 }}>{p.error}</Alert>}
                    </Box>
                ))}
            </Box>

            <Box sx={{ mt: 3 }}>
                <Typography variant="h6">Documenti caricati</Typography>
                <List>
                    {docs.map(d => (
                        <ListItem key={d.id} secondaryAction={
                            <IconButton edge="end" onClick={() => setViewDoc(d)} aria-label="view"><VisibilityIcon /></IconButton>
                        }>
                            <ListItemText primary={d.filename} secondary={d.uploaded_at ?? ''} />
                        </ListItem>
                    ))}
                </List>
            </Box>

            <Dialog fullWidth maxWidth="md" open={!!viewDoc} onClose={() => setViewDoc(null)}>
                <DialogContent sx={{ height: '80vh' }}>
                    {viewDoc && <PdfViewer fileUrl={viewDoc.download_url ?? `/api/documents/${viewDoc.id}/pdf`} />}
                </DialogContent>
            </Dialog>
        </Box>
    );
};
