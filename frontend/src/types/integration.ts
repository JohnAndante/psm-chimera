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

export interface IntegrationWithExtras extends Integration {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    integrationKey?: any[];
    job_configs?: JobConfig[];
}

export interface PaginationConfig {
    method: string;
    param_name?: string;
    additional_params?: Record<string, string> | null;
}

export interface JobConfig {
    id: number;
    name: string;
    active: boolean;
    cron_pattern: string;
}


export interface RPConfig {
    base_url: string;
    token?: string;
    username?: string;
    password?: string;
    // optional fields present in backend payloads
    auth_method?: string;
    token_header?: string;
    login_endpoint?: string;
    products_endpoint?: string;
    pagination?: PaginationConfig;
}

export interface CresceVendasConfig {
    base_url: string;
    api_key?: string;
    auth_headers?: Record<string, string>;
    campaign_config?: {
        name?: string;
        start_time?: string;
        end_time?: string;
        override_existing?: boolean;
    };
    get_products_endpoint?: string;
    send_products_endpoint?: string;
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
