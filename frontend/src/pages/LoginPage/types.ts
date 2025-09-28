/**
 * Tipos e interfaces da página de Login
 */

/**
 * Dados do formulário de login
 */
export interface LoginFormData {
    /** Email do usuário */
    email: string;
    /** Senha do usuário */
    password: string;
    /** Se deve lembrar do usuário */
    remember: boolean;
}

/**
 * Estado da página de login
 */
export interface LoginPageState {
    /** Se está carregando */
    isLoading: boolean;
    /** Erro da API, se houver */
    apiError: string | null;
}
