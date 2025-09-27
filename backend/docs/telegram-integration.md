# Integração com Telegram - Documentação de Testes

## Visão Geral

O sistema agora inclui integração completa com Telegram para notificações em tempo real e execução de jobs sob demanda. As configurações do Telegram são armazenadas **no banco de dados** através da tabela `notification_channels`, permitindo múltiplos canais e configuração dinâmica.

## Configuração

### 1. Canal de Notificação no Banco de Dados

As configurações do Telegram são armazenadas na tabela `notification_channels` do banco de dados. Cada canal contém:

- `name`: Nome do canal (ex: "Telegram PSM")
- `type`: Tipo do canal (`telegram`)
- `config`: Configuração JSON com `bot_token` e `chat_id`
- `active`: Se o canal está ativo

### 2. Obtenção do Bot Token

1. Converse com [@BotFather](https://t.me/botfather) no Telegram
2. Use o comando `/newbot` para criar um novo bot
3. Siga as instruções e obtenha o token
4. Guarde esse token para usar na criação do canal

### 3. Obtenção do Chat ID

1. Adicione o bot ao seu chat ou grupo
2. Envie uma mensagem para o bot
3. Acesse: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Encontre o `chat.id` na resposta
5. Use esse ID ao criar o canal de notificação

### 4. Criando Canal de Notificação

Use o endpoint `POST /api/v1/notificationchannels` para criar um canal:

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Telegram Jobs",
  "type": "telegram",
  "config": {
    "bot_token": "seu_bot_token_aqui",
    "chat_id": "seu_chat_id_aqui"
  },
  "active": true
}
```

## Endpoints Disponíveis

### 1. Executar Job Sob Demanda

**POST** `/api/v1/jobs/test/execute`

Executa um job específico e envia notificação via Telegram.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "jobId": "job_config_id_here",
  "notificationChannelId": "notification_channel_id_here"
}
```

**Exemplo de Resposta:**
```json
{
  "success": true,
  "message": "Job executado com sucesso",
  "data": {
    "executionId": "exec_123",
    "jobId": "job_456",
    "status": "running",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Testar Notificação Telegram

**POST** `/api/v1/jobs/test/notification`

Testa o envio de notificação via Telegram sem executar um job.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "notificationChannelId": "notification_channel_id_here",
  "title": "Teste de Notificação",
  "message": "Esta é uma mensagem de teste do sistema PSM Chimera"
}
```

**Exemplo de Resposta:**
```json
{
  "success": true,
  "message": "Notificação enviada com sucesso",
  "data": {
    "message_id": 123,
    "chat_id": -123456789,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 3. Sincronizar Loja com Notificação

**POST** `/api/v1/jobs/test/sync-store`

Executa sincronização de uma loja específica com notificação em tempo real.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "storeId": "store_id_here",
  "notificationChannelId": "notification_channel_id_here"
}
```

**Exemplo de Resposta:**
```json
{
  "success": true,
  "message": "Sincronização iniciada com sucesso",
  "data": {
    "executionId": "sync_789",
    "storeId": "store_123",
    "status": "running"
  }
}
```

### 4. Testar Conexão Telegram

**GET** `/api/v1/jobs/test/telegram-status`

Verifica se a conexão com o Telegram está funcionando.

**Exemplo de Resposta:**
```json
{
  "success": true,
  "message": "Conexão com Telegram OK",
  "data": {
    "bot_username": "your_bot_name",
    "chat_id": "-123456789",
    "connected": true,
    "last_test": "2024-01-15T10:30:00Z"
  }
}
```

## Tipos de Notificação

### 1. Notificação de Início de Job
```
🚀 JOB INICIADO

📋 Job: Nome do Job
🆔 Execução: exec_123
⏰ Iniciado em: 15/01/2024 10:30:00
```

### 2. Notificação de Sucesso
```
✅ JOB CONCLUÍDO COM SUCESSO

📋 Job: Nome do Job
🆔 Execução: exec_123
⏰ Concluído em: 15/01/2024 10:35:00
📊 Detalhes: Processados 150 produtos
```

### 3. Notificação de Erro
```
❌ JOB FALHOU

📋 Job: Nome do Job
🆔 Execução: exec_123
⏰ Falhou em: 15/01/2024 10:32:00
⚠️ Erro: Conexão com API falhou
```

## Fluxo de Configuração Completo

### 1. Criar Bot no Telegram
```bash
# 1. Converse com @BotFather
# 2. Use /newbot
# 3. Defina nome e username
# 4. Guarde o token fornecido
```

