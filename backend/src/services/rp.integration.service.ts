import axios, { AxiosRequestConfig } from 'axios';
import { RPIntegrationConfig, IntegrationTestResult } from '../types/integration.type';

interface RPProduct {
    id: number;
    nome: string;
    preco: number;
    preco2?: number;
    codbar?: string;
    [key: string]: any;
}

interface RPResponse {
    response: RPProduct[];
    totalRecords?: number;
    hasMore?: boolean;
}

export class RPIntegrationService {
    private token: string = '';
    private config: RPIntegrationConfig;

    constructor(config: RPIntegrationConfig) {
        this.config = config;
    }

    setToken(token: string): this {
        this.token = token;
        return this;
    }

    getToken(): string {
        return this.token;
    }

    async authenticate(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.config.auth_method === 'TOKEN' && this.config.static_token) {
                this.setToken(this.config.static_token);
                resolve(this.getToken());
                return;
            }

            if (this.config.auth_method === 'LOGIN') {
                if (!this.config.base_url || !this.config.login_endpoint || !this.config.username || !this.config.password) {
                    return reject(new Error('Configuração de login incompleta'));
                }

                const loginData = {
                    usuario: this.config.username,
                    senha: this.config.password,
                };

                const loginUrl = `${this.config.base_url}${this.config.login_endpoint}`;

                axios.post(loginUrl, loginData)
                    .then((response: any) => {
                        // Extrair token baseado na configuração
                        const tokenPath = this.config.token_response_field || 'response.token';
                        const token = this.extractValueFromPath(response.data, tokenPath);

                        if (!token) {
                            return reject(new Error('Token não encontrado na resposta de login'));
                        }

                        this.setToken(token);
                        resolve(this.getToken());
                    })
                    .catch((error: any) => {
                        reject(new Error(`Erro no login RP: ${error.message}`));
                    });
            } else {
                reject(new Error('Método de autenticação não configurado'));
            }
        });
    }

    async getProductsByStore(storeReg: string, lastId: number = 0): Promise<RPProduct[]> {
        return new Promise((resolve, reject) => {
            // Verificar se tem token
            if (!this.token && this.config.auth_method === 'LOGIN') {
                this.authenticate()
                    .then(() => this.getProductsByStore(storeReg, lastId))
                    .then(resolve)
                    .catch(reject);
                return;
            }

            if (!this.config.base_url || !this.config.products_endpoint) {
                return reject(new Error('Configuração de produtos incompleta'));
            }

            // Construir headers
            const headers: Record<string, string> = {};
            if (this.config.token_header && this.token) {
                headers[this.config.token_header] = this.token;
            }

            const config: AxiosRequestConfig = { headers };

            // Construir URL com parâmetros
            let productsUrl = `${this.config.base_url}${this.config.products_endpoint}`;

            // Substituir placeholders na URL
            productsUrl = productsUrl
                .replace('{lastId}', lastId.toString())
                .replace('{storeReg}', storeReg);

            // Adicionar parâmetros de query se configurado
            const queryParams = new URLSearchParams();
            if (this.config.pagination?.additional_params) {
                Object.entries(this.config.pagination.additional_params).forEach(([key, value]) => {
                    queryParams.append(key, value);
                });
            }

            if (queryParams.toString()) {
                productsUrl += `?${queryParams.toString()}`;
            }

            axios.get(productsUrl, config)
                .then((response: any) => {
                    const data: RPResponse = response.data;
                    resolve(data.response || []);
                })
                .catch((error: any) => {
                    reject(new Error(`Erro ao buscar produtos RP: ${error.message}`));
                });
        });
    }

    async testConnection(): Promise<IntegrationTestResult> {
        const startTime = Date.now();

        try {
            // Testar autenticação
            await this.authenticate();

            // Se chegou até aqui, a conexão está OK
            const responseTime = Date.now() - startTime;

            return {
                success: true,
                message: 'Conexão com RP estabelecida com sucesso',
                data: {
                    token_length: this.token.length,
                    auth_method: this.config.auth_method
                },
                response_time: responseTime
            };
        } catch (error: any) {
            const responseTime = Date.now() - startTime;

            return {
                success: false,
                message: 'Falha na conexão com RP',
                error: error.message,
                response_time: responseTime
            };
        }
    }

    async getAllProductsByStore(storeReg: string): Promise<RPProduct[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const allProducts: RPProduct[] = [];
                let lastId = 0;
                let hasMore = true;

                while (hasMore) {
                    const products = await this.getProductsByStore(storeReg, lastId);

                    if (products.length === 0) {
                        hasMore = false;
                    } else {
                        allProducts.push(...products);
                        lastId = products[products.length - 1]?.id || lastId + 1;

                        // Limitar para evitar loops infinitos (max 1000 requisições)
                        if (allProducts.length > 100000) {
                            hasMore = false;
                        }
                    }
                }

                resolve(allProducts);
            } catch (error: any) {
                reject(error);
            }
        });
    }

    // Utilitário para extrair valor de um path aninhado (ex: "response.token")
    private extractValueFromPath(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    /**
     * Validate RP integration configuration
     */
    public static validateConfig(config: RPIntegrationConfig): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!config.base_url) {
            errors.push('Base URL é obrigatória');
        }

        if (!config.auth_method) {
            errors.push('Método de autenticação é obrigatório');
        }

        // Validate URL format
        if (config.base_url && !config.base_url.match(/^https?:\/\/.+/)) {
            errors.push('Base URL deve ter formato válido (http:// ou https://)');
        }

        // Validate auth method specific fields
        if (config.auth_method === 'TOKEN') {
            if (!config.static_token) {
                errors.push('Token estático é obrigatório para autenticação via TOKEN');
            }
            if (!config.token_header) {
                errors.push('Header do token é obrigatório para autenticação via TOKEN');
            }
        } else if (config.auth_method === 'LOGIN') {
            if (!config.login_endpoint) {
                errors.push('Endpoint de login é obrigatório para autenticação via LOGIN');
            }
            if (!config.username || !config.password) {
                errors.push('Username e password são obrigatórios para autenticação via LOGIN');
            }
            if (!config.token_response_field) {
                errors.push('Campo de resposta do token é obrigatório para autenticação via LOGIN');
            }
        }

        // Validate endpoints
        if (!config.products_endpoint) {
            errors.push('Endpoint de produtos é obrigatório');
        }

        // Validate pagination config if present
        if (config.pagination) {
            if (!config.pagination.method) {
                errors.push('Método de paginação é obrigatório quando paginação está configurada');
            }
            if (!config.pagination.param_name) {
                errors.push('Nome do parâmetro de paginação é obrigatório');
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

export const createRPIntegrationService = (config: RPIntegrationConfig): RPIntegrationService => {
    return new RPIntegrationService(config);
};
