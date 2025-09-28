import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/controllers/auth-api";
import { loginSchema } from "./validation";
import type { LoginFormData } from "./types";
import { useAuth } from "@/stores/auth";

/**
 * Hook customizado para gerenciar a lógica de login
 * Encapsula estado, validação e submissão do formulário
 */
export function useLogin() {
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            remember: false,
        }
    });

    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Verificar se usuário já está autenticado ao carregar a página
    useEffect(() => {
        if (isAuthenticated()) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = (data: LoginFormData) => {
        setIsLoading(true);
        setApiError(null);

        // Chamada real para a API usando promises
        authApi.login({
            email: data.email,
            password: data.password,
        })
            .then(({ data: responseData, error: responseError }) => {
                if (responseData) {
                    const { token, user } = responseData

                    // Salvar token no store (com remember me)
                    login(token, user, data.remember);

                    // Navegar para home
                    navigate("/");

                } else {
                    // Erro retornado pela API
                    setApiError(responseError?.message as string || 'Erro ao fazer login');
                }
            })
            .catch((error) => {
                // Erro de rede ou outro erro inesperado
                setApiError('Erro de conexão. Tente novamente.');
                console.error('Erro no login:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return {
        // Form state
        form,
        isLoading,
        apiError,
        // Actions
        onSubmit,
        // Helpers
        clearError: () => setApiError(null),
    };
}
