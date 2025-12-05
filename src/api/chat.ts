import { BASE } from "../utils/constants";

export async function getChatHistory(): Promise<any[]> {
    const res = await fetch(`${BASE}/api/chat/`, { credentials: 'include' });
    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    return await res.json();
}

export async function getChatList(): Promise<any[]> {
    const res = await fetch(`${BASE}/api/chat/`, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return res.json();
}

export async function getChatById(chatId: string): Promise<any> {
    const res = await fetch(`${BASE}/api/chat/${chatId}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return res.json();
}