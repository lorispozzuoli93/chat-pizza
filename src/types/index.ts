export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
    id: string;
    role: ChatRole;
    content: string;
    createdAt: string;
    partial?: boolean;
}

export type NDJSONEventType = 'token' | 'content' | 'done' | 'meta' | 'error';

export interface NDJSONEvent {
    type: NDJSONEventType;
    payload?: any;
}

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