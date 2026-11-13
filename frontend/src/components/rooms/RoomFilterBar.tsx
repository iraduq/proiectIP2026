import { Search, X } from "lucide-react"
import { Card } from "../ui/card"
import { Input } from "../ui/input"
import { FLOOR_FILTER_OPTIONS, WING_FILTER_OPTIONS } from "../../data/roomLocations"
import type { Department } from "../../types"

interface RoomFilterBarProps {
  search: string
  onSearchChange: (val: string) => void
  selectedWing: string
  onWingChange: (val: string) => void
  selectedDeptId: string
  onDeptChange: (val: string) => void
  selectedFloor: string
  onFloorChange: (val: string) => void
  departments: Department[]
  filteredCount: number
}

export function RoomFilterBar({
  search,
  onSearchChange,
  selectedWing,
  onWingChange,
  selectedDeptId,
  onDeptChange,
  selectedFloor,
  onFloorChange,
  departments,
  filteredCount,
}: RoomFilterBarProps) {
  return (
    <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Caută unde e laboratorul (ex: Lab 204, Lab 105, Robotică, RTX 4090, Bambu X1, etaj...)"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl border-neutral-200"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="md:col-span-3">
          <select
            value={selectedWing}
            onChange={(e) => onWingChange(e.target.value)}
            className="w-full h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            {WING_FILTER_OPTIONS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={selectedDeptId}
            onChange={(e) => onDeptChange(e.target.value)}
            className="w-full h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            <option value="">Toate departamentele</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nume} ({d.cod})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-neutral-500 mr-1">Filtru rapid etaj:</span>
          {FLOOR_FILTER_OPTIONS.map((floor) => {
            const active = selectedFloor === floor
            return (
              <button
                key={floor}
                type="button"
                onClick={() => onFloorChange(floor)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  active
                    ? "bg-neutral-950 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {floor === "ALL" ? "Toate etajele" : floor}
              </button>
            )
          })}
        </div>

        <div className="text-xs text-neutral-500 font-medium">
          {filteredCount} {filteredCount === 1 ? "laborator găsit" : "laboratoare găsite"}
        </div>
      </div>
    </Card>
  )
}
