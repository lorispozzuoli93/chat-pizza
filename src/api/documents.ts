import axios from 'axios';
import type { DocumentItem } from '../types';
import { BASE } from '../utils/constants';

export async function getDocuments(): Promise<DocumentItem[]> {
    const url = `${BASE}/api/documents/`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) {
        throw new Error(`GET documents failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data as DocumentItem[];
}

export async function uploadSingleFile(
    file: File,
    onProgress?: (percent: number) => void
): Promise<any> {
    const url = `${BASE}/api/documents/`;
    const form = new FormData();
    // many backends expect a field name 'files' for multiple; for single we still use 'files'
    form.append('files', file, file.name);

    const res = await axios.post(url, form, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (ev: ProgressEvent) => {
            if (!onProgress) return;
            const pct = ev.total ? Math.round((ev.loaded * 100) / ev.total) : 0;
            onProgress(pct);
        },
    });

    return res.data;
}

export async function uploadFiles(
    files: File[],
    onProgress?: (filename: string, percent: number) => void
): Promise<Array<{ ok: boolean; filename: string; data?: any; error?: any }>> {
    const results: Array<{ ok: boolean; filename: string; data?: any; error?: any }> = [];

    for (const file of files) {
        try {
            const data = await uploadSingleFile(file, (pct) => {
                onProgress?.(file.name, pct);
            });
            results.push({ ok: true, filename: file.name, data });
        } catch (err) {
            results.push({ ok: false, filename: file.name, error: err });
        }
    }

    return results;
}

export async function getDocumentDetail(id: string) {
    const res = await fetch(`${BASE}/api/documents/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return await res.json();
}

// returns the direct file endpoint (we'll fetch inside PdfViewer with credentials)
export function getDocumentFileUrl(id: string) {
    return `${BASE}/api/documents/${id}/file`;
}
