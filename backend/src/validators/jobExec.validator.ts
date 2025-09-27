import Joi from 'joi';
import { validate, ValidationSchemas } from '../middlewares/validation.middleware';

// Função helper para manter compatibilidade
function validateRequest(schemas: ValidationSchemas) {
    return validate(schemas);
}

// Schema para ID de parâmetro
const idParamSchema = Joi.object({
    id: Joi.string().required().messages({
        'string.empty': 'ID é obrigatório',
        'any.required': 'ID é obrigatório'
    })
});

// Schema para query parameters do getExecutions
const getExecutionsQuerySchema = Joi.object({
    job_config_id: Joi.number().integer().positive().optional().messages({
        'number.base': 'ID da configuração do job deve ser um número',
        'number.integer': 'ID da configuração do job deve ser um número inteiro',
        'number.positive': 'ID da configuração do job deve ser um número positivo'
    }),
    status: Joi.string().valid('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED').optional().messages({
        'any.only': 'Status deve ser um dos valores: PENDING, RUNNING, SUCCESS, FAILED, CANCELLED'
    }),
    limit: Joi.number().integer().min(1).max(100).default(50).optional().messages({
        'number.base': 'Limite deve ser um número',
        'number.integer': 'Limite deve ser um número inteiro',
        'number.min': 'Limite deve ser pelo menos 1',
        'number.max': 'Limite deve ser no máximo 100'
    }),
    date_from: Joi.date().iso().optional().messages({
        'date.base': 'Data inicial deve ser uma data válida',
        'date.format': 'Data inicial deve estar no formato ISO (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss.sssZ)'
    }),
    date_to: Joi.date().iso().optional().messages({
        'date.base': 'Data final deve ser uma data válida',
        'date.format': 'Data final deve estar no formato ISO (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss.sssZ)'
    })
});

// Middlewares de validação exportados
export const JobExecutionValidator = {
    // GET /api/v1/jobs/executions
    getAll: validateRequest({
        query: getExecutionsQuerySchema
    }),

    // GET /api/v1/jobs/executions/:id
    getById: validateRequest({
        params: idParamSchema
    }),

    // GET /api/v1/jobs/executions/:id/logs
    getLogs: validateRequest({
        params: idParamSchema
    })
};
