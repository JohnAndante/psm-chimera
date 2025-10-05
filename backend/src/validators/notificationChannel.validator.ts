import Joi from 'joi';
import { validate, ValidationSchemas } from '../middlewares/validation.middleware';

// Função helper para manter compatibilidade
function validateRequest(schemas: ValidationSchemas) {
    return validate(schemas);
}

// Schema para ID de parâmetro
const idParamSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': 'ID deve ser um número',
        'number.integer': 'ID deve ser um número inteiro',
        'number.positive': 'ID deve ser um número positivo',
        'any.required': 'ID é obrigatório'
    })
});

// Schema para query parameters do getAll
const getAllNotificationChannelsQuerySchema = Joi.object({
    filter: Joi.object({
        name: Joi.string().optional().messages({
            'string.base': 'name deve ser uma string'
        }),
        type: Joi.string().valid('TELEGRAM', 'EMAIL', 'WEBHOOK').optional().messages({
            'string.base': 'type deve ser uma string',
            'any.only': 'type deve ser um dos valores: TELEGRAM, EMAIL, WEBHOOK'
        }),
        active: Joi.boolean().optional().messages({
            'boolean.base': 'active deve ser verdadeiro ou falso'
        })
    }).optional().messages({
        'object.base': 'filter deve ser um objeto'
    }),
    page: Joi.number().integer().min(1).optional().messages({
        'number.base': 'page deve ser um número',
        'number.integer': 'page deve ser um número inteiro',
        'number.min': 'page deve ser pelo menos 1'
    }),
    limit: Joi.number().integer().min(1).max(100).optional().messages({
        'number.base': 'limit deve ser um número',
        'number.integer': 'limit deve ser um número inteiro',
        'number.min': 'limit deve ser pelo menos 1',
        'number.max': 'limit deve ser no máximo 100'
    })
}).unknown(true);

// Schemas para configurações específicas por tipo
const telegramAllowedUserSchema = Joi.object({
    name: Joi.string().min(1).max(100).required().messages({
        'string.base': 'Nome do usuário deve ser uma string',
        'string.min': 'Nome do usuário deve ter pelo menos 1 caractere',
        'string.max': 'Nome do usuário deve ter no máximo 100 caracteres',
        'any.required': 'Nome do usuário é obrigatório'
    }),
    chat_id: Joi.number().integer().required().messages({
        'number.base': 'chat_id do usuário deve ser um número',
        'number.integer': 'chat_id do usuário deve ser um número inteiro',
        'any.required': 'chat_id do usuário é obrigatório'
    })
});

const telegramConfigSchema = Joi.object({
    bot_token: Joi.string().required().messages({
        'string.base': 'bot_token deve ser uma string',
        'any.required': 'bot_token é obrigatório para canais Telegram'
    }),
    chat_id: Joi.string().required().messages({
        'string.base': 'chat_id deve ser uma string',
        'any.required': 'chat_id é obrigatório para canais Telegram'
    }),
    allowed_users: Joi.array().items(telegramAllowedUserSchema).optional().messages({
        'array.base': 'allowed_users deve ser um array',
        'array.items': 'Cada usuário permitido deve ter name e chat_id válidos'
    }),
    enable_interactive: Joi.boolean().optional().messages({
        'boolean.base': 'enable_interactive deve ser verdadeiro ou falso'
    }),
    webhook_url: Joi.string().uri().optional().messages({
        'string.base': 'webhook_url deve ser uma string',
        'string.uri': 'webhook_url deve ser uma URL válida'
    })
});

const telegramConfigUpdateSchema = Joi.object({
    bot_token: Joi.string().optional().messages({
        'string.base': 'bot_token deve ser uma string'
    }),
    chat_id: Joi.string().optional().messages({
        'string.base': 'chat_id deve ser uma string'
    }),
    allowed_users: Joi.array().items(telegramAllowedUserSchema).optional().messages({
        'array.base': 'allowed_users deve ser um array',
        'array.items': 'Cada usuário permitido deve ter name e chat_id válidos'
    }),
    enable_interactive: Joi.boolean().optional().messages({
        'boolean.base': 'enable_interactive deve ser verdadeiro ou falso'
    }),
    webhook_url: Joi.string().uri().optional().messages({
        'string.base': 'webhook_url deve ser uma string',
        'string.uri': 'webhook_url deve ser uma URL válida'
    })
});

