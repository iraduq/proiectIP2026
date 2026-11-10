import { useState, useEffect, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { academicApi } from "../../api/academic"
import { resourcesApi } from "../../api/resources"
import type { Department, Faculty, Resource, Room } from "../../types"
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  LogOut,
  Search,
  FlaskConical,
  GraduationCap,
  X,
  Loader2,
  Cpu,
  Calendar,
  Wrench,
  Users,
} from "lucide-react"
import { Input } from "../ui/input"

interface AppLayoutProps {
  children: React.ReactNode
  breadcrumbs?: string[]
}

export function AppLayout({ children, breadcrumbs = ["Spațiu de lucru", "Panou de bord"] }: AppLayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<{
    rooms: Room[]
    departments: Department[]
    faculties: Faculty[]
    resources: Resource[]
  }>({ rooms: [], departments: [], faculties: [], resources: [] })
  const [showResults, setShowResults] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (trimmed.length < 2) {
      setSearchResults({ rooms: [], departments: [], faculties: [], resources: [] })
      setIsSearching(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const [roomsRes, deptsRes, facsRes, resourcesRes] = await Promise.all([
          academicApi.getRooms({ search: trimmed, limit: 5 }),
          academicApi.getDepartments({ search: trimmed, limit: 5 }),
          academicApi.getFaculties({ search: trimmed, limit: 5 }),
          resourcesApi.getResources({ search: trimmed, limit: 5 }),
        ])
        setSearchResults({
          rooms: roomsRes.items,
          departments: deptsRes.items,
          faculties: facsRes.items,
          resources: resourcesRes.items,
        })
        setShowResults(true)
      } catch {
      } finally {
        setIsSearching(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const isAdmin = user?.rol === "ADMINISTRATOR" || user?.permissions?.includes("structure:manage")
  const canViewTechnical =
    user?.rol === "ADMINISTRATOR" ||
    user?.rol === "RESPONSABIL_LABORATOR" ||
    Boolean(user?.permissions?.includes("technical_history:read"))
  const isLabOrProf = user?.rol === "RESPONSABIL_LABORATOR" || user?.rol === "PROFESOR"

  const navItems = isLabOrProf
    ? [
        { label: "Panou de bord", path: "/dashboard", icon: LayoutDashboard },
        { label: "Panou departament", path: "/professor", icon: Building2 },
        { label: "Catalog resurse", path: "/resources", icon: Cpu },
        { label: "Rezervările mele", path: "/reservations", icon: Calendar },
        { label: "Laboratoare & Săli", path: "/rooms", icon: DoorOpen },
        { label: "Aprobări studenți", path: "/professor/approvals", icon: Users },
      ]
    : isAdmin
    ? [
        { label: "Panou de bord", path: "/dashboard", icon: LayoutDashboard },
        { label: "Catalog resurse", path: "/resources", icon: Cpu },
        { label: "Rezervările mele", path: "/reservations", icon: Calendar },
        ...(canViewTechnical ? [{ label: "Jurnal Tehnic", path: "/technical-history", icon: Wrench }] : []),
        { label: "Laboratoare & Săli", path: "/rooms", icon: DoorOpen },
        { label: "Structură Academică", path: "/admin/academic", icon: Building2 },
      ]
    : [
        { label: "Panou de bord", path: "/dashboard", icon: LayoutDashboard },
        { label: "Catalog resurse", path: "/resources", icon: Cpu },
        { label: "Rezervările mele", path: "/reservations", icon: Calendar },
        { label: "Laboratoare & Săli", path: "/rooms", icon: DoorOpen },
      ]

  const totalResults =
    searchResults.rooms.length +
    searchResults.departments.length +
    searchResults.faculties.length +
    searchResults.resources.length

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
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

          <div ref={searchContainerRef} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Caută în RRM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) setShowResults(true)
              }}
              className="pl-8 pr-7 h-9 text-xs bg-neutral-50 border-neutral-200 focus-visible:bg-white"
            />
            {isSearching ? (
              <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 text-neutral-400 animate-spin" />
            ) : searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery("")
                  setShowResults(false)
                }}
                className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}

            {showResults && searchQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-11 z-50 bg-white rounded-xl shadow-xl border border-neutral-200 p-2 max-h-96 overflow-y-auto space-y-3">
                {totalResults === 0 && !isSearching ? (
                  <div className="text-xs text-neutral-400 text-center py-4">
                    Niciun rezultat găsit pentru "{searchQuery}"
                  </div>
                ) : (
                  <>
                    {searchResults.resources.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 py-1 flex items-center gap-1">
                          <Cpu className="h-3 w-3" />
                          <span>Echipamente & Resurse</span>
                        </div>
                        <div className="space-y-0.5">
                          {searchResults.resources.map((res) => (
                            <button
                              key={res.id}
                              onClick={() => {
                                setShowResults(false)
                                navigate(`/resources?search=${encodeURIComponent(res.cod_inventar)}`)
                              }}
                              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-neutral-100 flex items-center justify-between text-xs transition-colors"
                            >
                              <div className="truncate">
                                <span className="font-mono font-bold text-neutral-900 mr-2">{res.cod_inventar}</span>
                                <span className="text-neutral-600">{res.nume}</span>
                              </div>
                              <span className="text-[10px] text-neutral-400 shrink-0 font-medium">
                                {res.stare_tehnica}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults.rooms.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 py-1 flex items-center gap-1">
                          <DoorOpen className="h-3 w-3" />
                          <span>Săli de cercetare</span>
                        </div>
                        <div className="space-y-0.5">
                          {searchResults.rooms.map((r) => (
                            <button
                              key={r.id}
                              onClick={() => {
                                setShowResults(false)
                                navigate(`/rooms?search=${encodeURIComponent(r.cod)}`)
                              }}
                              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-neutral-100 flex items-center justify-between text-xs transition-colors"
                            >
                              <div className="truncate">
                                <span className="font-mono font-bold text-neutral-900 mr-2">{r.cod}</span>
                                <span className="text-neutral-600">{r.nume}</span>
                              </div>
                              <span className="text-[10px] text-neutral-400 shrink-0 font-medium">
                                {r.capacitate} locuri
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults.departments.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 py-1 flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>Departamente</span>
                        </div>
                        <div className="space-y-0.5">
                          {searchResults.departments.map((d) => (
                            <button
                              key={d.id}
                              onClick={() => {
                                setShowResults(false)
                                navigate("/admin/academic")
                              }}
                              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-neutral-100 flex items-center justify-between text-xs transition-colors"
                            >
                              <div className="truncate">
                                <span className="font-mono font-bold text-neutral-900 mr-2">{d.cod}</span>
                                <span className="text-neutral-600">{d.nume}</span>
                              </div>
                              <span className="text-[10px] text-neutral-400 shrink-0">
                                {d.facultate_nume}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults.faculties.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 py-1 flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          <span>Facultăți</span>
                        </div>
                        <div className="space-y-0.5">
                          {searchResults.faculties.map((f) => (
                            <button
                              key={f.id}
                              onClick={() => {
                                setShowResults(false)
                                navigate("/admin/academic")
                              }}
                              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-neutral-100 flex items-center justify-between text-xs transition-colors"
                            >
                              <div className="truncate">
                                <span className="font-mono font-bold text-neutral-900 mr-2">{f.cod}</span>
                                <span className="text-neutral-600">{f.nume}</span>
                              </div>
                              <span className="text-[10px] text-neutral-400 shrink-0">
                                {f.institutie_nume}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

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
              <div className="text-[10px] text-neutral-500 truncate">
                {user?.rol === "RESPONSABIL_LABORATOR"
                  ? "Reprezentant laborator"
                  : user?.rol === "PROFESOR"
                  ? "Profesor"
                  : user?.rol === "ADMINISTRATOR"
                  ? "Administrator"
                  : "Student"}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-md w-full transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Deconectare
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
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
                  <div className="text-[10px] text-neutral-500">
                    {user.rol === "RESPONSABIL_LABORATOR"
                      ? "Reprezentant laborator"
                      : user.rol === "PROFESOR"
                      ? "Profesor · Departamentul Calculatoare"
                      : user.rol === "ADMINISTRATOR"
                      ? "Administrator"
                      : "Student"}
                  </div>
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

        <div className="flex-1 p-8 overflow-y-auto">{children}</div>
      </main>
    </div>
  )
}
