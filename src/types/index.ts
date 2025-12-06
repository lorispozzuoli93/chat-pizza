export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
    id: string;
    role: ChatRole;
    content: string;
    createdAt: string;
    partial?: boolean;
}

export type NDJSONEventType = 'token' | 'content' | 'done' | 'meta' | 'error';

export type Role = 'user' | 'assistant' | 'system';

export interface ChatMessage {
    id: string;
    role: Role;
    content: string;
    createdAt: string;
    partial?: boolean;
    meta?: any;
}

export type NDJSONEvent =
    | { type: 'content' | 'token'; payload: string | { delta?: string;[k: string]: any } }
    | { type: 'citations'; references: any[] }
    | { type: 'meta'; payload: any }
    | { type: 'done' }
    | { type: string; payload?: any };

export interface HighlightRect {
    page_number: number;
    rects_in: number[][];
}

export interface Citation {
    document_id: string;
    filename: string;
    page_number: number;
    text_quote: string;
    bounding_regions: HighlightRect[];
}

export interface DocumentItem {
    id: string;
    filename: string;
    uploaded_at?: string;
    download_url?: string;
}

export interface UploadProgress {
    filename: string;
    progress: number;
    status: 'pending' | 'uploading' | 'done' | 'error';
    error?: string;
}

export interface OpenCitationState {
    document_id: string;
    filename?: string;
    pagesMap: Record<number, number[][]>;
    selectedPage: number;
};

export type BBox = number[] | { x: number; y: number; w: number; h: number };
export type Highlight = { page: number; bbox: BBox; color?: string; label?: string };