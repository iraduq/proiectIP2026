import { FlaskConical, GraduationCap, LogOut } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import type { User } from "../../types"
import { GlobalSearch } from "./GlobalSearch"
import { getNavItems, roleLabel } from "./navItems"

interface AppSidebarProps {
  user: User | null | undefined
  onLogout: () => void
}

export function AppSidebar({ user, onLogout }: AppSidebarProps) {
  const location = useLocation()
  const navItems = getNavItems(user)

  return (
    <aside className="w-64 border-r border-[#e5e7eb] bg-white flex flex-col justify-between shrink-0">
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-black flex items-center justify-center text-white font-bold shadow-sm">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight text-neutral-900">RRM / kit</div>
            <div className="text-xs text-neutral-500">Resurse de laborator</div>
          </div>
        </div>

        <GlobalSearch />

        <div>
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-2">
            Spațiu de lucru
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-neutral-100 text-neutral-900 font-semibold"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-neutral-900" : "text-neutral-400"}`} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-neutral-100 space-y-3">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-neutral-50 border border-neutral-100">
          <div className="h-8 w-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {user?.nume ? user.nume.charAt(0).toUpperCase() : <GraduationCap className="h-4 w-4" />}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-neutral-900 truncate">{user?.nume || "Utilizator"}</div>
            <div className="text-[10px] text-neutral-500 truncate">{roleLabel(user?.rol)}</div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-md w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Deconectare
        </button>
      </div>
    </aside>
  )
}
