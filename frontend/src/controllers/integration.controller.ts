import { createApiInstance } from './base-api';
import type {
    Integration,
    CreateIntegrationRequest,
    UpdateIntegrationRequest,
    TestConnectionResult
} from '../types/integration';
import type { RPConfig, CresceVendasConfig } from '../types/integration';

// Instância da API para integrations
const api = createApiInstance();

export class IntegrationController {
    static async getAllIntegrations(): Promise<Integration[]> {
        const response = await api.get<{ data: Integration[] }>('v1/integrations');
        return response.data.data;
    }

    static async getIntegrationById(id: number): Promise<Integration> {
        const response = await api.get<{ data: Integration }>(`v1/integrations/${id}`);
        return response.data.data;
    }

    static async createIntegration(integration: CreateIntegrationRequest): Promise<Integration> {
        const response = await api.post<{ data: Integration }>('v1/integrations', integration);
        return response.data.data;
    }

    static async updateIntegration(id: number, integration: UpdateIntegrationRequest): Promise<Integration> {
        const response = await api.put<{ data: Integration }>(`v1/integrations/${id}`, integration);
        return response.data.data;
    }

    static async deleteIntegration(id: number): Promise<void> {
        await api.delete(`v1/integrations/${id}`);
    }

    static async testConnection(id: number): Promise<TestConnectionResult> {
        const response = await api.post<{ data: TestConnectionResult }>(`v1/integrations/${id}/test`);
        return response.data.data;
    }

    static async validateConfig(
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
