export function markdownToPlainText(value = '') {
    return String(value || '')
        .replace(/!\[[^\]]*]\([^)]*\)/g, '')
        .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^>\s?/gm, '')
        .replace(/^[-*+]\s+\[[ xX]\]\s+/gm, '')
        .replace(/^[-*+]\s+/gm, '')
        .replace(/^\d+\.\s+/gm, '')
        .replace(/^(\s*\|?\s*:?-{3,}:?\s*)+\|?\s*$/gm, '')
        .replace(/\|/g, ' ')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        .replace(/~~([^~]+)~~/g, '$1')
        .replace(/^[-*_]{3,}$/gm, '')
        .replace(/\s+/g, ' ')
        .trim();
}

export function markdownExcerpt(value = '', maxLength = 80) {
    const text = markdownToPlainText(value);
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trim()}...`;
}
