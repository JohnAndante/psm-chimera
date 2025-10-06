import { useEffect } from "react"
import { useAuth } from "@/stores/auth"
import AppRoutes from "@/routes"

export default function App() {
  const loadFromStorage = useAuth((s) => s.loadFromStorage)

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  return (
    <>
      <AppRoutes />
    </>
  )
}
