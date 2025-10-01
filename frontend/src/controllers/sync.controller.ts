import { createApiInstance } from './base-api';
import type {
    SyncConfiguration,
    SyncExecution,
    SyncExecutionRequest,
    CreateSyncConfigRequest,
    UpdateSyncConfigRequest
} from '../types/sync';

// Instância da API para sync
const api = createApiInstance();

export class SyncController {
    // ===== Sync Configurations =====
    static async getAllSyncConfigs(): Promise<SyncConfiguration[]> {
        try {
            const response = await api.get<{ data: SyncConfiguration[] }>('v1/sync/configs');
            return Array.isArray(response.data?.data) ? response.data.data : [];
        } catch (error) {
            console.error('Erro ao buscar configurações de sync:', error);
            return []; // Retornar array vazio em caso de erro
        }
    }

    static async getSyncConfigById(id: number): Promise<SyncConfiguration> {
        const response = await api.get<{ data: SyncConfiguration }>(`v1/sync/configs/${id}`);
        return response.data.data;
    }

    static async createSyncConfig(config: CreateSyncConfigRequest): Promise<SyncConfiguration> {
        const response = await api.post<{ data: SyncConfiguration }>('v1/sync/configs', config);
        return response.data.data;
    }

    static async updateSyncConfig(id: number, config: UpdateSyncConfigRequest): Promise<SyncConfiguration> {
        const response = await api.put<{ data: SyncConfiguration }>(`v1/sync/configs/${id}`, config);
        return response.data.data;
    }

    static async deleteSyncConfig(id: number): Promise<void> {
        await api.delete(`v1/sync/configs/${id}`);
    }

    // ===== Sync Executions =====
    static async getAllSyncExecutions(): Promise<SyncExecution[]> {
        try {
            const response = await api.get<{ data: SyncExecution[] }>('v1/sync/executions');
            return Array.isArray(response.data?.data) ? response.data.data : [];
        } catch (error) {
            console.error('Erro ao buscar execuções de sync:', error);
            return []; // Retornar array vazio em caso de erro
        }
    }

    static async getSyncExecutionById(id: number): Promise<SyncExecution> {
        const response = await api.get<{ data: SyncExecution }>(`v1/sync/executions/${id}`);
        return response.data.data;
    }

    static async executeSyncNow(request: SyncExecutionRequest): Promise<SyncExecution> {
        const response = await api.post<{ data: SyncExecution }>('v1/sync/execute', request);
        return response.data.data;
    }

    static async cancelSyncExecution(id: number): Promise<void> {
        await api.post(`v1/sync/executions/${id}/cancel`);
    }

    // ===== Sync by Config =====
    static async executeSyncConfig(configId: number, options?: { forceSync?: boolean }): Promise<SyncExecution> {
        const response = await api.post<{ data: SyncExecution }>(`v1/sync/configs/${configId}/execute`, options || {});
        return response.data.data;
    }
}
