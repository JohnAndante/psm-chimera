# Plano de Ação

## 🎯 **Plano de Ação: Sistema de Integração Configurável**

### **📋 Objetivo Principal**

Migrar o fluxo hardcoded do [`fazTudo2`]fazTudo2.ts ) para um sistema configurável via UI que permita:

- Configurar integrações A (RP) e B (CresceVendas) dinamicamente
- Executar jobs automáticos (5h e 5h30) e sob demanda
- Notificações via Telegram configuráveis
- Comparação automatizada de dados

---

## 🔧 **BACKEND - Implementações Necessárias**

### **1. 📊 Expandir Sistema de Integrações**

#### **1.1 Atualizar Types de Integration**

```typescript
// src/types/integration.type.ts - EXPANDIR
export interface RPIntegrationConfig {
  auth_method: 'TOKEN' | 'LOGIN';
  // Para TOKEN direto
  static_token?: string;
  token_header?: string; // ex: "Authorization", "token", "X-API-Key"
  // Para LOGIN
  login_endpoint?: string;
  username?: string;
  password?: string;
  token_response_field?: string; // ex: "response.token", "data.access_token"
  // Endpoints
  products_endpoint?: string; // ex: "/v2.8/produtounidade/listaprodutos/{lastId}/unidade/{storeReg}/detalhado"
  pagination?: {
    method: 'OFFSET' | 'CURSOR';
    param_name: string; // ex: "lastProductId", "page"
  };
}

export interface CresceVendasConfig {
  auth_headers: Record<string, string>; // ex: {"X-AdminUser-Email": "...", "X-AdminUser-Token": "..."}
  send_products_endpoint?: string;
  get_products_endpoint?: string;
  campaign_config?: {
    name_template: string; // ex: "{store} Descontos - {date}"
    start_time: string; // ex: "06:00"
    end_time: string; // ex: "23:59"
  };
}
```

#### **1.2 Criar Integration Service Adapters**

```typescript
// src/services/rp.integration.service.ts - CRIAR
export class RPIntegrationService {
  constructor(private config: RPIntegrationConfig) {}

  async authenticate(): Promise<string>
  async getProductsByStore(storeReg: string, lastId?: number): Promise<Product[]>
  async testConnection(): Promise<boolean>
}

// src/services/crescevendas.integration.service.ts - CRIAR
export class CresceVendasIntegrationService {
  constructor(private config: CresceVendasConfig) {}

  async sendProducts(storeReg: string, products: Product[]): Promise<CampaignResult>
  async getActiveProducts(storeReg: string): Promise<Product[]>
  async testConnection(): Promise<boolean>
}
```

### **2. 🔄 Sistema de Jobs Configurável**

#### **2.1 Expandir Job Configuration**

```typescript
// src/types/job.type.ts - EXPANDIR
export interface SyncJobConfig {
  source_integration_id: number; // RP Integration
  target_integration_id: number; // CresceVendas Integration
  notification_channel_id?: number;
  stores: number[]; // IDs das lojas ou [] para todas
  schedule: {
    sync_time: string; // ex: "05:00"
    compare_time: string; // ex: "05:30"
  };
  options: {
    batch_size: number;
    cleanup_old_data: boolean;
    send_notifications: boolean;
  };
}
```

#### **2.2 Implementar Job Processors**

```typescript
// src/services/sync.job.service.ts - CRIAR
export class SyncJobService {
  async executeSyncJob(config: SyncJobConfig): Promise<JobExecutionResult>
  async executeCompareJob(config: SyncJobConfig): Promise<CompareResult>
  async executeSyncForStore(storeId: number, config: SyncJobConfig): Promise<StoreResult>
}
```

### **3. 📱 Controllers para Execução Manual**

#### **3.1 Integration Management Controller**

```typescript
// src/controllers/integration.controller.ts - EXPANDIR
export class IntegrationController {
  // Existing methods...

  static testIntegration(req: AuthenticatedRequest, res: Response) {
    // Testar conexão com integração específica
  }

  static validateConfig(req: AuthenticatedRequest, res: Response) {
    // Validar configuração antes de salvar
  }
}
```

#### **3.2 Manual Execution Controller**

```typescript
// src/controllers/manual.execution.controller.ts - CRIAR
export class ManualExecutionController {
  static syncAllStores(req: AuthenticatedRequest, res: Response) {
    // Executar sync manual para todas as lojas
  }

  static syncSpecificStore(req: AuthenticatedRequest, res: Response) {
    // Executar sync manual para loja específica
  }

  static compareData(req: AuthenticatedRequest, res: Response) {
    // Executar comparação manual
  }

  static getExecutionHistory(req: AuthenticatedRequest, res: Response) {
    // Histórico de execuções
  }
}
```

