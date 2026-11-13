import { Calendar, Cpu, FlaskConical, LayoutDashboard, Search } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

interface WelcomeSidebarProps {
  searchTerm: string
  isAuthenticated: boolean
  onSearchChange: (value: string) => void
  onNavigate: (path: string) => void
}

export function WelcomeSidebar({
  searchTerm,
  isAuthenticated,
  onSearchChange,
  onNavigate,
}: WelcomeSidebarProps) {
  const navItems = [
    { label: "Panou de bord", path: "/dashboard", icon: LayoutDashboard },
    { label: "Catalog de resurse", path: "/resources", icon: Cpu },
    { label: "Rezervările mele", path: "/reservations", icon: Calendar },
  ]

  return (
    <aside className="w-60 border-r border-[#e5e7eb] bg-white flex flex-col justify-between shrink-0">
      <div className="p-4 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center text-white shrink-0">
            <FlaskConical className="h-4 w-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-neutral-900 leading-tight">RRM</div>
            <div className="text-[10px] text-neutral-500">Resurse de laborator</div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <Input
            type="text"
            placeholder="Caută în RRM..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs bg-neutral-50 border-neutral-200 rounded-lg placeholder:text-neutral-400"
          />
        </div>

        <div className="space-y-1">
          <div className="text-[10px] font-semibold tracking-wider text-neutral-400 px-2 py-1 uppercase">
            Spațiu de lucru
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(isAuthenticated ? item.path : "/login")}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors text-left"
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-3">
        <div className="p-3 rounded-xl border border-dashed border-neutral-300 bg-white space-y-2">
          <div className="text-xs font-semibold text-neutral-900">Ajutor și ghiduri</div>
          <p className="text-[11px] text-neutral-500 leading-snug">
            Autentifică-te pentru a rezerva resurse.
          </p>
          <Button
            variant="outline"
            onClick={() => onNavigate("/login")}
            className="w-full h-7 text-xs border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 rounded-md"
          >
            Autentificare
          </Button>
        </div>
      </div>
    </aside>
  )
}
