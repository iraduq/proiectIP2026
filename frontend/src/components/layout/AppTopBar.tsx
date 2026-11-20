import type { User } from "../../types"
import { roleLabel } from "./navItems"

interface AppTopBarProps {
  breadcrumbs: string[]
  user: User | null | undefined
}

export function AppTopBar({ breadcrumbs, user }: AppTopBarProps) {
  return (
    <header className="h-14 border-b border-[#e5e7eb] bg-white px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        {breadcrumbs.map((crumb, idx) => (
          <span key={crumb} className="flex items-center gap-2">
            <span className={idx === breadcrumbs.length - 1 ? "font-semibold text-neutral-900" : ""}>
              {crumb}
            </span>
            {idx < breadcrumbs.length - 1 && <span>/</span>}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs">
        {user ? (
          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <div className="font-bold text-xs text-neutral-900 leading-tight">{user.nume}</div>
              <div className="text-[10px] text-neutral-500">{roleLabel(user.rol, true)}</div>
            </div>
            <div className="h-8 w-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user.nume.charAt(0).toUpperCase()}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-neutral-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Sistem online</span>
          </div>
        )}
      </div>
    </header>
  )
}
