/* eslint-disable @typescript-eslint/no-explicit-any */
export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessageMeta {
    citations?: ChatInteractionCitation[];
}

export interface ChatMessage {
    id: string;
    role: ChatRole;
    content: string;
    createdAt: string;
    partial?: boolean;
    meta: ChatMessageMeta | null;
}

export type NDJSONEventType = 'token' | 'content' | 'done' | 'meta' | 'error';

export type NDJSONEvent =
    | { type: 'content' | 'token'; payload: string | { delta?: string;[k: string]: any } }
    | { type: 'citations'; references: Citation[] }
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
    content_type: string;
    upload_date: string;
    status: 'ingested' | 'processing' | 'failed' | string;
    page_count: number;
    file_hash: string;
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

export type UploadResult = {
    ok: true;
    filename: string;
    data: DocumentItem;
    error?: never;
} | {
    ok: false;
    filename: string;
    data?: never;
    error: unknown;
};

export interface ChatInteractionCitation {
    document_id: string;
    filename: string;
    page_number: number;
    text_quote: string;
    bounding_regions: HighlightRect[];
}

export interface ChatInteraction {
    id: string;
    user_id: string;
    query: string;
    response: string;
    created_at: string;
    citations: ChatInteractionCitation[];
}
export interface ChatRequestBody {
    query: string;
    chat_id?: string;
    document_ids?: string[];
}
export interface ValidationErrorDetail {
    loc: (string | number)[];
    msg: string;
    type: string;
}

export interface ErrorResponse {
    detail?: string | ValidationErrorDetail[] | Record<string, any>;
    message?: string;
}

export interface PdfPageType {
    getViewport: (options: { scale: number }) => {
        width: number;
        height: number;
    };
}