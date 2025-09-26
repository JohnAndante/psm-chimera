import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export interface ValidationSchemas {
    params?: Joi.ObjectSchema;
    query?: Joi.ObjectSchema;
    body?: Joi.ObjectSchema;
}

export function validate(schemas: ValidationSchemas) {
    return (req: Request, res: Response, next: NextFunction) => {
        const errors: string[] = [];

        // Validar parâmetros da URL
        if (schemas.params) {
            const { error } = schemas.params.validate(req.params);
            if (error) {
                errors.push(`Parâmetros inválidos: ${error.details.map(d => d.message).join(', ')}`);
            }
        }

        // Validar query parameters
        if (schemas.query) {
            const { error } = schemas.query.validate(req.query);
            if (error) {
                errors.push(`Query inválida: ${error.details.map(d => d.message).join(', ')}`);
            }
        }

        // Validar body
        if (schemas.body) {
            const { error } = schemas.body.validate(req.body);
            if (error) {
                errors.push(`Dados inválidos: ${error.details.map(d => d.message).join(', ')}`);
            }
        }

        // Se houver erros, retorna erro 400
        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Dados de entrada inválidos',
                details: errors
            });
        }

        next();
    };
}
