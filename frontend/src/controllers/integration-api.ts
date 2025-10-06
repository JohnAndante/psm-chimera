import { createApiInstance } from './base-api';
import type {
    Integration,
    CreateIntegrationRequest,
    UpdateIntegrationRequest,
    TestConnectionResult
} from '../types/integration';
import type { RPConfig, CresceVendasConfig } from '../types/integration';
import type { ApiResponse } from '@/types';

// Instância da API para integrations
const api = createApiInstance();

class IntegrationController {
    async getAllIntegrations(): Promise<ApiResponse<Integration[]>> {
        const response = await api.get<{ data: Integration[] }>('v1/integrations');
        return response.data;
    }

    async getIntegrationById(id: number): Promise<Integration> {
        const response = await api.get<{
            message?: string;
            integration?: Integration;
            data?: Integration;
        }>(`v1/integrations/${id}`);
        // backend returns { message, integration } while some endpoints may use { data }
        return response.data.integration ?? response.data.data as Integration;
    }

    async createIntegration(integration: CreateIntegrationRequest): Promise<Integration> {
        const response = await api.post<{ data: Integration }>('v1/integrations', integration);
        return response.data.data;
    }

    async updateIntegration(id: number, integration: UpdateIntegrationRequest): Promise<Integration> {
        const response = await api.put<{ data: Integration }>(`v1/integrations/${id}`, integration);
        return response.data.data;
    }

    async deleteIntegration(id: number): Promise<void> {
        await api.delete(`v1/integrations/${id}`);
    }

    async testConnection(id: number): Promise<TestConnectionResult> {
        const response = await api.post<{ data: TestConnectionResult }>(`v1/integrations/${id}/test`);
        return response.data.data;
    }

    async validateConfig(
        type: string,
        config: RPConfig | CresceVendasConfig
    ): Promise<{ valid: boolean; errors?: string[] }> {
        const response = await api.post<{ data: { valid: boolean; errors?: string[] } }>('v1/integrations/validate', {
            type,
            config
        });
        return response.data.data;
    }
}

export const integrationAPI = new IntegrationController();
