import type { User } from "../../types"
import { roleLabel } from "./navItems"

interface AppTopBarProps {
  breadcrumbs: string[]
  user: User | null | undefined
  badges?: string[]
}

export function AppTopBar({ breadcrumbs, user, badges }: AppTopBarProps) {
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
              {badges && badges.length > 0 ? (
                <div className="mt-0.5 flex items-center justify-end gap-1.5">
                  <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {roleLabel(user.rol, true)}
                  </span>
                  {badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-neutral-700"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-neutral-500">{roleLabel(user.rol, true)}</div>
              )}
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