### **4. 🔔 Sistema de Notificações Expandido**

#### **4.1 Templates de Mensagem**

```typescript
// src/services/notification.template.service.ts - CRIAR
export class NotificationTemplateService {
  static getSyncStartTemplate(storeCount: number): string
  static getSyncSuccessTemplate(results: SyncResult[]): string
  static getSyncErrorTemplate(error: string): string
  static getCompareResultTemplate(comparison: CompareResult): string
}
```

### **5. 📊 Logs e Auditoria**

#### **5.1 Execution Logs**

```typescript
// Expandir job_executions table com:
- step_logs: Json // Log detalhado de cada etapa
- performance_metrics: Json // Tempo, quantidade de produtos, etc.
- comparison_results: Json // Resultados da comparação
```

---

## 🎨 **FRONTEND - Implementações Necessárias**

### **1. 📋 Páginas de Configuração**

#### **1.1 Integration Configuration Page**

```typescript
// src/pages/IntegrationsPage/ - EXPANDIR
- Wizard de configuração por tipo
- Formulários dinâmicos baseados no tipo
- Preview/teste de configuração
- Validação em tempo real
```

#### **1.2 Job Configuration Page**

```typescript
// src/pages/JobsPage/ - CRIAR
- Configuração de jobs de sincronização
- Seleção de integrações source/target
- Configuração de horários (cron visual)
- Seleção de lojas (multi-select com filtros)
- Configuração de notificações
```

### **2. 🚀 Dashboard de Execução**

#### **2.1 Manual Execution Dashboard**

```typescript
// src/pages/ExecutionPage/ - CRIAR
- Botões para execução manual (todas/por loja)
- Status em tempo real das execuções
- Logs ao vivo
- Histórico de execuções
- Métricas de performance
```

#### **2.2 Monitoring Dashboard**

```typescript
// src/pages/MonitoringPage/ - CRIAR
- Status dos jobs automáticos
- Últimas execuções
- Alertas e falhas
- Comparações de dados
- Gráficos de performance
```

### **3. 🔧 Componentes Específicos**

#### **3.1 Integration Config Components**

```typescript
// src/components/integration/ - CRIAR
- IntegrationTypeSelector
- RPConfigForm (auth method, endpoints)
- CresceVendasConfigForm (headers, endpoints)
- IntegrationTester (testar conexão)
- ConfigPreview (preview JSON)
```

#### **3.2 Job Config Components**

```typescript
// src/components/jobs/ - CRIAR
- CronScheduleBuilder (visual cron builder)
- StoreSelector (multi-select com pesquisa)
- NotificationChannelSelector
- JobConfigWizard
```

#### **3.3 Execution Components**

```typescript
// src/components/execution/ - CRIAR
- ExecutionButton (com loading states)
- LiveLogViewer (logs em tempo real)
- ExecutionHistoryTable
- ComparisonResultsViewer
- PerformanceMetrics
```

---

## 📅 **Cronograma de Implementação**

### **🔥 Sprint 1 (1-2 semanas): Core Infrastructure**

1. **Backend:**
   - Expandir integration types e configs
   - Criar RP/CresceVendas service adapters
   - Implementar system de jobs configurável

2. **Frontend:**
   - Expandir página de integrações
   - Formulários dinâmicos por tipo de integração

### **🚀 Sprint 2 (1-2 semanas): Job System**

1. **Backend:**
   - Implementar sync job service
   - Controller de execução manual
   - Sistema de templates de notificação

2. **Frontend:**
   - Página de configuração de jobs
   - Dashboard de execução manual

### **📊 Sprint 3 (1 semana): Monitoring & Polish**

1. **Backend:**
   - Logs detalhados e auditoria
   - Métricas de performance

2. **Frontend:**
   - Dashboard de monitoramento
   - Componentes de visualização

---

## 🎯 **Melhorias vs Server-Node-Fill**

### **✅ Vantagens da V2:**

- **Configurável:** Sem código hardcoded
- **Multi-integração:** Suporte a diferentes APIs
- **Interface gráfica:** Configuração via UI
- **Flexível:** Execução manual + automática
- **Auditável:** Logs estruturados e métricas
- **Escalável:** Fácil adicionar novas integrações
- **Testável:** Cada integração pode ser testada isoladamente

### **🔄 Migração Gradual:**

1. **Manter server-node-fill** rodando durante desenvolvimento
2. **Configurar integrações** na V2 baseado nos dados atuais
3. **Testar execução manual** antes de ativar jobs automáticos
4. **Migrar jobs automáticos** um por vez
5. **Desativar server-node-fill** após validação completa

Este plano permite uma migração controlada mantendo a funcionalidade existente enquanto constrói a nova arquitetura configurável! 🚀
