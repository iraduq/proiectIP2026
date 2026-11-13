import { Search, SlidersHorizontal, Layers, RotateCcw } from "lucide-react"
import { Input } from "../ui/input"
import { Card } from "../ui/card"

export const CLASS_TABS = [
  { id: "toate", label: "Toate clasele" },
  { id: "Calculatoare", label: "Calculatoare și HPC" },
  { id: "Roboți", label: "Roboți și autonomie" },
  { id: "Kituri IoT", label: "Kituri IoT și FPGA" },
  { id: "Instrumente", label: "Instrumente și măsură" },
  { id: "Prototipare", label: "Prototipare și 3D" },
  { id: "Drone și vehicule", label: "Drone și vehicule" },
  { id: "Rețelistică și cyber", label: "Rețelistică și cyber" },
  { id: "Optoelectronică", label: "Optoelectronică" },
  { id: "Biomed și VR", label: "Biomed și VR" },
  { id: "Energetică și PLC", label: "Energetică și PLC" },
]

export const SPEC_KEYWORDS = [
  { id: "toate", label: "Dotare tehnică: toate", match: "" },
  {
    id: "gpu",
    label: "GPU / RTX / AI deep learning",
    match: "rtx|a100|h100|l40s|gpu|tops|ai",
  },
  {
    id: "ros",
    label: "ROS2 / brațe robotice",
    match: "ros2|axe|dof|robot|gripper",
  },
  {
    id: "fpga",
    label: "FPGA / embedded / MCU",
    match: "fpga|zynq|artix|stm32|cortex|jetson|lora",
  },
  {
    id: "rf",
    label: "Osciloscoape / RF / spectru",
    match: "mhz|ghz|gs/s|gsa/s|vna|osciloscop|spectru",
  },
  {
    id: "3d",
    label: "Imprimare 3D / laser / CNC",
    match: "corexy|fdm|sla|laser|cnc|pcb|smd",
  },
  {
    id: "drone",
    label: "LiDAR / RTK / drone",
    match: "rtk|lidar|dron|gnss|px4|rov",
  },
  {
    id: "net",
    label: "Switch L3 / firewall / SDR 5G",
    match: "sfp|poe|firewall|sdr|5g|otdr|hsm",
  },
  {
    id: "opt",
    label: "Fotonică / spectrometrie / camere",
    match: "nm|fps|laser|optic|microscop|interferometru",
  },
  {
    id: "bio",
    label: "EEG / EMG / BCI / căști VR",
    match: "eeg|emg|ecg|bci|vr|eye|haptic",
  },
  {
    id: "pwr",
    label: "Energetică / PLC / HIL",
    match: "hil|plc|simatic|kw|fotovoltaic|invertor",
  },
]

export interface ResourceFilterValues {
  search: string
  typeFilter: string
  deptFilter: string
  specFilter: string
  roomFilter: string
  statusFilter: string
  techFilter: string
  specKeywordFilter: string
}

interface ResourceFilterBarProps {
  filters: ResourceFilterValues
  classCounts: Record<string, number>
  departmentsList: string[]
  specializationsList: string[]
  roomsList: string[]
  activeFiltersCount: number
  isStudent: boolean
  onFilterChange: <K extends keyof ResourceFilterValues>(
    key: K,
    value: ResourceFilterValues[K]
  ) => void
  onResetFilters: () => void
}

