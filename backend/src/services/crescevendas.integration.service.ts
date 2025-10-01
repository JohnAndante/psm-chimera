import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { CresceVendasConfig, IntegrationTestResult } from '../types/integration.type.js';

export interface CresceVendasProduct {
  code: string;
  price: number;
  final_price: number;
  limit?: number;
}

export interface CresceVendasBatchUploadRequest {
  override: number;
  start_date: string;
  end_date: string;
  store_registrations: string[];
  name: string;
  discount_store_lines: CresceVendasProduct[];
}

export interface CresceVendasDiscountResponse {
  id: number;
  name: string;
  store_registrations: string[];
  start_date: string;
  end_date: string;
  discount_store_lines: CresceVendasProduct[];
}

export class CresceVendasIntegrationService {
  private config: CresceVendasConfig;

  constructor(config: CresceVendasConfig) {
    this.config = config;
  }

  /**
   * Send products for discount to CresceVendas
   */
  public async sendProducts(storeRegistration: string, products: CresceVendasProduct[]): Promise<any> {
    const endpoint = this.config.send_products_endpoint || '/admin/integrations/discount_stores/batch_upload';
    const url = `${this.config.base_url}${endpoint}`;

    // Calculate start time (5-6 minutes from now)
    const currentDate = new Date();
    let hour = 6;
    let minute = 0;

    if (currentDate.getHours() > 6) {
      hour = currentDate.getHours();
      hour -= 3;

      if (currentDate.getMinutes() >= 55) {
        hour += 1;
        minute = 0;
      } else {
        minute = currentDate.getMinutes() + 5;
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const startTime = `${hour > 9 ? hour : '0' + hour}:${minute > 9 ? minute : '0' + minute}`;

    const body: CresceVendasBatchUploadRequest = {
      override: 1,
      start_date: `${today}T${startTime}`,
      end_date: `${today}T23:59`,
      store_registrations: [storeRegistration],
      name: `${storeRegistration.substring(9, 12)} Descontos - ${today} ${new Date().toISOString().split('T')[1].substring(0, 5)}`,
      discount_store_lines: products.map(product => ({
        ...product,
        limit: product.limit || 1000
      }))
    };

    const config: AxiosRequestConfig = {
      headers: this.getHeaders()
    };

    try {
      const response: AxiosResponse = await axios.post(url, body, config);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error sending products to CresceVendas:', axiosError.message);
      return { error: axiosError.message };
    }
  }

  /**
   * Get products with active discounts from CresceVendas
   */
  public async getActiveProducts(storeRegistration: string): Promise<any> {
    const today = new Date().toISOString().split('T')[0];
    const endpoint = this.config.get_products_endpoint || '/admin/integrations/discount_stores';
    const url = `${this.config.base_url}${endpoint}` +
      `?store_registration=${storeRegistration}` +
      `&start_date=${today}T00:01:00` +
      `&end_date=${today}T23:59:00`;

    const config: AxiosRequestConfig = {
      headers: this.getHeaders()
    };

    try {
      const response: AxiosResponse = await axios.get(url, config);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error getting active products from CresceVendas:', axiosError.message);
      return { error: axiosError.message };
    }
  }

  /**
   * Test connection to CresceVendas API
   */
  public async testConnection(): Promise<IntegrationTestResult> {
    try {
      // Test with a simple API call to validate credentials
      const endpoint = this.config.get_products_endpoint || '/admin/integrations/discount_stores';
      const testUrl = `${this.config.base_url}${endpoint}`;
      const config: AxiosRequestConfig = {
        headers: this.getHeaders(),
        params: {
          start_date: new Date().toISOString().split('T')[0] + 'T00:01:00',
          end_date: new Date().toISOString().split('T')[0] + 'T23:59:00',
          limit: 1
        }
      };

      const response: AxiosResponse = await axios.get(testUrl, config);

      return {
        success: true,
        message: 'Conexão com CresceVendas estabelecida com sucesso',
        data: {
          endpoint: testUrl,
          status: response.status,
          response_time: Date.now()
        }
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      const endpoint = this.config.get_products_endpoint || '/admin/integrations/discount_stores';
      return {
        success: false,
        message: `Erro ao conectar com CresceVendas: ${axiosError.message}`,
        error: axiosError.message,
        data: {
          endpoint: `${this.config.base_url}${endpoint}`,
          status: axiosError.response?.status || 0
        }
      };
    }
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): Record<string, string> {
    return {
      ...this.config.auth_headers,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Parse products from generic format to CresceVendas format
   */
  public static parseProducts(products: any[]): CresceVendasProduct[] {
    return products.map((product) => ({
      code: product.code,
      price: product.price,
      final_price: product.final_price,
      limit: product.limit || 1000
    }));
  }

  /**
   * Validate CresceVendas configuration
   */
  public static validateConfig(config: CresceVendasConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.base_url) {
      errors.push('Base URL é obrigatória');
    }

    if (!config.auth_headers || Object.keys(config.auth_headers).length === 0) {
      errors.push('Headers de autenticação são obrigatórios');
    }

    if (config.auth_headers && !config.auth_headers['X-AdminUser-Email']) {
      errors.push('Header X-AdminUser-Email é obrigatório');
    }

    if (config.auth_headers && !config.auth_headers['X-AdminUser-Token']) {
      errors.push('Header X-AdminUser-Token é obrigatório');
    }

    // Validate URL format
    if (config.base_url && !config.base_url.match(/^https?:\/\/.+/)) {
      errors.push('Base URL deve ter formato válido (http:// ou https://)');
    }

    // Validate email format
    const email = config.auth_headers?.['X-AdminUser-Email'];
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.push('Email deve ter formato válido');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
