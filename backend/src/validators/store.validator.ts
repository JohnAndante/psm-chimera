import Joi from 'joi';
import { validate } from '../middlewares/validation.middleware';

const idParamSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': 'ID deve ser um número',
        'number.integer': 'ID deve ser um número inteiro',
        'number.positive': 'ID deve ser um número positivo',
        'any.required': 'ID é obrigatório'
    })
});

const getAllQuerySchema = Joi.object({
    filter: Joi.object({
        name: Joi.string().min(1).max(255).optional().messages({
            'string.base': 'Nome deve ser uma string',
            'string.min': 'Nome deve ter pelo menos 1 caractere',
            'string.max': 'Nome deve ter no máximo 255 caracteres'
        }),
        registration: Joi.string().min(1).max(50).optional().messages({
            'string.base': 'Registro deve ser uma string',
            'string.min': 'Registro deve ter pelo menos 1 caractere',
            'string.max': 'Registro deve ter no máximo 50 caracteres'
        }),
        active: Joi.boolean().optional().messages({
            'boolean.base': 'Status ativo deve ser verdadeiro ou falso'
        })
    }).optional().messages({
        'object.base': 'filter deve ser um objeto'
    }),
    page: Joi.number().integer().min(1).default(1).optional().messages({
        'number.base': 'Página deve ser um número',
        'number.integer': 'Página deve ser um número inteiro',
        'number.min': 'Página deve ser pelo menos 1'
    }),
    limit: Joi.number().integer().min(1).max(100).default(50).optional().messages({
        'number.base': 'Limite deve ser um número',
        'number.integer': 'Limite deve ser um número inteiro',
        'number.min': 'Limite deve ser pelo menos 1',
        'number.max': 'Limite deve ser no máximo 100'
    }),
}).unknown(true); // Permite parâmetros de ordenação como order[field]

const getProductsQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1).optional().messages({
        'number.base': 'Página deve ser um número',
        'number.integer': 'Página deve ser um número inteiro',
        'number.min': 'Página deve ser pelo menos 1'
    }),
    limit: Joi.number().integer().min(1).max(100).default(50).optional().messages({
        'number.base': 'Limite deve ser um número',
        'number.integer': 'Limite deve ser um número inteiro',
        'number.min': 'Limite deve ser pelo menos 1',
        'number.max': 'Limite deve ser no máximo 100'
    }),
    search: Joi.string().min(1).max(50).optional().messages({
        'string.min': 'Busca deve ter pelo menos 1 caractere',
        'string.max': 'Busca deve ter no máximo 50 caracteres'
    })
});

const createStoreBodySchema = Joi.object({
    name: Joi.string().min(1).max(255).required().messages({
        'string.empty': 'Nome é obrigatório',
        'string.min': 'Nome deve ter pelo menos 1 caractere',
        'string.max': 'Nome deve ter no máximo 255 caracteres',
        'any.required': 'Nome é obrigatório'
    }),
    registration: Joi.string().min(1).max(50).required().messages({
        'string.empty': 'Código de registro é obrigatório',
        'string.min': 'Código de registro deve ter pelo menos 1 caractere',
        'string.max': 'Código de registro deve ter no máximo 50 caracteres',
        'any.required': 'Código de registro é obrigatório'
    }),
    document: Joi.string().max(20).optional().allow('').messages({
        'string.max': 'Documento deve ter no máximo 20 caracteres'
    }),
    active: Joi.boolean().optional().default(true).messages({
        'boolean.base': 'Status ativo deve ser verdadeiro ou falso'
    })
});

const updateStoreBodySchema = Joi.object({
    name: Joi.string().min(1).max(255).optional().messages({
        'string.empty': 'Nome não pode estar vazio',
        'string.min': 'Nome deve ter pelo menos 1 caractere',
        'string.max': 'Nome deve ter no máximo 255 caracteres'
    }),
    registration: Joi.string().min(1).max(50).optional().messages({
        'string.empty': 'Código de registro não pode estar vazio',
        'string.min': 'Código de registro deve ter pelo menos 1 caractere',
        'string.max': 'Código de registro deve ter no máximo 50 caracteres'
    }),
    document: Joi.string().max(20).optional().allow('').messages({
        'string.max': 'Documento deve ter no máximo 20 caracteres'
    }),
    active: Joi.boolean().optional().messages({
        'boolean.base': 'Status ativo deve ser verdadeiro ou falso'
    })
}).min(1).messages({
    'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});

export const StoreValidator = {
    // GET /api/v1/stores
    getAll: validate({
        query: getAllQuerySchema
    }),

    // GET /api/v1/stores/:id
    getById: validate({
        params: idParamSchema
    }),

    // GET /api/v1/stores/:id/products
    getProducts: validate({
        params: idParamSchema,
        query: getProductsQuerySchema
    }),

    // POST /api/v1/stores
    create: validate({
        body: createStoreBodySchema
    }),

    // PUT /api/v1/stores/:id
    update: validate({
        params: idParamSchema,
        body: updateStoreBodySchema
    }),

    // DELETE /api/v1/stores/:id
    delete: validate({
        params: idParamSchema
    }),

    // POST /api/v1/stores/:id/sync
    syncProducts: validate({
        params: idParamSchema
    })
};