export function ResourceFilterBar({
  filters,
  classCounts,
  departmentsList,
  specializationsList,
  roomsList,
  activeFiltersCount,
  isStudent,
  onFilterChange,
  onResetFilters,
}: ResourceFilterBarProps) {
  return (
    <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
            <Layers className="h-3.5 w-3.5 text-neutral-700" />
            Clasă echipament (acces rapid)
          </span>
          {filters.typeFilter !== "toate" && (
            <button
              type="button"
              onClick={() => onFilterChange("typeFilter", "toate")}
              className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900"
            >
              Afișează toate clasele
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CLASS_TABS.map((tab) => {
            const active = filters.typeFilter === tab.id
            const count = classCounts[tab.id] || 0
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterChange("typeFilter", tab.id)}
                className={`h-8 px-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  active
                    ? "bg-neutral-950 text-white shadow-xs"
                    : "bg-neutral-100/80 hover:bg-neutral-200/70 text-neutral-700 border border-neutral-200/70"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    active ? "bg-white/20 text-white" : "bg-white text-neutral-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="relative pt-1">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-neutral-400" />
        <Input
          id="catalog-search-input"
          type="text"
          placeholder="Caută după nume, cod inventar (ex. INV-USV-2026-001), specificații (ex. RTX 4090, ROS2, LiDAR), sală sau specializare..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="pl-9 h-9 rounded-xl border-neutral-200 bg-neutral-50/40 text-xs"
        />
      </div>

      <div className="space-y-2.5 pt-1 border-t border-neutral-100">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtre detaliate {activeFiltersCount > 0 ? `(${activeFiltersCount} active)` : ""}
          </span>

          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-neutral-950 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Resetează toate filtrele
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <select
            value={filters.typeFilter}
            onChange={(e) => onFilterChange("typeFilter", e.target.value)}
            className="h-8 rounded-xl border border-neutral-200 bg-white px-2.5 text-[11px] font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="toate">Clasă: toate</option>
            {CLASS_TABS.filter((t) => t.id !== "toate").map((t) => (
              <option key={t.id} value={t.id}>
                Clasă: {t.label}
              </option>
            ))}
          </select>

          <select
            value={filters.deptFilter}
            onChange={(e) => onFilterChange("deptFilter", e.target.value)}
            className="h-8 rounded-xl border border-neutral-200 bg-white px-2.5 text-[11px] font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="toate">Departament: toate</option>
            {departmentsList.map((dept) => (
              <option key={dept} value={dept}>
                Departament: {dept}
              </option>
            ))}
          </select>

          <select
            value={filters.specFilter}
            onChange={(e) => onFilterChange("specFilter", e.target.value)}
            className="h-8 rounded-xl border border-neutral-200 bg-white px-2.5 text-[11px] font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="toate">Specializare: toate</option>
            {specializationsList.map((sp) => (
              <option key={sp} value={sp}>
                Specializare: {sp}
              </option>
            ))}
          </select>

          <select
            value={filters.roomFilter}
            onChange={(e) => onFilterChange("roomFilter", e.target.value)}
            className="h-8 rounded-xl border border-neutral-200 bg-white px-2.5 text-[11px] font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="toate">Sală / lab: toate</option>
            {roomsList.map((rm) => (
              <option key={rm} value={rm}>
                Sală: {rm}
              </option>
            ))}
          </select>

          <select
            value={filters.statusFilter}
            onChange={(e) => onFilterChange("statusFilter", e.target.value)}
            className="h-8 rounded-xl border border-neutral-200 bg-white px-2.5 text-[11px] font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="toate">Disponibilitate: toate</option>
            <option value="Disponibil">Disponibil acum</option>
            <option value="Rezervat">Rezervat</option>
            <option value="În utilizare">În utilizare</option>
          </select>

          <select
            value={filters.specKeywordFilter}
            onChange={(e) => onFilterChange("specKeywordFilter", e.target.value)}
            className="h-8 rounded-xl border border-neutral-200 bg-white px-2.5 text-[11px] font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            {SPEC_KEYWORDS.map((kw) => (
              <option key={kw.id} value={kw.id}>
                {kw.label}
              </option>
            ))}
          </select>
        </div>

        {!isStudent && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-neutral-500 font-medium">
              Stare tehnică:
            </span>
            {["toate", "DISPONIBILA", "IN_MENTENANTA", "DEFECTA"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onFilterChange("techFilter", st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  filters.techFilter === st
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {st === "toate"
                  ? "Toate"
                  : st === "DISPONIBILA"
                    ? "Funcțională"
                    : st === "IN_MENTENANTA"
                      ? "În mentenanță"
                      : "Defectă"}
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
