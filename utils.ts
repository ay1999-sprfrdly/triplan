
export const PALETTE = [
  '#10b981', // emerald-500
  '#059669', // emerald-600
  '#047857', // emerald-700
  '#065f46', // emerald-800
  '#0d9488', // teal-600
  '#0f766e', // teal-700
  '#115e59', // teal-800
  '#134e4a', // teal-900
];

export const generateColor = (str: string): string => {
    let hash = 0;
    if (str.length === 0) return PALETTE[0];
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    const index = Math.abs(hash % PALETTE.length);
    return PALETTE[index];
};

export const escapeHTML = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};