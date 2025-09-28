export const stringLimit = (str: string, limit: number, end: string = "...") => {
    if (str.length <= limit) {
        return str;
    }
    return str.substring(0, limit) + end;
}

// ===========================
// Phone Parsing Utilities
// ===========================

/**
 * Normaliza um telefone removendo caracteres especiais e formatando
 */
export const normalizePhone = (phone: string): string => {
    // Remove tudo exceto números, parênteses, hífen e espaços
    const cleaned = phone.replace(/[^\d\s\-()]/g, '')
    return cleaned.trim()
}
