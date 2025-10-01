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

// Schema básico para integração
const baseIntegrationSchema = {
    name: Joi.string().min(1).max(255).required().messages({
        'string.base': 'Nome deve ser uma string',
        'string.min': 'Nome deve ter pelo menos 1 caractere',
        'string.max': 'Nome deve ter no máximo 255 caracteres',
        'any.required': 'Nome é obrigatório'
    }),
    type: Joi.string().valid('RP', 'CRESCEVENDAS').required().messages({
        'any.only': 'Tipo deve ser RP ou CRESCEVENDAS',
        'any.required': 'Tipo é obrigatório'
    }),
    active: Joi.boolean().optional().default(true).messages({
        'boolean.base': 'Active deve ser um valor booleano'
    })
};

// Schema para configuração RP
const rpConfigSchema = Joi.object({
    auth_method: Joi.string().valid('TOKEN', 'LOGIN').required().messages({
        'any.only': 'Método de autenticação deve ser TOKEN ou LOGIN',
        'any.required': 'Método de autenticação é obrigatório'
    }),
    static_token: Joi.string().when('auth_method', {
        is: 'TOKEN',
        then: Joi.required().messages({
            'any.required': 'Token estático é obrigatório para autenticação TOKEN'
        }),
        otherwise: Joi.optional()
    }),
    token_header: Joi.string().when('auth_method', {
        is: 'TOKEN',
        then: Joi.required().messages({
            'any.required': 'Header do token é obrigatório para autenticação TOKEN'
        }),
        otherwise: Joi.optional()
    }),
    base_url: Joi.string().uri().optional(),
    login_endpoint: Joi.string().when('auth_method', {
        is: 'LOGIN',
        then: Joi.required().messages({
            'any.required': 'Endpoint de login é obrigatório para autenticação LOGIN'
        }),
        otherwise: Joi.optional()
    }),
    username: Joi.string().when('auth_method', {
        is: 'LOGIN',
        then: Joi.required().messages({
            'any.required': 'Username é obrigatório para autenticação LOGIN'
        }),
        otherwise: Joi.optional()
    }),
    password: Joi.string().when('auth_method', {
        is: 'LOGIN',
        then: Joi.required().messages({
            'any.required': 'Password é obrigatório para autenticação LOGIN'
        }),
        otherwise: Joi.optional()
    }),
    token_response_field: Joi.string().when('auth_method', {
        is: 'LOGIN',
        then: Joi.required().messages({
            'any.required': 'Campo de resposta do token é obrigatório para autenticação LOGIN'
        }),
        otherwise: Joi.optional()
    }),
    products_endpoint: Joi.string().required().messages({
        'any.required': 'Endpoint de produtos é obrigatório',
        'string.base': 'Endpoint de produtos deve ser uma string'
    }),
    pagination: Joi.object({
        method: Joi.string().valid('OFFSET', 'CURSOR').required().messages({
            'any.only': 'Método de paginação deve ser OFFSET ou CURSOR',
            'any.required': 'Método de paginação é obrigatório'
        }),
        param_name: Joi.string().required().messages({
            'any.required': 'Nome do parâmetro de paginação é obrigatório',
            'string.base': 'Nome do parâmetro deve ser uma string'
        }),
        additional_params: Joi.object().pattern(Joi.string(), Joi.string()).optional()
    }).optional()
});

// Schema para configuração CresceVendas
const cresceVendasConfigSchema = Joi.object({
    base_url: Joi.string().uri().required().messages({
        'string.uri': 'Base URL deve ser uma URL válida',
        'any.required': 'Base URL é obrigatória'
    }),
    auth_headers: Joi.object().pattern(Joi.string(), Joi.string()).required().messages({
        'any.required': 'Headers de autenticação são obrigatórios',
        'object.base': 'Headers de autenticação devem ser um objeto'
    }),
    send_products_endpoint: Joi.string().optional(),
    get_products_endpoint: Joi.string().optional(),
    campaign_config: Joi.object({
        name_template: Joi.string().required(),
        start_time: Joi.string().pattern(/^[0-2][0-9]:[0-5][0-9]$/).required().messages({
            'string.pattern.base': 'Hora de início deve ter formato HH:MM'
        }),
        end_time: Joi.string().pattern(/^[0-2][0-9]:[0-5][0-9]$/).required().messages({
            'string.pattern.base': 'Hora de fim deve ter formato HH:MM'
        }),
        override_existing: Joi.boolean().required()
    }).optional()
});

// Schema dinâmico para config baseado no tipo (apenas RP e CresceVendas)
const configSchema = Joi.when('type', {
    switch: [
        { is: 'RP', then: rpConfigSchema },
        { is: 'CRESCEVENDAS', then: cresceVendasConfigSchema }
    ],
    otherwise: Joi.forbidden().messages({
        'any.unknown': 'Tipo de integração não suportado'
    })
});

// Schema para criação de integração
const createIntegrationBodySchema = Joi.object({
    ...baseIntegrationSchema,
    config: configSchema.optional()
});

// Schema para atualização de integração
const updateIntegrationBodySchema = Joi.object({
    name: baseIntegrationSchema.name.optional(),
    type: baseIntegrationSchema.type.optional(),
    active: baseIntegrationSchema.active,
    config: configSchema.optional()
});

// Schema para validação de configuração
const validateConfigBodySchema = Joi.object({
    type: Joi.string().valid('RP', 'CRESCEVENDAS').required().messages({
        'any.only': 'Tipo deve ser RP ou CRESCEVENDAS',
        'any.required': 'Tipo é obrigatório'
    }),
    config: Joi.object().required().messages({
        'any.required': 'Configuração é obrigatória',
        'object.base': 'Configuração deve ser um objeto'
    })
});

// Schema para query parameters do getAll (simplificado)
const getAllIntegrationsQuerySchema = Joi.object({
    type: Joi.string().valid('RP', 'CRESCEVENDAS').optional().messages({
        'any.only': 'Tipo deve ser RP ou CRESCEVENDAS'
    }),
    active: Joi.string().valid('true', 'false').optional().messages({
        'any.only': 'active deve ser "true" ou "false"'
    }),
    search: Joi.string().min(1).max(255).optional().messages({
        'string.base': 'search deve ser uma string',
        'string.min': 'search deve ter pelo menos 1 caractere',
        'string.max': 'search deve ter no máximo 255 caracteres'
    })
});

// Middleware validators
export const validateGetAllIntegrations = validateRequest({
    query: getAllIntegrationsQuerySchema
});

export const validateGetIntegrationById = validateRequest({
    params: idParamSchema
});

export const validateCreateIntegration = validateRequest({
    body: createIntegrationBodySchema
});

export const validateUpdateIntegration = validateRequest({
    params: idParamSchema,
    body: updateIntegrationBodySchema
});

export const validateDeleteIntegration = validateRequest({
    params: idParamSchema
});

export const validateTestConnection = validateRequest({
    params: idParamSchema
});

export const validateConfigValidation = validateRequest({
    body: validateConfigBodySchema
});
