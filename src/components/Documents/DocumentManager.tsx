import React, { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Box, Button, LinearProgress, Typography, List, ListItem, ListItemText,
    IconButton, Alert, Stack, Dialog, DialogContent, Grid, Paper
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAppDispatch, useAppSelector } from '../../store';
import { setDocuments, setLoading, setError, addDocument } from '../../store/slices/documentsSlice';
import { getDocuments, uploadFiles } from '../../api/documents';
import type { UploadProgress, DocumentItem } from '../../types';
import { PdfThumbnail } from './PdfThumbnail';
import { PdfViewer } from '../PdViewer/PdfViewer';

export const DocumentManager: React.FC = () => {
    const dispatch = useAppDispatch();
    const docs = useAppSelector((s) => s.documents?.items ?? []);
    const error = useAppSelector((s) => s.documents?.error ?? null);

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [progressList, setProgressList] = useState<UploadProgress[]>([]);
    const [viewDoc, setViewDoc] = useState<DocumentItem | null>(null);

    // map file -> objectURL for preview
    const [previews, setPreviews] = useState<Record<string, string>>({});

    useEffect(() => { fetchList(); }, []);

    useEffect(() => {
        // generate object URLs for new files
        const newPreviews: Record<string, string> = {};
        selectedFiles.forEach((f) => {
            if (!previews[f.name]) {
                newPreviews[f.name] = URL.createObjectURL(f);
            }
        });
        if (Object.keys(newPreviews).length) {
            setPreviews((p) => ({ ...p, ...newPreviews }));
        }
        // cleanup when files removed/unmounted
        return () => {
            // do NOT revoke here — revoke when file removed or component unmount
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFiles]);

    useEffect(() => {
        // cleanup on unmount
        return () => {
            Object.values(previews).forEach((url) => URL.revokeObjectURL(url));
        };
    }, [previews]);

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

    // Dropzone setup
    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        // validate mime type & optionally size
        const pdfs = acceptedFiles.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
        if (rejectedFiles.length > 0 && pdfs.length === 0) {
            // show error
            setProgressList([{ filename: 'Nessun file valido', progress: 0, status: 'error', error: 'Solo PDF supportati' }]);
            return;
        }
        setSelectedFiles((prev) => [...prev, ...pdfs]);
        setProgressList((prev) => [...prev, ...pdfs.map(f => ({ filename: f.name, progress: 0, status: 'pending' as const }))]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: true,
        maxFiles: 10,
    });

    const removeSelected = (filename: string) => {
        setSelectedFiles((prev) => prev.filter(f => f.name !== filename));
        setProgressList((prev) => prev.filter(p => p.filename !== filename));
        const url = previews[filename];
        if (url) {
            URL.revokeObjectURL(url);
            setPreviews((p) => { const copy = { ...p }; delete copy[filename]; return copy; });
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            setProgressList([{ filename: 'Nessun file selezionato', progress: 0, status: 'error', error: 'Nessun file selezionato' }]);
            return;
        }

        // use uploadFiles with per-file progress callback
        const results = await uploadFiles(selectedFiles, (filename, percent) => {
            setProgressList(prev => prev.map(p => p.filename === filename ? { ...p, progress: percent, status: percent < 100 ? 'uploading' : p.status } : p));
        });

        for (const r of results) {
            if (r.ok) {
                setProgressList(prev => prev.map(p => p.filename === r.filename ? { ...p, progress: 100, status: 'done' } : p));
                const doc: DocumentItem = Array.isArray(r.data) ? (r.data[0] ?? { id: String(Date.now()), filename: r.filename }) : (r.data ?? { id: String(Date.now()), filename: r.filename });
                dispatch(addDocument(doc));
                // revoke preview for uploaded file
                const url = previews[r.filename];
                if (url) { URL.revokeObjectURL(url); setPreviews((p) => { const copy = { ...p }; delete copy[r.filename]; return copy; }); }
            } else {
                const msg = (r.error?.response?.data?.detail ?? r.error?.message) ?? 'Errore upload';
                setProgressList(prev => prev.map(p => p.filename === r.filename ? { ...p, status: 'error', error: String(msg) } : p));
            }
        }

        setSelectedFiles([]);
        await fetchList();
    };

    return (
        <Box>
            <Typography variant="h6">Carica documenti PDF</Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <Paper variant="outlined" sx={{ p: 2, my: 2 }}>
                <Box {...getRootProps()} sx={{
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    backgroundColor: isDragActive ? 'rgba(25,118,210,0.04)' : 'transparent',
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer'
                }}>
                    <input {...getInputProps()} />
                    <Typography>{isDragActive ? 'Rilascia i file PDF qui...' : 'Carica i file PDF qui...'}</Typography>
                    <Button startIcon={<UploadFileIcon />} sx={{ mt: 1 }}>Scegli file</Button>
                </Box>

                {/* previews & selected files */}
                {selectedFiles.length > 0 && (
                    <>
                        <Typography variant="subtitle2" sx={{ mt: 2 }}>Inviati (anteprima)</Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            {selectedFiles.map((f) => {
                                const p = progressList.find((x) => x.filename === f.name);

                                return (
                                    <Grid item key={f.name}>
                                        <Paper sx={{ p: 1 }}>
                                            <PdfThumbnail file={previews[f.name] ?? f} width={140} filename={f.name} />
                                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mt: 1 }}>
                                                <Button size="small" onClick={() => removeSelected(f.name)}>Rimuovi</Button>
                                            </Stack>

                                            {/* mostra la progress BAR solo se lo stato è 'uploading' */}
                                            {p?.status === 'uploading' && (
                                                <LinearProgress sx={{ mt: 1 }} variant="determinate" value={p.progress ?? 0} />
                                            )}

                                            {/* opzionale: mostra small badge per pending/done/error */}
                                            {p?.status === 'pending' && <Typography variant="caption" color="text.secondary">In attesa di invio</Typography>}
                                            {p?.status === 'done' && <Typography variant="caption" color="success.main">Caricato</Typography>}
                                            {p?.status === 'error' && <Alert severity="error" sx={{ mt: 1 }}>{p.error}</Alert>}
                                        </Paper>
                                    </Grid>
                                );
                            })}
                        </Grid>

                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                            <Button variant="contained" onClick={handleUpload}>Upload selezionati</Button>
                            <Button variant="outlined" onClick={() => { setSelectedFiles([]); setProgressList([]); Object.values(previews).forEach(u => URL.revokeObjectURL(u)); setPreviews({}); }}>Annulla</Button>
                        </Stack>
                    </>
                )}
            </Paper>

            <Box sx={{ mt: 3 }}>
                <Typography variant="h6">Documenti caricati</Typography>
                <List>
                    {docs.map(d => (
                        <ListItem key={d.id} secondaryAction={
                            <>
                                <IconButton edge="end" onClick={() => setViewDoc(d)} aria-label="view"><VisibilityIcon /></IconButton>
                            </>
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
