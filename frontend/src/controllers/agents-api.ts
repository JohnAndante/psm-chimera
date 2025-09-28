import { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';

import { createApiInstance, handleAxiosResponse, handleAxiosError } from './base-api';
import type { ApiResponse } from '../types/api';
import type {
    CreateAgentRequest,
    CreateAgentResponse,
    UpdateAgentRequest,
    UpdateAgentResponse,
    ListAgentsResponse,
    GetAgentResponse,
    ListVoicesResponse
} from '../types/agent-api';

// ===========================
// Agents API Class
// ===========================

class AgentsApi {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = createApiInstance();
    }

    /**
     * Cria um novo agente
     */
    createAgent(agentData: CreateAgentRequest): Promise<ApiResponse<CreateAgentResponse>> {
        return this.axiosInstance.post<CreateAgentResponse>('/agent/create', agentData)
            .then(response => handleAxiosResponse(response))
            .catch(error => handleAxiosError(error as AxiosError));
    }

    /**
     * Lista todos os agentes da empresa
     */
    listAgents(): Promise<ApiResponse<ListAgentsResponse>> {
        return this.axiosInstance.get<ListAgentsResponse>('/agent/list')
            .then(response => handleAxiosResponse(response))
            .catch(error => handleAxiosError(error as AxiosError));
    }

    /**
     * Busca um agente específico por ID
     */
    getAgent(agentId: string): Promise<ApiResponse<GetAgentResponse>> {
        return this.axiosInstance.get<GetAgentResponse>(`/agent/${agentId}`)
            .then(response => handleAxiosResponse(response))
            .catch(error => handleAxiosError(error as AxiosError));
    }

    /**
     * Atualiza um agente existente
     */
    updateAgent(agentId: string, agentData: UpdateAgentRequest): Promise<ApiResponse<UpdateAgentResponse>> {
        return this.axiosInstance.post<UpdateAgentResponse>(`/agent/${agentId}/update`, agentData)
            .then(response => handleAxiosResponse(response))
            .catch(error => handleAxiosError(error as AxiosError));
    }

    /**
     * Lista todas as vozes disponíveis para agentes
     */
    listVoices(): Promise<ApiResponse<ListVoicesResponse>> {
        return this.axiosInstance.get<ListVoicesResponse>('/agent/voices')
            .then(response => handleAxiosResponse(response))
            .catch(error => handleAxiosError(error as AxiosError));
    }
}

// ===========================
// Instância e Exports
// ===========================

export const agentsApi = new AgentsApi();
