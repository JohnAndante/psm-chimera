export interface IntegrationLite {
    id: number;
    name: string;
    type: string;
    active: boolean;
}

// Configuração específica para integração RP
export interface RPIntegrationConfig {
    auth_method: 'TOKEN' | 'LOGIN';
    // Para TOKEN direto
    static_token?: string;
    token_header?: string; // ex: "Authorization", "token", "X-API-Key"
    // Para LOGIN
    base_url?: string; // ex: "https://rp-api.example.com.br"
    login_endpoint?: string; // ex: "/v1.1/auth"
    username?: string;
    password?: string;
    token_response_field?: string; // ex: "response.token", "data.access_token"
    // Endpoints
    products_endpoint?: string; // ex: "/v2.8/produtounidade/listaprodutos/{lastId}/unidade/{storeReg}/detalhado"
    pagination?: {
        method: 'OFFSET' | 'CURSOR';
        param_name: string; // ex: "lastProductId", "page"
        additional_params?: Record<string, string>; // ex: {"somentePreco2": "true"}
    };
}

// Configuração específica para integração CresceVendas
export interface CresceVendasConfig {
    base_url?: string; // ex: "https://api.crescevendas.com.br"
    auth_headers: Record<string, string>; // ex: {"X-AdminUser-Email": "...", "X-AdminUser-Token": "..."}
    send_products_endpoint?: string; // ex: "/admin/integrations/discount_stores/batch_upload"
    get_products_endpoint?: string; // ex: "/admin/integrations/discount_stores"
    campaign_config?: {
        name_template: string; // ex: "{store} Descontos - {date}"
        start_time: string; // ex: "06:00"
        end_time: string; // ex: "23:59"
        override_existing: boolean; // ex: true
    };
}

// União de configurações (apenas RP e CresceVendas)
export type IntegrationConfig = RPIntegrationConfig | CresceVendasConfig;

// Interface completa de integração
export interface IntegrationData {
    id: number;
    name: string;
    type: 'RP' | 'CRESCEVENDAS';
    config: IntegrationConfig;
    active: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

// Dados para criação de integração
export interface CreateIntegrationData {
    name: string;
    type: 'RP' | 'CRESCEVENDAS';
    config: IntegrationConfig;
    active?: boolean;
}

// Dados para atualização de integração
export interface UpdateIntegrationData {
    name?: string;
    type?: 'RP' | 'CRESCEVENDAS';
    config?: IntegrationConfig;
    active?: boolean;
}

// Filtros para busca de integrações
export interface IntegrationFilters {
    type?: 'RP' | 'CRESCEVENDAS';
    active?: boolean;
    search?: string;
}

// Resultado de teste de integração
export interface IntegrationTestResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
    response_time?: number;
}
