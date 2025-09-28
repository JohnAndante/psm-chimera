import * as z from "zod"
import { AGENT_VALIDATION, AGENT_FORM_DEFAULTS } from "@/constants/agent"

// ===========================
// Validation Schemas
// ===========================

/**
 * Schema de validação para formulário de agente
 * Baseado no CreateAgentDto do backend
 * Usa as constantes AGENT_VALIDATION para mensagens consistentes
 */
export const agentSchema = z.object({
    name: z
        .string()
        .min(1, AGENT_VALIDATION.NAME.REQUIRED)
        .min(AGENT_VALIDATION.NAME.MIN_LENGTH, AGENT_VALIDATION.NAME.MIN_LENGTH_MESSAGE)
        .max(AGENT_VALIDATION.NAME.MAX_LENGTH, AGENT_VALIDATION.NAME.MAX_LENGTH_MESSAGE),

    description: z
        .string()
        .min(1, AGENT_VALIDATION.DESCRIPTION.REQUIRED)
        .min(AGENT_VALIDATION.DESCRIPTION.MIN_LENGTH, AGENT_VALIDATION.DESCRIPTION.MIN_LENGTH_MESSAGE)
        .max(AGENT_VALIDATION.DESCRIPTION.MAX_LENGTH, AGENT_VALIDATION.DESCRIPTION.MAX_LENGTH_MESSAGE),

    objective: z
        .string()
        .min(1, AGENT_VALIDATION.OBJECTIVE.REQUIRED)
        .min(AGENT_VALIDATION.OBJECTIVE.MIN_LENGTH, AGENT_VALIDATION.OBJECTIVE.MIN_LENGTH_MESSAGE)
        .max(AGENT_VALIDATION.OBJECTIVE.MAX_LENGTH, AGENT_VALIDATION.OBJECTIVE.MAX_LENGTH_MESSAGE),

    personality: z
        .string()
        .min(1, AGENT_VALIDATION.PERSONALITY.REQUIRED)
        .min(AGENT_VALIDATION.PERSONALITY.MIN_LENGTH, AGENT_VALIDATION.PERSONALITY.MIN_LENGTH_MESSAGE)
        .max(AGENT_VALIDATION.PERSONALITY.MAX_LENGTH, AGENT_VALIDATION.PERSONALITY.MAX_LENGTH_MESSAGE),

    voice_id: z
        .string()
        .min(1, AGENT_VALIDATION.VOICE_ID.REQUIRED),

    presentation_message: z
        .string()
        .min(AGENT_VALIDATION.PRESENTATION_MESSAGE.MIN_LENGTH, AGENT_VALIDATION.PRESENTATION_MESSAGE.MIN_LENGTH_MESSAGE)
        .max(AGENT_VALIDATION.PRESENTATION_MESSAGE.MAX_LENGTH, AGENT_VALIDATION.PRESENTATION_MESSAGE.MAX_LENGTH_MESSAGE)
        .nullable()
        .optional(),

    active: z.boolean().default(AGENT_FORM_DEFAULTS.active)
})

/**
 * Schema para filtros de busca de agentes
 */
export const agentFiltersSchema = z.object({
    search: z.string().optional(),
    active: z.boolean().optional()
})
