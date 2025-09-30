import { motion, AnimatePresence, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimationPreset =
    | "fadeIn"
    | "fadeInUp"
    | "fadeInDown"
    | "fadeInLeft"
    | "fadeInRight"
    | "slideUp"
    | "slideDown"
    | "slideLeft"
    | "slideRight"
    | "scaleIn"
    | "none";

interface AnimatedWrapperProps {
    children: React.ReactNode;
    preset?: AnimationPreset;
    duration?: number;
    delay?: number;
    className?: string;
    /**
     * Se true, usa AnimatePresence para entrada/saída
     */
    exitAnimation?: boolean;
    /**
     * Variantes customizadas (sobrescreve o preset)
     */
    customVariants?: Variants;
    /**
     * Props adicionais para o motion.div
     */
    motionProps?: any;
}

const animationPresets: Record<AnimationPreset, Variants> = {
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    },
    fadeInUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 }
    },
    fadeInDown: {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    },
    fadeInLeft: {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    },
    fadeInRight: {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 }
    },
    slideUp: {
        initial: { y: 50 },
        animate: { y: 0 },
        exit: { y: 50 }
    },
    slideDown: {
        initial: { y: -50 },
        animate: { y: 0 },
        exit: { y: -50 }
    },
    slideLeft: {
        initial: { x: 50 },
        animate: { x: 0 },
        exit: { x: 50 }
    },
    slideRight: {
        initial: { x: -50 },
        animate: { x: 0 },
        exit: { x: -50 }
    },
    scaleIn: {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 }
    },
    none: {
        initial: {},
        animate: {},
        exit: {}
    }
};

export function AnimatedWrapper({
    children,
    preset = "fadeIn",
    duration = 0.3,
    delay = 0,
    className,
    exitAnimation = false,
    customVariants,
    motionProps = {},
    ...props
}: AnimatedWrapperProps) {
    const variants = customVariants || animationPresets[preset];

    const transitionConfig = {
        duration,
        delay,
        ease: "easeOut",
        ...motionProps.transition
    };

    const MotionDiv = (
        <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transitionConfig}
            className={cn(className)}
            {...motionProps}
            {...props}
        >
            {children}
        </motion.div>
    );

    if (exitAnimation) {
        return (
            <AnimatePresence mode="wait">
                {MotionDiv}
            </AnimatePresence>
        );
    }

    return MotionDiv;
}

// Hook para usar stagger (animações escalonadas) facilmente
export function useStagger(baseDelay: number = 0, increment: number = 0.1) {
    return (index: number) => baseDelay + (index * increment);
}

// Componente específico para listas com stagger
interface AnimatedListProps {
    children: React.ReactNode[];
    preset?: AnimationPreset;
    duration?: number;
    staggerDelay?: number;
    className?: string;
}

export function AnimatedList({
    children,
    preset = "fadeInUp",
    duration = 0.3,
    staggerDelay = 0.1,
    className
}: AnimatedListProps) {
    return (
        <div className={className}>
            {children.map((child, index) => (
                <AnimatedWrapper
                    key={index}
                    preset={preset}
                    duration={duration}
                    delay={index * staggerDelay}
                >
                    {child}
                </AnimatedWrapper>
            ))}
        </div>
    );
}
