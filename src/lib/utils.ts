import { format, formatDistanceToNow } from 'date-fns';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'dd MMM yyyy');
}

export function formatDateShort(dateString: string): string {
  return format(new Date(dateString), 'dd MMM');
}

export function timeAgo(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'Cash',
    upi: 'UPI',
    bank_transfer: 'Bank Transfer',
    card: 'Card',
  };
  return labels[method] || method;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