### 2. Obter Chat ID
```bash
# 1. Adicione o bot ao grupo/chat
# 2. Envie uma mensagem
# 3. Acesse a URL abaixo (substitua o TOKEN):
curl "https://api.telegram.org/bot<SEU_TOKEN>/getUpdates"

# 4. Procure por "chat":{"id": NUMERO_DO_CHAT_ID
```

### 3. Criar Canal via API
```bash
curl -X POST http://localhost:3000/api/v1/notificationchannels \
  -H "Authorization: Bearer SEU_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Telegram Produção",
    "type": "telegram",
    "config": {
      "bot_token": "SEU_BOT_TOKEN",
      "chat_id": "SEU_CHAT_ID"
    },
    "active": true
  }'
```

### 4. Testar Conexão
```bash
curl -X GET http://localhost:3000/api/v1/jobs/test/telegram-status
```

### 5. Testar Notificação
```bash
curl -X POST http://localhost:3000/api/v1/jobs/test/notification \
  -H "Content-Type: application/json" \
  -d '{
    "notificationChannelId": ID_DO_CANAL_CRIADO,
    "title": "Teste",
    "message": "Sistema funcionando!"
  }'
```

## Exemplos de Teste com curl

### 1. Executar Job
```bash
curl -X POST http://localhost:3000/api/v1/jobs/test/execute \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "job_config_id",
    "notificationChannelId": "notification_channel_id"
  }'
```

### 2. Testar Notificação
```bash
curl -X POST http://localhost:3000/api/v1/jobs/test/notification \
  -H "Content-Type: application/json" \
  -d '{
    "notificationChannelId": "notification_channel_id",
    "title": "Teste",
    "message": "Mensagem de teste"
  }'
```

### 3. Verificar Status Telegram
```bash
curl -X GET http://localhost:3000/api/v1/jobs/test/telegram-status
```

## Gerenciamento de Canais

### Listar Canais
```bash
curl -X GET http://localhost:3000/api/v1/notificationchannels \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Obter Canal Específico
```bash
curl -X GET http://localhost:3000/api/v1/notificationchannels/ID_DO_CANAL \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Testar Canal Existente
```bash
curl -X POST http://localhost:3000/api/v1/notificationchannels/ID_DO_CANAL/test \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Teste do canal"}'
```

## Logs e Monitoramento

### Logs do Sistema
Os logs da execução de jobs incluem:
- Início e fim de execução
- Status de notificações Telegram
- Erros de conexão
- Detalhes de execução

### Verificação de Status
- Use o endpoint `/telegram-status` para verificar conectividade
- Monitore os logs do console para mensagens de debug
- Verifique o chat do Telegram para confirmação de recebimento

## Solução de Problemas

### Bot não responde
1. Verifique se o token está correto no banco de dados
2. Confirme se o bot foi adicionado ao chat/grupo
3. Teste o endpoint `/telegram-status`
4. Verifique se o canal está ativo (`active: true`)

### Mensagens não chegam
1. Verifique o `chat_id` no banco de dados
2. Confirme se o bot tem permissão para enviar mensagens
3. Verifique os logs do servidor para erros
4. Teste com o endpoint de teste de canal

### Jobs não executam
1. Confirme se o usuário tem permissão de admin
2. Verifique se o jobId existe na base de dados
3. Monitore logs de execução de jobs
4. Verifique se o canal de notificação está ativo

### Canal não encontrado
1. Liste todos os canais para verificar IDs corretos
2. Confirme se o canal não foi deletado (`deleted_at IS NULL`)
3. Verifique se o tipo do canal é 'telegram'

## Arquitetura do Sistema

### Fluxo de Notificação
1. **Job Execution Service** → Busca configuração do job
2. **Notification Channel Service** → Busca canal pelo ID
3. **Telegram Service** → Inicializa com config do banco
4. **Bot API** → Envia mensagem formatada
5. **Resposta** → Retorna status e message_id

### Configuração Dinâmica
- ✅ Múltiplos canais Telegram por projeto
- ✅ Configuração via banco de dados
- ✅ Ativação/desativação dinâmica
- ✅ Teste individual de canais
- ✅ Logs detalhados de envio

### Próximos Passos

1. Criar um bot via @BotFather
2. Obter Chat ID do grupo/chat
3. Criar canal de notificação via API
4. Testar os endpoints de notificação
5. Executar jobs de teste
6. Configurar monitoramento contínuo
