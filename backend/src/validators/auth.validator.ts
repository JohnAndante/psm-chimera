import Joi from 'joi';
import { validate } from '../middlewares/validation.middleware';

const loginBodySchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email deve ter um formato válido',
        'string.empty': 'Email é obrigatório',
        'any.required': 'Email é obrigatório'
    }),
    password: Joi.string().min(6).max(255).required().messages({
        'string.min': 'Senha deve ter pelo menos 6 caracteres',
        'string.max': 'Senha deve ter no máximo 255 caracteres',
        'string.empty': 'Senha é obrigatória',
        'any.required': 'Senha é obrigatória'
    })
});

// Middlewares de validação exportados
export const AuthValidator = {
    // POST /api/v1/auth/login
    login: validate({
        body: loginBodySchema
    }),
};
