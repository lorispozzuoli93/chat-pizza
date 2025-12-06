import { BASE } from '../utils/constants';
import type { NDJSONEvent, ChatRequestBody, ErrorResponse, ValidationErrorDetail } from '../types';

export async function fetchNdjsonStream(
    url: string,
    body: ChatRequestBody | Record<string, unknown>,
    onEvent: (evt: NDJSONEvent) => void,
    onError?: (err: Error) => void,
    signal?: AbortSignal
): Promise<void> {
    try {
        const fullUrl = url.startsWith('http') ? url : `${BASE}${url.startsWith('/') ? '' : '/'}${url}`;

        const res = await fetch(fullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body ?? {}),
            signal,
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');

            let parsed: ErrorResponse | undefined;
            try {
                parsed = JSON.parse(text) as ErrorResponse;
            } catch {
                parsed = undefined;
            }

            let message = text || `${res.status} ${res.statusText}`;

            if (parsed) {
                if (Array.isArray(parsed.detail)) {
                    message = parsed.detail.map((d: ValidationErrorDetail) => {
                        const loc = Array.isArray(d.loc) ? d.loc.join('.') : d.loc;
                        return `${loc}: ${d.msg}`;
                    }).join('; ');
                } else if (parsed.detail) {
                    message = typeof parsed.detail === 'string' ? parsed.detail : JSON.stringify(parsed.detail);
                } else if (parsed.message) {
                    message = parsed.message;
                }
            }
            throw new Error(`HTTP ${res.status} ${res.statusText}: ${message}`);
        }

        if (!res.body) throw new Error('Streaming non supportato dal server (res.body è null).');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const parts = buffer.split(/\r?\n/);
            buffer = parts.pop() ?? '';

            for (const lineRaw of parts) {
                const line = lineRaw.trim();
                if (!line) continue;
                let jsonText = line;
                if (jsonText.startsWith('data:')) jsonText = jsonText.replace(/^data:\s*/, '');
                try {
                    const parsed = JSON.parse(jsonText);
                    onEvent(parsed as NDJSONEvent);
                } catch (err) {
                    console.warn('NDJSON parse failed', jsonText, err);
                }
            }
        }

        onEvent({ type: 'done' });
    } catch (err) {
        if (onError) onError(err instanceof Error ? err : new Error(String(err)));
        throw err;
    }
}