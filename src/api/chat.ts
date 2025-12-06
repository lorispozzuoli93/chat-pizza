import type { ChatInteraction } from "../types";
import { BASE } from "../utils/constants";

export async function getChatList(): Promise<ChatInteraction[]> {
    const res = await fetch(`${BASE}/api/chat/`, { credentials: 'include' });
    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    return await res.json();
}

export async function getChatById(chatId: string): Promise<ChatInteraction> {
    const res = await fetch(`${BASE}/api/chat/${chatId}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return res.json();
}