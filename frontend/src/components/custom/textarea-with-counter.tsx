import * as React from "react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

export interface TextareaWithCounterProps
    extends React.ComponentProps<"textarea"> {
    /** Mostra o contador de palavras */
    showWordCount?: boolean
    /** Mostra o contador de caracteres */
    showCharCount?: boolean
    /** Máximo de caracteres (para mostrar progresso) */
    maxLength?: number
    /** Classe customizada para o contador */
    counterClassName?: string
}

const TextareaWithCounter = React.forwardRef<
    HTMLTextAreaElement,
    TextareaWithCounterProps
>(({
    className,
    showWordCount = false,
    showCharCount = false,
    maxLength,
    counterClassName,
    ...props
}, ref) => {
    const [value, setValue] = React.useState(props.value || props.defaultValue || "")

    // Atualiza o valor quando props.value muda
    React.useEffect(() => {
        setValue(props.value || "")
    }, [props.value])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value)
        props.onChange?.(e)
    }

    // Conta palavras (remove espaços extras e quebras de linha)
    const wordCount = React.useMemo(() => {
        if (!showWordCount) return 0
        const text = String(value).trim()
        if (!text) return 0
        return text.split(/\s+/).filter(word => word.length > 0).length
    }, [value, showWordCount])

    // Conta caracteres
    const charCount = React.useMemo(() => {
        if (!showCharCount) return 0
        return String(value).length
    }, [value, showCharCount])

    // Calcula progresso se maxLength estiver definido
    const progress = React.useMemo(() => {
        if (!maxLength || !showCharCount) return 0
        return (charCount / maxLength) * 100
    }, [charCount, maxLength, showCharCount])

    // Determina cor do contador baseado no progresso
    const getCounterColor = () => {
        if (!maxLength) return "text-muted-foreground"

        if (progress >= 100) return "text-destructive"
        if (progress >= 80) return "text-yellow-600 dark:text-yellow-400"
        return "text-muted-foreground"
    }

    return (
        <div className="relative">
            <Textarea
                className={cn(className)}
                ref={ref}
                {...props}
                onChange={handleChange}
                maxLength={maxLength}
            />

            {(showWordCount || showCharCount) && (
                <div className={cn(
                    "absolute bottom-2 right-8 text-xs",
                    getCounterColor(),
                    counterClassName
                )}>
                    {showWordCount && showCharCount && (
                        <span>
                            {wordCount} palavras • {charCount}
                            {maxLength && `/${maxLength}`}
                        </span>
                    )}
                    {showWordCount && !showCharCount && (
                        <span>{wordCount} palavras</span>
                    )}
                    {!showWordCount && showCharCount && (
                        <span>
                            {charCount}
                            {maxLength && `/${maxLength}`}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
})

TextareaWithCounter.displayName = "TextareaWithCounter"

export { TextareaWithCounter }
