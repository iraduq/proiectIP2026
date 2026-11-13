import { Plus } from "lucide-react"
import { Button } from "../ui/button"
import type { AcademicTab } from "./AcademicFilterBar"

interface AcademicHeaderProps {
  isAdmin: boolean
  tab: AcademicTab
  institutionsCount: number
  facultiesCount: number
  departmentsCount: number
  onTabChange: (tab: AcademicTab) => void
  onAddInstitution: () => void
  onAddFaculty: () => void
  onAddDepartment: () => void
}

export function AcademicHeader({
  isAdmin,
  tab,
  institutionsCount,
  facultiesCount,
  departmentsCount,
  onTabChange,
  onAddInstitution,
  onAddFaculty,
  onAddDepartment,
}: AcademicHeaderProps) {
  const tabs: { key: AcademicTab; label: string; addLabel: string; onAdd: () => void }[] = [
    {
      key: "institutions",
      label: `Instituții (${institutionsCount})`,
      addLabel: "Adaugă instituție",
      onAdd: onAddInstitution,
    },
    {
      key: "faculties",
      label: `Facultăți (${facultiesCount})`,
      addLabel: "Adaugă facultate",
      onAdd: onAddFaculty,
    },
    {
      key: "departments",
      label: `Departamente (${departmentsCount})`,
      addLabel: "Adaugă departament",
      onAdd: onAddDepartment,
    },
  ]

  const activeTabConfig = tabs.find((t) => t.key === tab) || tabs[0]

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Structură academică</h1>
        <p className="text-xs text-neutral-500 mt-1">
          {isAdmin
            ? "Gestiune completă a instituțiilor, facultăților și departamentelor"
            : "Vizualizează ierarhia instituțiilor, facultăților și departamentelor"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                tab === item.key
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {isAdmin && (
          <Button
            onClick={activeTabConfig.onAdd}
            size="sm"
            className="h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>{activeTabConfig.addLabel}</span>
          </Button>
        )}
      </div>
    </div>
  )
}
