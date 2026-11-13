import React from "react"
import { Search } from "lucide-react"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Input } from "../ui/input"
import { Faculty, Institution } from "../../types"

export type AcademicTab = "institutions" | "faculties" | "departments"

interface AcademicFilterBarProps {
  tab: AcademicTab
  search: string
  onSearchChange: (value: string) => void
  filterInstitutionId?: number
  onFilterInstitutionChange: (value?: number) => void
  filterFacultyId?: number
  onFilterFacultyChange: (value?: number) => void
  institutions: Institution[]
  faculties: Faculty[]
  onSubmit: (e: React.FormEvent) => void
}

export function AcademicFilterBar({
  tab,
  search,
  onSearchChange,
  filterInstitutionId,
  onFilterInstitutionChange,
  filterFacultyId,
  onFilterFacultyChange,
  institutions,
  faculties,
  onSubmit,
}: AcademicFilterBarProps) {
  const placeholderSuffix =
    tab === "institutions"
      ? "instituții..."
      : tab === "faculties"
      ? "facultăți..."
      : "departamente..."

  const filteredFaculties = filterInstitutionId
    ? faculties.filter((f) => f.institutie_id === filterInstitutionId)
    : faculties

  return (
    <Card className="rounded-2xl border-neutral-200 shadow-sm p-4 bg-white">
      <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            type="text"
            placeholder={`Caută în ${placeholderSuffix}`}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-9 text-xs bg-neutral-50 border-neutral-200"
          />
        </div>

        {(tab === "faculties" || tab === "departments") && (
          <select
            value={filterInstitutionId || ""}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined
              onFilterInstitutionChange(val)
              if (tab === "departments") {
                onFilterFacultyChange(undefined)
              }
            }}
            className="h-9 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 text-xs text-neutral-800"
          >
            <option value="">Toate instituțiile</option>
            {institutions.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nume} ({i.cod})
              </option>
            ))}
          </select>
        )}

        {tab === "departments" && (
          <select
            value={filterFacultyId || ""}
            onChange={(e) =>
              onFilterFacultyChange(e.target.value ? Number(e.target.value) : undefined)
            }
            className="h-9 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 text-xs text-neutral-800"
          >
            <option value="">Toate facultățile</option>
            {filteredFaculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nume} ({f.cod})
              </option>
            ))}
          </select>
        )}

        <Button
          type="submit"
          size="sm"
          className="h-9 text-xs bg-neutral-900 hover:bg-black font-semibold"
        >
          Filtrează
        </Button>
      </form>
    </Card>
  )
}
