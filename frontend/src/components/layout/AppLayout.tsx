import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { AppSidebar } from "./AppSidebar"
import { AppTopBar } from "./AppTopBar"

interface AppLayoutProps {
  children: React.ReactNode
  breadcrumbs?: string[]
  topBarBadges?: string[]
}

export function AppLayout({ children, breadcrumbs = ["Spațiu de lucru", "Panou de bord"], topBarBadges }: AppLayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <AppSidebar user={user} onLogout={handleLogout} />
      <main className="flex-1 flex flex-col min-w-0">
        <AppTopBar breadcrumbs={breadcrumbs} user={user} badges={topBarBadges} />
        <div className="flex-1 p-8 overflow-y-auto">{children}</div>
      </main>
    </div>
  )
}