const emailConfigSchema = Joi.object({
    smtp_host: Joi.string().required().messages({
        'string.base': 'smtp_host deve ser uma string',
        'any.required': 'smtp_host é obrigatório para canais Email'
    }),
    smtp_port: Joi.number().integer().min(1).max(65535).optional().default(587).messages({
        'number.base': 'smtp_port deve ser um número',
        'number.integer': 'smtp_port deve ser um número inteiro',
        'number.min': 'smtp_port deve ser maior que 0',
        'number.max': 'smtp_port deve ser menor que 65536'
    }),
    smtp_user: Joi.string().required().messages({
        'string.base': 'smtp_user deve ser uma string',
        'any.required': 'smtp_user é obrigatório para canais Email'
    }),
    smtp_password: Joi.string().required().messages({
        'string.base': 'smtp_password deve ser uma string',
        'any.required': 'smtp_password é obrigatório para canais Email'
    }),
    from_email: Joi.string().email().required().messages({
        'string.base': 'from_email deve ser uma string',
        'string.email': 'from_email deve ser um email válido',
        'any.required': 'from_email é obrigatório para canais Email'
    }),
    from_name: Joi.string().max(255).optional().messages({
        'string.base': 'from_name deve ser uma string',
        'string.max': 'from_name deve ter no máximo 255 caracteres'
    }),
    use_tls: Joi.boolean().optional().default(true).messages({
        'boolean.base': 'use_tls deve ser verdadeiro ou falso'
    })
});

const emailConfigUpdateSchema = Joi.object({
    smtp_host: Joi.string().optional().messages({
        'string.base': 'smtp_host deve ser uma string'
    }),
    smtp_port: Joi.number().integer().min(1).max(65535).optional().messages({
        'number.base': 'smtp_port deve ser um número',
        'number.integer': 'smtp_port deve ser um número inteiro',
        'number.min': 'smtp_port deve ser maior que 0',
        'number.max': 'smtp_port deve ser menor que 65536'
    }),
    smtp_user: Joi.string().optional().messages({
        'string.base': 'smtp_user deve ser uma string'
    }),
    smtp_password: Joi.string().optional().messages({
        'string.base': 'smtp_password deve ser uma string'
    }),
    from_email: Joi.string().email().optional().messages({
        'string.base': 'from_email deve ser uma string',
        'string.email': 'from_email deve ser um email válido'
    }),
    from_name: Joi.string().max(255).optional().messages({
        'string.base': 'from_name deve ser uma string',
        'string.max': 'from_name deve ter no máximo 255 caracteres'
    }),
    use_tls: Joi.boolean().optional().messages({
        'boolean.base': 'use_tls deve ser verdadeiro ou falso'
    })
});

const webhookConfigSchema = Joi.object({
    webhook_url: Joi.string().uri().required().messages({
        'string.base': 'webhook_url deve ser uma string',
        'string.uri': 'webhook_url deve ser uma URL válida',
        'any.required': 'webhook_url é obrigatório para canais Webhook'
    }),
    method: Joi.string().valid('POST', 'PUT', 'PATCH').optional().default('POST').messages({
        'string.base': 'method deve ser uma string',
        'any.only': 'method deve ser POST, PUT ou PATCH'
    }),
    headers: Joi.object().pattern(Joi.string(), Joi.string()).optional().messages({
        'object.base': 'headers deve ser um objeto',
        'object.pattern.match': 'headers deve conter apenas strings como chaves e valores'
    }),
    timeout: Joi.number().integer().min(1000).max(60000).optional().default(30000).messages({
        'number.base': 'timeout deve ser um número',
        'number.integer': 'timeout deve ser um número inteiro',
        'number.min': 'timeout deve ser pelo menos 1000ms (1 segundo)',
        'number.max': 'timeout deve ser no máximo 60000ms (60 segundos)'
    })
});

