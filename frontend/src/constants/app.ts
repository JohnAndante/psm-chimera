export const APP_CONFIG = {
    name: 'PSM Chimera',
    version: '1.0.0',
    description: 'Painel administrativo de configuração do PSM Chimera',
    api: {
        baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
        timeout: 10000, // 10 segundos
    },
} as const;
