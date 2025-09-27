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
const getAllUsersQuerySchema = Joi.object({
    role: Joi.string().valid('ADMIN', 'USER').optional().messages({
        'any.only': 'role deve ser ADMIN ou USER'
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

// Schema para criação de usuário
const createUserBodySchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.base': 'email deve ser uma string',
        'string.email': 'email deve ser um endereço de email válido',
        'any.required': 'email é obrigatório'
    }),
    name: Joi.string().min(1).max(255).optional().messages({
        'string.base': 'name deve ser uma string',
        'string.min': 'name deve ter pelo menos 1 caractere',
        'string.max': 'name deve ter no máximo 255 caracteres'
    }),
    role: Joi.string().valid('ADMIN', 'USER').optional().default('USER').messages({
        'string.base': 'role deve ser uma string',
        'any.only': 'role deve ser ADMIN ou USER'
    }),
    password: Joi.string().min(6).max(100).required().messages({
        'string.base': 'password deve ser uma string',
        'string.min': 'password deve ter pelo menos 6 caracteres',
        'string.max': 'password deve ter no máximo 100 caracteres',
        'any.required': 'password é obrigatório'
    }),
    active: Joi.boolean().optional().default(true).messages({
        'boolean.base': 'active deve ser verdadeiro ou falso'
    })
});

// Schema para atualização de usuário
const updateUserBodySchema = Joi.object({
    email: Joi.string().email().optional().messages({
        'string.base': 'email deve ser uma string',
        'string.email': 'email deve ser um endereço de email válido'
    }),
    name: Joi.string().min(1).max(255).optional().messages({
        'string.base': 'name deve ser uma string',
        'string.min': 'name deve ter pelo menos 1 caractere',
        'string.max': 'name deve ter no máximo 255 caracteres'
    }),
    role: Joi.string().valid('ADMIN', 'USER').optional().messages({
        'string.base': 'role deve ser uma string',
        'any.only': 'role deve ser ADMIN ou USER'
    }),
    password: Joi.string().min(6).max(100).optional().messages({
        'string.base': 'password deve ser uma string',
        'string.min': 'password deve ter pelo menos 6 caracteres',
        'string.max': 'password deve ter no máximo 100 caracteres'
    }),
    active: Joi.boolean().optional().messages({
        'boolean.base': 'active deve ser verdadeiro ou falso'
    })
}).min(1).messages({
    'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});

// Schema para mudança de senha
const changePasswordBodySchema = Joi.object({
    password: Joi.string().min(6).max(100).required().messages({
        'string.base': 'newPassword deve ser uma string',
        'string.min': 'newPassword deve ter pelo menos 6 caracteres',
        'string.max': 'newPassword deve ter no máximo 100 caracteres',
        'any.required': 'newPassword é obrigatório'
    })
});

export const UserValidator = {
    // GET /api/v1/users
    getAll: validateRequest({
        query: getAllUsersQuerySchema
    }),

    // GET /api/v1/users/:id
    getById: validateRequest({
        params: idParamSchema
    }),

    // POST /api/v1/users
    create: validateRequest({
        body: createUserBodySchema
    }),

    // PUT /api/v1/users/:id
    update: validateRequest({
        params: idParamSchema,
        body: updateUserBodySchema
    }),

    // DELETE /api/v1/users/:id
    delete: validateRequest({
        params: idParamSchema
    }),

    // PUT /api/v1/users/:id/change-password
    changePassword: validateRequest({
        params: idParamSchema,
        body: changePasswordBodySchema
    })
};
