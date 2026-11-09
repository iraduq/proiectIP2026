import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "../components/layout/AppLayout"
import {
  Search,
  SlidersHorizontal,
  Plus,
  Info,
  AlertTriangle,
  Calendar,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Card } from "../components/ui/card"

interface CatalogCardItem {
  id: number
  code: string
  name: string
  specsAndRoom: string
  categoryTag: string
  department: string
  specialization: string
  statusBadge: "Disponibil" | "Rezervat" | "În utilizare" | "Restricționat"
  accessType: "AIA" | "RETURN_TODAY" | "RESTRICTED"
  accessLabel: string
  availabilityNote?: string
  restrictedBanner?: string
  buttonLabel: string
  imageUrl: string
  targetPath: string
}

const CATALOG_ITEMS: CatalogCardItem[] = [
  {
    id: 1,
    code: "INV-USV-2026-014",
    name: "Workstation AI Deep Learning",
    specsAndRoom: "RTX 4090 · 64GB RAM · Lab 204",
    categoryTag: "Calculatoare",
    department: "Calculatoare",
    specialization: "AIA",
    statusBadge: "Disponibil",
    accessType: "AIA",
    accessLabel: "Acces AIA",
    buttonLabel: "Rezervă resursa",
    imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80",
    targetPath: "/reservations/new?resursa=1",
  },
  {
    id: 2,
    code: "INV-USV-2026-088",
    name: "Braț Robotic Niryo Ned 2",
    specsAndRoom: "6 axe · ROS2 · Lab 208",
    categoryTag: "Roboți",
    department: "Calculatoare",
    specialization: "AIA",
    statusBadge: "Rezervat",
    accessType: "AIA",
    accessLabel: "Acces AIA",
    availabilityNote: "Disponibil: 23.10.2026 · 10:00–12:00",
    buttonLabel: "Rezervă resursa",
    imageUrl: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=900&q=80",
    targetPath: "/reservations/new?resursa=2",
  },
  {
    id: 3,
    code: "INV-USV-2026-102",
    name: "Kit NVIDIA Jetson Orin Nano",
    specsAndRoom: "40 TOPS · Dev Kit · Lab 210",
    categoryTag: "Kituri IoT",
    department: "Calculatoare",
    specialization: "AIA",
    statusBadge: "În utilizare",
    accessType: "RETURN_TODAY",
    accessLabel: "Returnare azi 16:00",
    availabilityNote: "Preluat: 22.10.2026 · 10:00–16:00",
    buttonLabel: "Verifică disponibilitatea",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
    targetPath: "/resources/3",
  },
  {
    id: 4,
    code: "INV-USV-2026-215",
    name: "Osciloscop Rohde & Schwarz RTB2004",
    specsAndRoom: "300 MHz · 2.5 GSa/s · Lab 105",
    categoryTag: "Instrumente",
    department: "Electronică",
    specialization: "Non-AIA",
    statusBadge: "Restricționat",
    accessType: "RESTRICTED",
    accessLabel: "Nu AIA",
    restrictedBanner: "Restricționat · Necesită aprobare cadru didactic",
    buttonLabel: "Cere aprobare CD",
    imageUrl: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=900&q=80",
    targetPath: "/reservations/new?resursa=4",
  },
  {
    id: 5,
    code: "INV-USV-2026-041",
    name: "Imprimantă 3D Bambu Lab X1-Carbon AMS",
    specsAndRoom: "Multi-filament AMS · Lab Prototipare",
    categoryTag: "Prototipare",
    department: "Automatică",
    specialization: "Non-AIA",
    statusBadge: "Restricționat",
    accessType: "RESTRICTED",
    accessLabel: "Nu AIA",
    restrictedBanner: "Restricționat · Necesită aprobare cadru didactic",
    buttonLabel: "Cere aprobare CD",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80",
    targetPath: "/reservations/new?resursa=5",
  },
]

