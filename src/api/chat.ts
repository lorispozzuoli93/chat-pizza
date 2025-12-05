export async function getChatHistory(): Promise<any[]> {
    const BASE = import.meta.env.VITE_API_BASE_URL ?? '';
    const res = await fetch(`${BASE}/api/chat/`, { credentials: 'include' });
    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    return await res.json();
}