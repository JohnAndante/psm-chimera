import * as z from "zod";
import { AUTH_VALIDATION } from "@/constants/auth";

/**
 * Schema de validação para o formulário de login
 * Usa as constantes AUTH_VALIDATION para mensagens consistentes
 */
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, AUTH_VALIDATION.EMAIL.REQUIRED)
        .email(AUTH_VALIDATION.EMAIL.INVALID)
        .max(AUTH_VALIDATION.EMAIL.MAX_LENGTH, `Email deve ter no máximo ${AUTH_VALIDATION.EMAIL.MAX_LENGTH} caracteres`),
    password: z
        .string()
        .min(1, AUTH_VALIDATION.PASSWORD.REQUIRED)
        .min(AUTH_VALIDATION.PASSWORD.MIN_LENGTH, AUTH_VALIDATION.PASSWORD.MIN_LENGTH_MESSAGE)
        .max(AUTH_VALIDATION.PASSWORD.MAX_LENGTH, `Senha deve ter no máximo ${AUTH_VALIDATION.PASSWORD.MAX_LENGTH} caracteres`),
    remember: z.boolean(),
});
