import type { NDJSONEvent } from '../types';

export async function fetchNdjsonStream(
    url: string,
    body: any,
    onEvent: (evt: NDJSONEvent) => void,
    onError?: (err: any) => void,
    signal?: AbortSignal
): Promise<void> {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
    });

    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    if (!res.body) throw new Error('No streaming body from server');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            let index;
            while ((index = buffer.indexOf('\n')) >= 0) {
                const line = buffer.slice(0, index).trim();
                buffer = buffer.slice(index + 1);
                if (!line) continue;
                try {
                    const obj = JSON.parse(line) as NDJSONEvent;
                    onEvent(obj);
                } catch (err) {
                    console.warn('failed to parse ndjson line', line, err);
                }
            }
        }

        if (buffer.trim()) {
            const obj = JSON.parse(buffer.trim()) as NDJSONEvent;
            onEvent(obj);
        }
    } catch (err) {
        onError?.(err);
        throw err;
    } finally {
        reader.releaseLock();
    }
}
