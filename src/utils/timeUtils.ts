/**
 * Utility functions for academic time processing and overlap calculations.
 */

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const normalized = timeStr.trim().replace('.', ':');
  const parts = normalized.split(':');
  if (parts.length < 2) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Overlapping Time Detection:
 * Condition: startA < endB && endA > startB
 */
export function detectTimeOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const minStartA = timeToMinutes(startA);
  const minEndA = timeToMinutes(endA);
  const minStartB = timeToMinutes(startB);
  const minEndB = timeToMinutes(endB);

  if (minEndA <= minStartA || minEndB <= minStartB) {
    return false;
  }

  return minStartA < minEndB && minEndA > minStartB;
}

export function formatTimeRange(start: string, end: string): string {
  const cleanStart = (start || '').replace(':', '.');
  const cleanEnd = (end || '').replace(':', '.');
  return `${cleanStart} - ${cleanEnd}`;
}

export function parseTimeString(timeStr: string): { start: string; end: string; isValid: boolean } {
  if (!timeStr || typeof timeStr !== 'string') {
    return { start: '', end: '', isValid: false };
  }

  // Clean and standardize delimiters
  const cleaned = timeStr
    .trim()
    .replace(/<[^>]*>/g, '') // strip html tags like <br>
    .replace(/\s+/g, ' ')
    .replace(/s\/d|sd|s\.d|sampai/gi, '-');

  // Match pattern like 08.00-09.20 or 08:00 - 09:20 or 8.00-9.20
  const match = cleaned.match(/(\d{1,2})[.:](\d{2})\s*[-–—]\s*(\d{1,2})[.:](\d{2})/);
  if (match) {
    const startH = match[1].padStart(2, '0');
    const startM = match[2];
    const endH = match[3].padStart(2, '0');
    const endM = match[4];

    const start = `${startH}:${startM}`;
    const end = `${endH}:${endM}`;

    const minStart = timeToMinutes(start);
    const minEnd = timeToMinutes(end);

    if (minEnd > minStart && minEnd <= 24 * 60) {
      return { start, end, isValid: true };
    }
  }

  return { start: '', end: '', isValid: false };
}
