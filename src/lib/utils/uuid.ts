/**
 * Secure context-safe UUID v4 generator.
 * Falls back to crypto.getRandomValues() if crypto.randomUUID is unavailable
 * (e.g., non-HTTPS environments, older browsers).
 */
export function generateUUID(): string {
    // Prefer the native randomUUID if available (requires secure context)
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }

    // Fallback: use crypto.getRandomValues for cryptographic randomness
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const arr = new Uint8Array(1)
            crypto.getRandomValues(arr)
            const r = arr[0] % 16
            const v = c === 'x' ? r : (r & 0x3) | 0x8
            return v.toString(16)
        })
    }

    // Last resort: Math.random (not cryptographically secure, but functional)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}