const webhookConfigUpdateSchema = Joi.object({
    webhook_url: Joi.string().uri().optional().messages({
        'string.base': 'webhook_url deve ser uma string',
        'string.uri': 'webhook_url deve ser uma URL válida'
    }),
    method: Joi.string().valid('POST', 'PUT', 'PATCH').optional().messages({
        'string.base': 'method deve ser uma string',
        'any.only': 'method deve ser POST, PUT ou PATCH'
    }),
    headers: Joi.object().pattern(Joi.string(), Joi.string()).optional().messages({
        'object.base': 'headers deve ser um objeto',
        'object.pattern.match': 'headers deve conter apenas strings como chaves e valores'
    }),
    timeout: Joi.number().integer().min(1000).max(60000).optional().messages({
        'number.base': 'timeout deve ser um número',
        'number.integer': 'timeout deve ser um número inteiro',
        'number.min': 'timeout deve ser pelo menos 1000ms (1 segundo)',
        'number.max': 'timeout deve ser no máximo 60000ms (60 segundos)'
    })
});

// Schema dinâmico para configuração baseado no tipo
const configSchema = Joi.when('type', {
    switch: [
        { is: 'TELEGRAM', then: telegramConfigSchema },
        { is: 'EMAIL', then: emailConfigSchema },
        { is: 'WEBHOOK', then: webhookConfigSchema }
    ],
    otherwise: Joi.object().required().messages({
        'any.required': 'config é obrigatório'
    })
});

// Schema para criação de canal de notificação
const createNotificationChannelBodySchema = Joi.object({
    name: Joi.string().min(1).max(255).required().messages({
        'string.base': 'name deve ser uma string',
        'string.min': 'name deve ter pelo menos 1 caractere',
        'string.max': 'name deve ter no máximo 255 caracteres',
        'any.required': 'name é obrigatório'
    }),
    type: Joi.string().valid('TELEGRAM', 'EMAIL', 'WEBHOOK').required().messages({
        'string.base': 'type deve ser uma string',
        'any.only': 'type deve ser um dos valores: TELEGRAM, EMAIL, WEBHOOK',
        'any.required': 'type é obrigatório'
    }),
    config: configSchema,
    active: Joi.boolean().optional().default(true).messages({
        'boolean.base': 'active deve ser verdadeiro ou falso'
    })
});

// Schema para atualização de canal de notificação
const updateNotificationChannelBodySchema = Joi.object({
    name: Joi.string().min(1).max(255).optional().messages({
        'string.base': 'name deve ser uma string',
        'string.min': 'name deve ter pelo menos 1 caractere',
        'string.max': 'name deve ter no máximo 255 caracteres'
    }),
    type: Joi.string().valid('TELEGRAM', 'EMAIL', 'WEBHOOK').optional().messages({
        'string.base': 'type deve ser uma string',
        'any.only': 'type deve ser um dos valores: TELEGRAM, EMAIL, WEBHOOK'
    }),
    config: Joi.when('type', {
        switch: [
            { is: 'TELEGRAM', then: telegramConfigUpdateSchema },
            { is: 'EMAIL', then: emailConfigUpdateSchema },
            { is: 'WEBHOOK', then: webhookConfigUpdateSchema }
        ],
        otherwise: Joi.object().optional()
    }),
    active: Joi.boolean().optional().messages({
        'boolean.base': 'active deve ser verdadeiro ou falso'
    })
}).min(1).messages({
    'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});

// Schema para teste de notificação
const testNotificationBodySchema = Joi.object({
    message: Joi.string().min(1).max(1000).optional().default('Teste de notificação do PSM Chimera').messages({
        'string.base': 'message deve ser uma string',
        'string.min': 'message deve ter pelo menos 1 caractere',
        'string.max': 'message deve ter no máximo 1000 caracteres'
    }),
    chat_id: Joi.string().optional().messages({
        'string.base': 'chat_id deve ser uma string'
    })
});

export const NotificationValidator = {
    // GET /api/v1/notifications/channels
    getAll: validateRequest({
        query: getAllNotificationChannelsQuerySchema
    }),

    // GET /api/v1/notifications/channels/:id
    getById: validateRequest({
        params: idParamSchema
    }),

    // POST /api/v1/notifications/channels
    create: validateRequest({
        body: createNotificationChannelBodySchema
    }),

    // PUT /api/v1/notifications/channels/:id
    update: validateRequest({
        params: idParamSchema,
        body: updateNotificationChannelBodySchema
    }),

    // DELETE /api/v1/notifications/channels/:id
    delete: validateRequest({
        params: idParamSchema
    }),

    // POST /api/v1/notifications/channels/:id/test
    test: validateRequest({
        params: idParamSchema,
        body: testNotificationBodySchema
    })
};
