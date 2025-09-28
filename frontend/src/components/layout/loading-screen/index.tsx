import { Brain } from 'lucide-react'

interface LoadingScreenProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function LoadingScreen({
    message = 'Carregando...',
    size = 'md'
}: LoadingScreenProps) {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    const containerSizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-20 h-20',
        lg: 'w-24 h-24'
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background select-none">
            <div className="flex flex-col items-center space-y-4">
                {/* Spinner com logo */}
                <div className={`${containerSizeClasses[size]} rounded-2xl gradient-primary flex items-center justify-center animate-bounce`}>
                    <Brain className={`${sizeClasses[size]} text-white`} />
                </div>

                {/* Mensagem */}
                <p className="text-muted-foreground text-sm font-medium animate-pulse">
                    {message}
                </p>

                {/* Loading dots */}
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    )
}
