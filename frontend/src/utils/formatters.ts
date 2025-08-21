import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (date: string | Date, formatString: string = 'PPP'): string => {
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        if (!isValid(dateObj)) return 'Invalid Date';
        return format(dateObj, formatString);
    } catch {
        return 'Invalid Date';
    }
};

export const formatTime = (time: string): string => {
    try {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    } catch {
        return time;
    }
};

export const formatPhone = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
};

export const formatNIC = (nic: string): string => {
    const cleaned = nic.replace(/\D/g, '');
    if (cleaned.length === 12) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    }
    return nic;
};

// Currency formatter for USD
export const formatCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '$0.00';
    return `$${numAmount.toFixed(2)}`;
};

// Format large numbers with commas (for USD)
export const formatAmount = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '$0.00';
    return `$${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
