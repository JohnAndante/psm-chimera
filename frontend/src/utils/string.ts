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

/**
 * Formatador de datas para a Timezone e formato brasileiro
 */
export const formatDateToBR = (date: Date | string): string => {
    const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
    };
    return new Date(date).toLocaleDateString('pt-BR', options);
}
