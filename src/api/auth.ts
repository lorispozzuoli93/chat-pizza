export interface LoginRequest { user_id: string; }
export interface LoginResponse { success: boolean; user_id?: string; message?: string; }

const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export async function loginApi(user_id: string): Promise<LoginResponse> {
    const url = `${BASE}/api/auth/login`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // IMPORTANT: backend sets cookie
        body: JSON.stringify({ user_id }),
    });

    if (!res.ok) {
        // prova a leggere corpo (json) per messaggio d'errore
        let body;
        try { body = await res.json(); } catch { body = null; }
        return { success: false, message: body?.message ?? `${res.status} ${res.statusText}` };
    }

    // backend potrebbe restituire json oppure solo cookie; proviamo a leggere json se presente
    try {
        const data = await res.json();
        return { success: true, user_id: data?.user_id ?? user_id };
    } catch {
        return { success: true, user_id };
    }
}
