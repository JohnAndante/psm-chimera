---
applyTo: '**'
description: 'API response format and error handling guidelines for PSM Chimera v2 backend.'
---

# 🚀 API Response Guidelines

## 📋 **Padrões Obrigatórios de Response**

### **✅ Success Responses**

#### **Lista/Busca (GET):**
```typescript
// 200 OK
res.status(200).json({
    message: 'Entidades recuperadas com sucesso',
    entities: data  // ou users, integrations, jobs, etc.
});

// Com total/paginação (futuro)
res.status(200).json({
    message: 'Entidades recuperadas com sucesso',
    entities: data,
    total: 150,
    page: 1,
    limit: 10
});
```

#### **Detalhe/Item Único (GET):**
```typescript
// 200 OK
res.status(200).json({
    message: 'Entidade recuperada com sucesso',
    entity: data  // singular: user, integration, job, etc.
});
```

#### **Criação (POST):**
```typescript
// 201 Created
res.status(201).json({
    message: 'Entidade criada com sucesso',
    entity: data
});
```

#### **Atualização (PUT):**
```typescript
// 200 OK
res.status(200).json({
    message: 'Entidade atualizada com sucesso',
    entity: data
});
```

#### **Remoção (DELETE):**
```typescript
// 200 OK
res.status(200).json({
    message: 'Entidade removida com sucesso'
});
// Não retorna data na remoção
```

#### **Ações Específicas:**
```typescript
// POST /integrations/:id/test
res.status(200).json({
    message: 'Conexão testada com sucesso',
    result: { status: 'connected', latency: '45ms' }
});

// POST /jobs/:id/execute
res.status(200).json({
    message: 'Job executado com sucesso',
    execution: executionData
});
```

### **❌ Error Responses**

#### **Validação (400 Bad Request):**
```typescript
res.status(400).json({
    error: 'Nome e tipo são obrigatórios'
});

// Múltiplos erros
res.status(400).json({
    error: 'Dados inválidos',
    details: [
        'Nome é obrigatório',
        'Email deve ter formato válido'
    ]
});
```

#### **Não Autorizado (401 Unauthorized):**
```typescript
res.status(401).json({
    error: 'Credenciais inválidas'
});

res.status(401).json({
    error: 'Token de acesso inválido ou expirado'
});

res.status(401).json({
    error: 'Usuário não autenticado'
});
```

#### **Sem Permissão (403 Forbidden):**
```typescript
res.status(403).json({
    error: 'Acesso negado. Apenas administradores podem realizar esta ação'
});
```

#### **Não Encontrado (404 Not Found):**
```typescript
res.status(404).json({
    error: 'Entidade não encontrada'
});

// Específico
res.status(404).json({
    error: 'Usuário não encontrado'
});
```

#### **Conflito (409 Conflict):**
```typescript
res.status(409).json({
    error: 'Já existe uma integração com este nome'
});

res.status(409).json({
    error: 'Email já está em uso'
});
```

#### **Erro Interno (500 Internal Server Error):**
```typescript
res.status(500).json({
    error: 'Erro interno do servidor'
});

// Com log para debug
console.error('Erro ao buscar entidades:', error);
res.status(500).json({
    error: 'Erro interno do servidor'
});
```

## 🚫 **NÃO FAZER:**

### **❌ Formato Incorreto:**
```typescript
// ERRADO - formato { success, data }
res.json({ success: true, data: results });

// ERRADO - mensagens em inglês
res.json({ message: 'Entity created successfully' });

// ERRADO - sem status code
res.json({ message: 'Sucesso' });
```

### **❌ Errors Inconsistentes:**
```typescript
// ERRADO - formato inconsistente
res.status(400).json({ message: 'Erro', error: true });

// ERRADO - exposição de detalhes internos
res.status(500).json({ error: error.stack });
```

## ✅ **FAZER:**

### **✅ Headers Padrão:**
```typescript
// Já configurado no Express, mas para referência:
// Content-Type: application/json
// Access-Control-Allow-Origin: configurado no CORS
```

### **✅ Mensagens em Português:**
- Todas as mensagens de erro e sucesso devem ser em português brasileiro
- Usar linguagem clara e amigável ao usuário
- Evitar termos técnicos desnecessários

### **✅ Logs de Erro:**
```typescript
// SEMPRE logar erros internos
console.error('Erro ao processar requisição:', error);
res.status(500).json({
    error: 'Erro interno do servidor'
});
```

### **✅ Validação Consistente:**
```typescript
// Validar dados obrigatórios primeiro
if (!name || !email) {
    return res.status(400).json({
        error: 'Nome e email são obrigatórios'
    });
}

// Validar formato
if (!email.includes('@')) {
    return res.status(400).json({
        error: 'Email deve ter formato válido'
    });
}
```

## 📊 **Status Codes de Referência:**

| **Código** | **Uso** | **Exemplo** |
|------------|---------|-------------|
| 200 | Sucesso geral | GET, PUT, DELETE bem-sucedidos |
| 201 | Criado | POST bem-sucedido |
| 400 | Dados inválidos | Validação falhou |
| 401 | Não autenticado | Login inválido, token expirado |
| 403 | Sem permissão | Usuário não é admin |
| 404 | Não encontrado | Recurso não existe |
| 409 | Conflito | Duplicação (email, nome, etc.) |
| 500 | Erro interno | Erro do servidor/banco |

## ⚠️ **Regras Críticas:**

1. **NUNCA** usar formato `{ success: boolean, data: any }`
2. **SEMPRE** usar `{ message: string, data?: any }` para sucesso
3. **SEMPRE** usar `{ error: string, details?: string[] }` para erro
4. **SEMPRE** mensagens em português
5. **SEMPRE** logar erros 500 com `console.error`
6. **SEMPRE** status codes apropriados
