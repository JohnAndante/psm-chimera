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
const getAllJobsQuerySchema = Joi.object({
    active: Joi.string().valid('true', 'false').optional().messages({
        'any.only': 'active deve ser "true" ou "false"'
    }),
    job_type: Joi.string().valid('SYNC_PRODUCTS', 'COMPARE_DATA', 'CLEANUP_LOGS', 'CUSTOM').optional().messages({
        'any.only': 'job_type deve ser um dos valores: SYNC_PRODUCTS, COMPARE_DATA, CLEANUP_LOGS, CUSTOM'
    }),
    integration_id: Joi.number().integer().positive().optional().messages({
        'number.base': 'integration_id deve ser um número',
        'number.integer': 'integration_id deve ser um número inteiro',
        'number.positive': 'integration_id deve ser um número positivo'
    }),
    search: Joi.string().min(1).max(255).optional().messages({
        'string.min': 'Busca deve ter pelo menos 1 caractere',
        'string.max': 'Busca deve ter no máximo 255 caracteres'
    })
});

// Schema para criação de job configuration
const createJobConfigBodySchema = Joi.object({
    name: Joi.string().min(1).max(255).required().messages({
        'string.empty': 'Nome é obrigatório',
        'string.min': 'Nome deve ter pelo menos 1 caractere',
        'string.max': 'Nome deve ter no máximo 255 caracteres',
        'any.required': 'Nome é obrigatório'
    }),
    description: Joi.string().max(500).optional().allow('', null).messages({
        'string.max': 'Descrição deve ter no máximo 500 caracteres'
    }),
    cron_pattern: Joi.string().min(1).max(100).required().messages({
        'string.empty': 'Padrão cron é obrigatório',
        'string.min': 'Padrão cron deve ter pelo menos 1 caractere',
        'string.max': 'Padrão cron deve ter no máximo 100 caracteres',
        'any.required': 'Padrão cron é obrigatório'
    }),
    job_type: Joi.string().valid('SYNC_PRODUCTS', 'COMPARE_DATA', 'CLEANUP_LOGS', 'CUSTOM').required().messages({
        'any.only': 'Tipo do job deve ser um dos valores: SYNC_PRODUCTS, COMPARE_DATA, CLEANUP_LOGS, CUSTOM',
        'any.required': 'Tipo do job é obrigatório'
    }),
    config: Joi.object().optional().default({}).messages({
        'object.base': 'Configuração deve ser um objeto'
    }),
    active: Joi.boolean().optional().default(true).messages({
        'boolean.base': 'Status ativo deve ser verdadeiro ou falso'
    }),
    integration_id: Joi.number().integer().positive().optional().allow(null).messages({
        'number.base': 'ID da integração deve ser um número',
        'number.integer': 'ID da integração deve ser um número inteiro',
        'number.positive': 'ID da integração deve ser um número positivo'
    })
});

// Schema para atualização de job configuration
const updateJobConfigBodySchema = Joi.object({
    name: Joi.string().min(1).max(255).optional().messages({
        'string.empty': 'Nome não pode estar vazio',
        'string.min': 'Nome deve ter pelo menos 1 caractere',
        'string.max': 'Nome deve ter no máximo 255 caracteres'
    }),
    description: Joi.string().max(500).optional().allow('', null).messages({
        'string.max': 'Descrição deve ter no máximo 500 caracteres'
    }),
    cron_pattern: Joi.string().min(1).max(100).optional().messages({
        'string.empty': 'Padrão cron não pode estar vazio',
        'string.min': 'Padrão cron deve ter pelo menos 1 caractere',
        'string.max': 'Padrão cron deve ter no máximo 100 caracteres'
    }),
    job_type: Joi.string().valid('SYNC_PRODUCTS', 'COMPARE_DATA', 'CLEANUP_LOGS', 'CUSTOM').optional().messages({
        'any.only': 'Tipo do job deve ser um dos valores: SYNC_PRODUCTS, COMPARE_DATA, CLEANUP_LOGS, CUSTOM'
    }),
    config: Joi.object().optional().messages({
        'object.base': 'Configuração deve ser um objeto'
    }),
    active: Joi.boolean().optional().messages({
        'boolean.base': 'Status ativo deve ser verdadeiro ou falso'
    }),
    integration_id: Joi.number().integer().positive().optional().allow(null).messages({
        'number.base': 'ID da integração deve ser um número',
        'number.integer': 'ID da integração deve ser um número inteiro',
        'number.positive': 'ID da integração deve ser um número positivo'
    })
}).min(1).messages({
    'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});

// Middlewares de validação exportados
export const JobConfigValidator = {
    // GET /api/v1/jobs/configurations
    getAll: validateRequest({
        query: getAllJobsQuerySchema
    }),

    // GET /api/v1/jobs/configurations/:id
    getById: validateRequest({
        params: idParamSchema
    }),

    // POST /api/v1/jobs/configurations
    create: validateRequest({
        body: createJobConfigBodySchema
    }),

    // PUT /api/v1/jobs/configurations/:id
    update: validateRequest({
        params: idParamSchema,
        body: updateJobConfigBodySchema
    }),

    // DELETE /api/v1/jobs/configurations/:id
    delete: validateRequest({
        params: idParamSchema
    }),

    // POST /api/v1/jobs/configurations/:id/execute
    execute: validateRequest({
        params: idParamSchema
    })
};
