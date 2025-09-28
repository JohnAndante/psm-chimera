import { toast as sonnerToast } from "sonner"

export const useToast = () => {
    const toast = {
        success: (message: string, options?: { description?: string }) => {
            sonnerToast.success(message, {
                description: options?.description,
            })
        },
        error: (message: string, options?: { description?: string }) => {
            sonnerToast.error(message, {
                description: options?.description,
            })
        },
        info: (message: string, options?: { description?: string }) => {
            sonnerToast.info(message, {
                description: options?.description,
            })
        },
        warning: (message: string, options?: { description?: string }) => {
            sonnerToast.warning(message, {
                description: options?.description,
            })
        },
        loading: (message: string, options?: { description?: string }) => {
            sonnerToast.loading(message, {
                description: options?.description,
            })
        },
    }

    return { toast }
}