export function ResourcesPage() {
  const navigate = useNavigate()

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("toate")
  const [deptFilter, setDeptFilter] = useState("toate")
  const [specFilter, setSpecFilter] = useState("AIA")
  const [statusFilter, setStatusFilter] = useState("toate")
  const [maxDuration, setMaxDuration] = useState(4)
  const [sortBy, setSortBy] = useState("Specializare")

  const handleResetFilters = () => {
    setSearch("")
    setTypeFilter("toate")
    setDeptFilter("toate")
    setSpecFilter("AIA")
    setStatusFilter("toate")
    setMaxDuration(4)
  }

  const filteredItems = CATALOG_ITEMS.filter((item) => {
    const q = search.trim().toLowerCase()
    if (
      q &&
      !item.name.toLowerCase().includes(q) &&
      !item.code.toLowerCase().includes(q) &&
      !item.specsAndRoom.toLowerCase().includes(q)
    ) {
      return false
    }
    if (typeFilter !== "toate" && item.categoryTag !== typeFilter) {
      return false
    }
    if (deptFilter !== "toate" && item.department !== deptFilter) {
      return false
    }
    if (statusFilter !== "toate" && item.statusBadge !== statusFilter) {
      return false
    }
    return true
  })

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Catalog de resurse"]}>
      <div className="max-w-7xl mx-auto space-y-4">
        <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                Catalog de resurse
              </h1>
              <Badge
                variant="outline"
                className="rounded-full bg-neutral-100 border-neutral-200 text-neutral-700 text-[11px] font-medium px-2.5 py-0.5"
              >
                AIA / Calculatoare
              </Badge>
            </div>
            <p className="text-xs text-neutral-500">
              Găsește resursa potrivită și consultă disponibilitatea. Echipamentele din alte specializări necesită aprobare cadru didactic.
            </p>
          </div>

          <Button
            onClick={() => navigate("/reservations/new")}
            className="bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold h-9 px-4 rounded-lg gap-1.5 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Rezervare nouă
          </Button>
        </Card>

        <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Caută după nume sau cod resursă..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 rounded-xl border-neutral-200 bg-neutral-50/40 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-neutral-500 mr-1">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filtre:
              </span>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-7 rounded-full border border-neutral-200 bg-white px-3 text-[11px] font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="toate">Tip: toate</option>
                <option value="Calculatoare">Tip: Calculatoare</option>
                <option value="Roboți">Tip: Roboți</option>
                <option value="Kituri IoT">Tip: Kituri IoT</option>
                <option value="Instrumente">Tip: Instrumente</option>
                <option value="Prototipare">Tip: Prototipare</option>
              </select>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="h-7 rounded-full border border-neutral-200 bg-white px-3 text-[11px] font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="toate">Departament: toate</option>
                <option value="Calculatoare">Departament: Calculatoare</option>
                <option value="Electronică">Departament: Electronică</option>
                <option value="Automatică">Departament: Automatică</option>
              </select>

              <select
                value={specFilter}
                onChange={(e) => setSpecFilter(e.target.value)}
                className="h-7 rounded-full border border-neutral-200 bg-white px-3 text-[11px] font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="AIA">Specializare: AIA</option>
                <option value="Calculatoare">Specializare: Calculatoare</option>
                <option value="Toate">Specializare: toate</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-7 rounded-full border border-neutral-200 bg-white px-3 text-[11px] font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="toate">Stare: toate</option>
                <option value="Disponibil">Stare: Disponibil</option>
                <option value="Rezervat">Stare: Rezervat</option>
                <option value="În utilizare">Stare: În utilizare</option>
                <option value="Restricționat">Stare: Restricționat</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 transition-colors"
            >
              Resetează
            </button>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 font-medium">Durată maximă rezervare</span>
              <span className="font-bold text-neutral-900">{maxDuration} ore</span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              value={maxDuration}
              onChange={(e) => setMaxDuration(Number(e.target.value))}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-neutral-900">
              {filteredItems.length} resurse
            </span>
            <Badge
              variant="outline"
              className="rounded-full bg-neutral-100 border-neutral-200 text-neutral-700 text-[11px] font-medium px-2.5 py-0.5"
            >
              2 accesibile · 1 în utilizare · 2 restricționate
            </Badge>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-8 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="Specializare">Sortează: Specializare</option>
            <option value="Disponibilitate">Sortează: Disponibilitate</option>
            <option value="Nume">Sortează: Nume</option>
          </select>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-2.5 flex items-center gap-2.5 text-xs text-blue-700">
          <Info className="h-4 w-4 text-blue-600 shrink-0" />
          <span>
            Profilul tău academic <strong>AIA / Calculatoare</strong> îți oferă acces direct la resursele din categoriile Calculatoare și Roboți. Celelalte categorii necesită aprobare cadru didactic.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="rounded-2xl border-neutral-200 bg-white overflow-hidden shadow-none flex flex-col justify-between"
            >
              <div>
                {item.restrictedBanner && (
                  <div className="bg-rose-50/90 text-rose-700 border-b border-rose-100 px-3.5 py-1.5 text-[11px] font-medium flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                    <span>{item.restrictedBanner}</span>
                  </div>
                )}

                <div className="p-3 pb-0">
                  <div className="h-36 w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-100">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {item.code}
                    </span>
                    {item.statusBadge === "În utilizare" ? (
                      <Badge className="rounded-full bg-neutral-950 hover:bg-neutral-950 text-white text-[10px] font-semibold px-2.5 py-0.5 border-transparent">
                        {item.statusBadge}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="rounded-full border-neutral-200 bg-neutral-50 text-neutral-800 text-[10px] font-semibold px-2.5 py-0.5"
                      >
                        {item.statusBadge}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-neutral-900 leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs text-neutral-500">{item.specsAndRoom}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <Badge
                      variant="outline"
                      className="rounded-md border-neutral-200 bg-neutral-100/80 text-neutral-700 text-[10px] font-semibold px-2 py-0.5"
                    >
                      {item.categoryTag}
                    </Badge>

                    {item.accessType === "AIA" && (
                      <Badge
                        variant="outline"
                        className="rounded-md border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5"
                      >
                        {item.accessLabel}
                      </Badge>
                    )}

                    {item.accessType === "RETURN_TODAY" && (
                      <Badge
                        variant="outline"
                        className="rounded-md border-amber-200 bg-amber-50 text-amber-800 text-[10px] font-semibold px-2 py-0.5 flex items-center gap-1"
                      >
                        <AlertTriangle className="h-3 w-3 text-amber-600" />
                        {item.accessLabel}
                      </Badge>
                    )}

                    {item.accessType === "RESTRICTED" && (
                      <Badge
                        variant="outline"
                        className="rounded-md border-rose-200 bg-rose-50 text-rose-700 text-[10px] font-semibold px-2 py-0.5"
                      >
                        {item.accessLabel}
                      </Badge>
                    )}
                  </div>

                  {item.availabilityNote && (
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 pt-0.5">
                      <Calendar className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <span>{item.availabilityNote}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-4 pb-4 pt-1">
                <Button
                  variant="outline"
                  onClick={() => navigate(item.targetPath)}
                  className="w-full h-8 rounded-lg border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-semibold"
                >
                  {item.buttonLabel}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-neutral-500">
            Se afișează 1–{filteredItems.length} din {CATALOG_ITEMS.length} resurse
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg border-neutral-200 bg-white text-neutral-600 text-xs px-3"
            >
              Anterior
            </Button>
            <span className="h-8 w-8 rounded-lg bg-neutral-950 text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg border-neutral-200 bg-white text-neutral-600 text-xs px-3"
            >
              Următor
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
