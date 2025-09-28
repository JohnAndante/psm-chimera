import * as z from "zod"
import { ROUTINE_VALIDATION, ROUTINE_FORM_DEFAULTS } from "@/constants/routine"

// ===========================
// Validation Schemas
// ===========================

/**
 * Schema de validação para formulário de rotina
 * Baseado no CreateRoutineDto do backend
 * Usa as constantes ROUTINE_VALIDATION para mensagens consistentes
 */
export const routineSchema = z.object({
    agent_id: z
        .string()
        .min(1, "Agente é obrigatório"),

    name: z
        .string()
        .min(1, ROUTINE_VALIDATION.NAME.REQUIRED)
        .min(ROUTINE_VALIDATION.NAME.MIN_LENGTH, ROUTINE_VALIDATION.NAME.MIN_LENGTH_MESSAGE)
        .max(ROUTINE_VALIDATION.NAME.MAX_LENGTH, ROUTINE_VALIDATION.NAME.MAX_LENGTH_MESSAGE),

    description: z
        .string()
        .transform(val => val || "")
        .pipe(z.string().min(1, ROUTINE_VALIDATION.DESCRIPTION.REQUIRED)
            .min(ROUTINE_VALIDATION.DESCRIPTION.MIN_LENGTH, ROUTINE_VALIDATION.DESCRIPTION.MIN_LENGTH_MESSAGE)
            .max(ROUTINE_VALIDATION.DESCRIPTION.MAX_LENGTH, ROUTINE_VALIDATION.DESCRIPTION.MAX_LENGTH_MESSAGE)),

    context: z
        .string()
        .transform(val => val || "")
        .pipe(z.string().min(1, ROUTINE_VALIDATION.CONTEXT.REQUIRED)
            .min(ROUTINE_VALIDATION.CONTEXT.MIN_LENGTH, ROUTINE_VALIDATION.CONTEXT.MIN_LENGTH_MESSAGE)
            .max(ROUTINE_VALIDATION.CONTEXT.MAX_LENGTH, ROUTINE_VALIDATION.CONTEXT.MAX_LENGTH_MESSAGE)),

    phones_to_call: z
        .array(z.string())
        .min(1, ROUTINE_VALIDATION.PHONES_TO_CALL.MIN_ITEMS_MESSAGE),

    processing_stack: z
        .string()
        .transform((val) => {
            console.log('🔍 Validação Processing Stack - Input:', {
                value: val,
                type: typeof val,
                length: val?.length || 0,
                isString: typeof val === 'string',
                isEmpty: !val || val.trim() === ''
            })
            return val
        })
        .refine((val) => {
            console.log('🔍 Validação Processing Stack - Refine:', {
                value: val,
                length: val?.length || 0,
                minLength: ROUTINE_VALIDATION.PROCESSING_STACK.MIN_LENGTH,
                maxLength: ROUTINE_VALIDATION.PROCESSING_STACK.MAX_LENGTH,
                isValidLength: val && val.length >= ROUTINE_VALIDATION.PROCESSING_STACK.MIN_LENGTH && val.length <= ROUTINE_VALIDATION.PROCESSING_STACK.MAX_LENGTH
            })

            // Verificar se é uma string válida de JSON
            if (!val || val.trim() === '') {
                console.log('❌ Processing Stack vazio')
                return false
            }

            try {
                const parsed = JSON.parse(val)
                if (!Array.isArray(parsed)) {
                    console.log('❌ Processing Stack não é array:', parsed)
                    return false
                }

                if (parsed.length < ROUTINE_VALIDATION.PROCESSING_STACK.MIN_ITEMS) {
                    console.log('❌ Processing Stack tem menos de 2 itens:', parsed.length)
                    return false
                }

                console.log('✅ Processing Stack válido:', {
                    items: parsed.length,
                    content: parsed
                })
                return true
            } catch (error) {
                console.log('❌ Processing Stack JSON inválido:', error)
                return false
            }
        }, {
            message: "Stack de processamento deve ter pelo menos 2 etapas válidas"
        }),

    start_time: z
        .string()
        .transform(val => val || "")
        .pipe(z.string().min(1, "Horário de início é obrigatório")),

    end_time: z
        .string()
        .nullable()
        .optional(),

    active: z.boolean().default(ROUTINE_FORM_DEFAULTS.active)
}).refine((data) => {
    // Validação customizada: end_time deve ser posterior a start_time
    if (data.start_time && data.end_time) {
        const startDate = new Date(data.start_time)
        const endDate = new Date(data.end_time)
        return endDate > startDate
    }
    return true
}, {
    message: ROUTINE_VALIDATION.END_TIME.BEFORE_START,
    path: ["end_time"]
})

/**
 * Schema para filtros de busca de rotinas
 */
export const routineFiltersSchema = z.object({
    search: z.string().optional(),
    status: z.enum(['active', 'inactive', 'pending', 'completed', 'failed']).optional(),
    active: z.boolean().optional()
})
