export const API_BASE = import.meta.env.VITE_API_URL;

export async function getJson<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`);
    await handleError(res);
    return res.json();
}

export async function postFormData<T>(path: string, formData: FormData): Promise<T> {
    let res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        body: formData,
    });
    await handleError(res);
    return res.json();
}

export async function requestJson<T>(path: string, method: string, json: any): Promise<T> {
    let res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(json),
    });
    await handleError(res);
    return res.json();
}

async function handleError(res: Response) {
    if (!res.ok) {
        let message = `Error ${res.status} ${res.statusText}`;
        try {
            const json = await res.json();
            message = json.error || json.message || message;
        } catch {
        }
        throw new Error(message);
    }
}