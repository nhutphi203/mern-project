export const storage = {
    get: <T>(key: string): T | null => {
        if (typeof window === 'undefined') return null;
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    },

    set: <T>(key: string, value: T): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Ignore storage errors
        }
    },

    remove: (key: string): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(key);
        } catch {
            // Ignore storage errors
        }
    },

    clear: (): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.clear();
        } catch {
            // Ignore storage errors
        }
    }
};