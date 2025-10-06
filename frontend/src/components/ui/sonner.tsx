import { Loader2, Info, CircleX, CheckCircle2, AlertCircle } from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useTheme } from "next-themes"

export const Toaster = ({
  position = "top-right",
  duration = 5000,
  closeButton = true,
  ...props
}: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme as "light" | "dark"}
      position={position}
      duration={duration}
      closeButton={closeButton}
      icons={{
        loading: <Loader2 className="animate-spin pr-2" />,
        success: <CheckCircle2 className="text-green-500 dark:text-green-400 pr-2" />,
        error: <CircleX className="text-red-500 dark:text-red-400 pr-2" />,
        info: <Info className="text-blue-500 dark:text-blue-400 pr-2" />,
        warning: <AlertCircle className="text-yellow-500 dark:text-yellow-400 pr-2" />,
      }}
      toastOptions={{
        // ensure description text uses the theme-aware foreground color
        descriptionClassName: "flex items-center text-foreground",
        // ensure the toast container also uses foreground so children inherit
        className: "toast text-foreground group-[.toaster]:bg-background group-[.toaster]:border-border group-[.toaster]:shadow-lg font-sans",
        style: {
          background: 'var(--card)',
          color: 'var(--card-foreground)',
          border: 'none',
          fontFamily: 'Outfit, sans-serif'
        }
      }}
      {...props}
    />
  )
}


