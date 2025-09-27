import Joi from 'joi';
import { validate, ValidationSchemas } from '../middlewares/validation.middleware';

// Função helper para manter compatibilidade
function validateRequest(schemas: ValidationSchemas) {
    return validate(schemas);
}

// Schema para executar job
const executeJobBodySchema = Joi.object({
    job_config_id: Joi.number().integer().positive().required().messages({
        'number.base': 'job_config_id deve ser um número',
        'number.integer': 'job_config_id deve ser um número inteiro',
        'number.positive': 'job_config_id deve ser um número positivo',
        'any.required': 'job_config_id é obrigatório'
    }),
    store_id: Joi.number().integer().positive().optional().messages({
        'number.base': 'store_id deve ser um número',
        'number.integer': 'store_id deve ser um número inteiro',
        'number.positive': 'store_id deve ser um número positivo'
    }),
    notification_channel_id: Joi.number().integer().positive().optional().messages({
        'number.base': 'notification_channel_id deve ser um número',
        'number.integer': 'notification_channel_id deve ser um número inteiro',
        'number.positive': 'notification_channel_id deve ser um número positivo'
    }),
    manual_trigger: Joi.boolean().optional().default(true).messages({
        'boolean.base': 'manual_trigger deve ser verdadeiro ou falso'
    })
});

// Schema para testar notificação
const testNotificationBodySchema = Joi.object({
    notification_channel_id: Joi.number().integer().positive().required().messages({
        'number.base': 'notification_channel_id deve ser um número',
        'number.integer': 'notification_channel_id deve ser um número inteiro',
        'number.positive': 'notification_channel_id deve ser um número positivo',
        'any.required': 'notification_channel_id é obrigatório'
    }),
    message: Joi.string().min(1).max(1000).optional().default('Teste de notificação do PSM Chimera v2').messages({
        'string.base': 'message deve ser uma string',
        'string.min': 'message deve ter pelo menos 1 caractere',
        'string.max': 'message deve ter no máximo 1000 caracteres'
    })
});

// Schema para sincronizar loja
const syncStoreBodySchema = Joi.object({
    store_id: Joi.number().integer().positive().required().messages({
        'number.base': 'store_id deve ser um número',
        'number.integer': 'store_id deve ser um número inteiro',
        'number.positive': 'store_id deve ser um número positivo',
        'any.required': 'store_id é obrigatório'
    }),
    notification_channel_id: Joi.number().integer().positive().optional().messages({
        'number.base': 'notification_channel_id deve ser um número',
        'number.integer': 'notification_channel_id deve ser um número inteiro',
        'number.positive': 'notification_channel_id deve ser um número positivo'
    }),
    force_sync: Joi.boolean().optional().default(false).messages({
        'boolean.base': 'force_sync deve ser verdadeiro ou falso'
    })
});

// Schema para sincronização de produtos da loja (store/:id/sync)
const storeSyncBodySchema = Joi.object({
    notification_channel_id: Joi.number().integer().positive().optional().messages({
        'number.base': 'notification_channel_id deve ser um número',
        'number.integer': 'notification_channel_id deve ser um número inteiro',
        'number.positive': 'notification_channel_id deve ser um número positivo'
    }),
    force_sync: Joi.boolean().optional().default(false).messages({
        'boolean.base': 'force_sync deve ser verdadeiro ou falso'
    })
});

// Schema para query do teste de conexão Telegram
const telegramTestConnectionQuerySchema = Joi.object({
    notification_channel_id: Joi.number().integer().positive().required().messages({
        'number.base': 'notification_channel_id deve ser um número',
        'number.integer': 'notification_channel_id deve ser um número inteiro',
        'number.positive': 'notification_channel_id deve ser um número positivo',
        'any.required': 'notification_channel_id é obrigatório'
    })
});

export const JobTestValidator = {
    // POST /api/v1/jobs/execute
    executeJob: validateRequest({
        body: executeJobBodySchema
    }),

    // POST /api/v1/jobs/test-notification
    testNotification: validateRequest({
        body: testNotificationBodySchema
    }),

    // POST /api/v1/jobs/sync-store
    syncStore: validateRequest({
        body: syncStoreBodySchema
    }),

    // GET /api/v1/jobs/telegram/test-connection
    testTelegramConnection: validateRequest({
        query: telegramTestConnectionQuerySchema
    })
};

export const StoreSyncValidator = {
    // POST /api/v1/stores/:id/sync
    syncProducts: validateRequest({
        body: storeSyncBodySchema
    })
};
