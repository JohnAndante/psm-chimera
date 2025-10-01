export type IntegrationType = 'RP' | 'CRESCEVENDAS';

export const INTEGRATION_TYPES = {
    RP: 'RP' as const,
    CRESCEVENDAS: 'CRESCEVENDAS' as const
};

export interface Integration {
    id: number;
    name: string;
    type: IntegrationType;
    config: RPConfig | CresceVendasConfig;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface RPConfig {
    base_url: string;
    token: string;
    username: string;
    password: string;
}

export interface CresceVendasConfig {
    base_url: string;
    api_key: string;
}

export interface CreateIntegrationRequest {
    name: string;
    type: IntegrationType;
    config: RPConfig | CresceVendasConfig;
    active?: boolean;
}

export interface UpdateIntegrationRequest {
    name?: string;
    config?: RPConfig | CresceVendasConfig;
    active?: boolean;
}

export interface TestConnectionResult {
    success: boolean;
    message: string;
    details?: {
        response_time?: number;
        endpoint_tested?: string;
        error_code?: string;
    };
}
