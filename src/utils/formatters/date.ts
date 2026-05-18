/**
 * Formats an ISO timestamp (e.g., from Supabase) into a localized Month and Year.
 *
 * @param timestamp - The ISO string, Date object, or null/undefined state from the DB
 * @param variant - 'text' for "May 2026", 'numeric' for "05/2026", 'short' for "May '26"
 * @returns Formatted date string, or a fallback string if invalid
 */
export function formatMonthYear(
  timestamp: string | Date | null | undefined,
  variant: 'text' | 'numeric' | 'short' = 'text',
): string {
  if (!timestamp) return '---';

  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

  // Safeguard against invalid date strings passed from database states
  if (isNaN(date.getTime())) {
    return '---';
  }

  switch (variant) {
    case 'numeric': {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${year}`;
    }

    case 'short':
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        year: '2-digit',
      }).format(date);

    case 'text':
    default:
      return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
      }).format(date);
  }
}
