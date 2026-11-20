import type { LucideIcon } from "lucide-react"
import { Building2, Cpu, DoorOpen, GraduationCap, Loader2, Search, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Input } from "../ui/input"
import { useGlobalSearch } from "./useGlobalSearch"

interface ResultGroup {
  key: string
  title: string
  icon: LucideIcon
  items: { id: number; code: string; name: string; meta: string; path: string }[]
}

export function GlobalSearch() {
  const navigate = useNavigate()
  const s = useGlobalSearch()
  const { searchResults: r } = s

  const groups: ResultGroup[] = [
    {
      key: "resources", title: "Echipamente și resurse", icon: Cpu,
      items: r.resources.map((x) => ({
        id: x.id, code: x.cod_inventar, name: x.nume, meta: x.stare_tehnica,
        path: `/resources?search=${encodeURIComponent(x.cod_inventar)}`,
      })),
    },
    {
      key: "rooms", title: "Săli de cercetare", icon: DoorOpen,
      items: r.rooms.map((x) => ({
        id: x.id, code: x.cod, name: x.nume, meta: `${x.capacitate} locuri`,
        path: `/rooms?search=${encodeURIComponent(x.cod)}`,
      })),
    },
    {
      key: "departments", title: "Departamente", icon: Building2,
      items: r.departments.map((x) => ({
        id: x.id, code: x.cod, name: x.nume, meta: x.facultate_nume ?? "", path: "/admin/academic",
      })),
    },
    {
      key: "faculties", title: "Facultăți", icon: GraduationCap,
      items: r.faculties.map((x) => ({
        id: x.id, code: x.cod, name: x.nume, meta: x.institutie_nume ?? "", path: "/admin/academic",
      })),
    },
  ]

  return (
    <div ref={s.searchContainerRef} className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
      <Input
        type="text"
        placeholder="Caută în RRM..."
        value={s.searchQuery}
        onChange={(e) => s.setSearchQuery(e.target.value)}
        onFocus={() => {
          if (s.searchQuery.trim().length >= 2) s.setShowResults(true)
        }}
        className="pl-8 pr-7 h-9 text-xs bg-neutral-50 border-neutral-200 focus-visible:bg-white"
      />
      {s.isSearching ? (
        <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 text-neutral-400 animate-spin" />
      ) : s.searchQuery ? (
        <button
          onClick={() => {
            s.setSearchQuery("")
            s.setShowResults(false)
          }}
          className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}

      {s.showResults && s.searchQuery.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-11 z-50 bg-white rounded-xl shadow-xl border border-neutral-200 p-2 max-h-96 overflow-y-auto space-y-3">
          {s.totalResults === 0 && !s.isSearching ? (
            <div className="text-xs text-neutral-400 text-center py-4">
              Niciun rezultat găsit pentru "{s.searchQuery}"
            </div>
          ) : (
            groups
              .filter((g) => g.items.length > 0)
              .map(({ key, title, icon: Icon, items }) => (
                <div key={key}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 py-1 flex items-center gap-1">
                    <Icon className="h-3 w-3" />
                    <span>{title}</span>
                  </div>
                  <div className="space-y-0.5">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          s.setShowResults(false)
                          navigate(item.path)
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-neutral-100 flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="truncate">
                          <span className="font-mono font-bold text-neutral-900 mr-2">{item.code}</span>
                          <span className="text-neutral-600">{item.name}</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 shrink-0 font-medium">{item.meta}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  )
}
