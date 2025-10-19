export function json(body: Record<string, unknown>, config: unknown = {}) {
    return new Response(JSON.stringify(body), { ...config as any });
}