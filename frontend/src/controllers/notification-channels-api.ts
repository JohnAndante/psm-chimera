import type { AxiosInstance } from 'axios';
import { createApiInstance } from './base-api';
import type {
    NotificationChannelData,
    CreateNotificationChannelData,
    UpdateNotificationChannelData,
    NotificationChannelApiFilters,
    NotificationChannelResponse,
    NotificationTestResponse,
    TestNotificationChannelData
} from "@/types/notification-channel";
import { processApiError } from "@/utils/api-error";

class NotificationChannelsApi {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = createApiInstance();
    }

    /**
     * Lista todos os canais de notificação com filtros opcionais
     */
    list(filters?: NotificationChannelApiFilters) {
        return new Promise<NotificationChannelData[]>((resolve, reject) => {
            const params = new URLSearchParams();

            if (filters?.search?.trim()) {
                params.append('search', filters.search.trim());
            }

            if (filters?.type) {
                params.append('type', filters.type);
            }

            if (filters?.active !== undefined) {
                params.append('active', filters.active.toString());
            }

            const queryString = params.toString();
            const url = queryString ? `v1/notifications/channels?${queryString}` : 'v1/notifications/channels';

            this.axiosInstance.get(url)
                .then(response => {
                    const { channels } = response.data as NotificationChannelResponse;
                    resolve(channels || []);
                })
                .catch(error => {
                    reject(processApiError(error));
                });
        });
    }

    /**
     * Busca um canal específico por ID
     */
    getById(id: number) {
        return new Promise<NotificationChannelData>((resolve, reject) => {
            this.axiosInstance.get(`v1/notifications/channels/${id}`)
                .then(response => {
                    const { channel } = response.data as NotificationChannelResponse;
                    if (!channel) {
                        reject(new Error("Canal não encontrado na resposta"));
                        return;
                    }
                    resolve(channel);
                })
                .catch(error => {
                    reject(processApiError(error));
                });
        });
    }

    /**
     * Cria um novo canal de notificação
     */
    create(data: CreateNotificationChannelData) {
        return new Promise<NotificationChannelData>((resolve, reject) => {
            this.axiosInstance.post('v1/notifications/channels', data)
                .then(response => {
                    const { channel } = response.data as NotificationChannelResponse;
                    if (!channel) {
                        reject(new Error("Canal não retornado na resposta de criação"));
                        return;
                    }
                    resolve(channel);
                })
                .catch(error => {
                    reject(processApiError(error));
                });
        });
    }

    /**
     * Atualiza um canal existente
     */
    update(id: number, data: UpdateNotificationChannelData) {
        return new Promise<NotificationChannelData>((resolve, reject) => {
            this.axiosInstance.put(`v1/notifications/channels/${id}`, data)
                .then(response => {
                    const { channel } = response.data as NotificationChannelResponse;
                    if (!channel) {
                        reject(new Error("Canal não retornado na resposta de atualização"));
                        return;
                    }
                    resolve(channel);
                })
                .catch(error => {
                    reject(processApiError(error));
                });
        });
    }

    /**
     * Remove um canal de notificação
     */
    delete(id: number) {
        return new Promise<void>((resolve, reject) => {
            this.axiosInstance.delete(`v1/notifications/channels/${id}`)
                .then(() => {
                    resolve();
                })
                .catch(error => {
                    reject(processApiError(error));
                });
        });
    }

    /**
     * Testa um canal de notificação
     */
    test(id: number, testData?: TestNotificationChannelData) {
        return new Promise<NotificationTestResponse>((resolve, reject) => {
            this.axiosInstance.post(`v1/notifications/channels/${id}/test`, testData || {})
                .then(response => {
                    resolve(response.data as NotificationTestResponse);
                })
                .catch(error => {
                    reject(processApiError(error));
                });
        });
    }
}

export const notificationChannelsApi = new NotificationChannelsApi();
