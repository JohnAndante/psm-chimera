import { useEffect } from "react"
import { useAuth } from "@/stores/auth"
import { Toaster } from "@/components/ui/sonner"
import AppRoutes from "@/routes"

export default function App() {
  const loadFromStorage = useAuth((s) => s.loadFromStorage)

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  return (
    <>
      <AppRoutes />
      <Toaster />
    </>
  )
}
