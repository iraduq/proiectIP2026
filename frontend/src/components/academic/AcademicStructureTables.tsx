import { Pencil, Power, Trash2 } from "lucide-react"
import { Badge } from "../ui/badge"
import { Card } from "../ui/card"
import { Department, Faculty } from "../../types"

interface RowActionsProps {
  isActive: boolean
  editTitle: string
  toggleTitle: string
  deleteTitle: string
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}

function AcademicRowActions({
  isActive,
  editTitle,
  toggleTitle,
  deleteTitle,
  onEdit,
  onToggle,
  onDelete,
}: RowActionsProps) {
  return (
    <td className="py-3 px-5 text-right">
      <div className="flex items-center justify-end gap-1.5">
        <button
          onClick={onEdit}
          className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded"
          title={editTitle}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onToggle}
          className={`p-1.5 rounded ${
            isActive ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"
          }`}
          title={toggleTitle}
        >
          <Power className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
          title={deleteTitle}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </td>
  )
}

interface FacultiesTableProps {
  faculties: Faculty[]
  isLoading: boolean
  isAdmin: boolean
  onEdit: (fac: Faculty) => void
  onToggle: (fac: Faculty) => void
  onDelete: (fac: Faculty) => void
}

export function FacultiesTable({
  faculties,
  isLoading,
  isAdmin,
  onEdit,
  onToggle,
  onDelete,
}: FacultiesTableProps) {
  return (
    <Card className="rounded-2xl border-neutral-200 shadow-sm overflow-hidden">
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-100">
            <tr>
              <th className="py-3 px-5">Cod</th>
              <th className="py-3 px-5">Denumire facultate</th>
              <th className="py-3 px-5">Instituție</th>
              <th className="py-3 px-5">Descriere</th>
              <th className="py-3 px-5">Stare</th>
              {isAdmin && <th className="py-3 px-5 text-right">Acțiuni</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-400">
                  Se încarcă facultățile...
                </td>
              </tr>
            ) : faculties.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-400">
                  Nicio facultate găsită.
                </td>
              </tr>
            ) : (
              faculties.map((f) => (
                <tr key={f.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-3 px-5 font-mono font-bold text-neutral-900">{f.cod}</td>
                  <td className="py-3 px-5 font-medium text-neutral-800">{f.nume}</td>
                  <td className="py-3 px-5 text-neutral-500">{f.institutie_nume}</td>
                  <td className="py-3 px-5 text-neutral-500 max-w-xs truncate">
                    {f.descriere || "-"}
                  </td>
                  <td className="py-3 px-5">
                    <Badge variant={f.is_active ? "success" : "secondary"}>
                      {f.is_active ? "Activă" : "Inactivă"}
                    </Badge>
                  </td>
                  {isAdmin && (
                    <AcademicRowActions
                      isActive={f.is_active}
                      editTitle="Editează facultate"
                      toggleTitle={f.is_active ? "Dezactivează facultatea" : "Activează facultatea"}
                      deleteTitle="Șterge facultate"
                      onEdit={() => onEdit(f)}
                      onToggle={() => onToggle(f)}
                      onDelete={() => onDelete(f)}
                    />
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

interface DepartmentsTableProps {
  departments: Department[]
  isLoading: boolean
  isAdmin: boolean
  onEdit: (dept: Department) => void
  onToggle: (dept: Department) => void
  onDelete: (dept: Department) => void
}

export function DepartmentsTable({
  departments,
  isLoading,
  isAdmin,
  onEdit,
  onToggle,
  onDelete,
}: DepartmentsTableProps) {
  return (
    <Card className="rounded-2xl border-neutral-200 shadow-sm overflow-hidden">
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-100">
            <tr>
              <th className="py-3 px-5">Cod</th>
              <th className="py-3 px-5">Departament</th>
              <th className="py-3 px-5">Facultate</th>
              <th className="py-3 px-5">Șef departament</th>
              <th className="py-3 px-5">Stare</th>
              {isAdmin && <th className="py-3 px-5 text-right">Acțiuni</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-400">
                  Se încarcă departamentele...
                </td>
              </tr>
            ) : departments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-400">
                  Niciun departament găsit.
                </td>
              </tr>
            ) : (
              departments.map((d) => (
                <tr key={d.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-3 px-5 font-mono font-bold text-neutral-900">{d.cod}</td>
                  <td className="py-3 px-5 font-medium text-neutral-800">{d.nume}</td>
                  <td className="py-3 px-5 text-neutral-500">{d.facultate_nume}</td>
                  <td className="py-3 px-5 text-neutral-700 font-medium">
                    {d.sef_departament?.nume || "Neatribuit"}
                  </td>
                  <td className="py-3 px-5">
                    <Badge variant={d.is_active ? "success" : "secondary"}>
                      {d.is_active ? "Activ" : "Inactiv"}
                    </Badge>
                  </td>
                  {isAdmin && (
                    <AcademicRowActions
                      isActive={d.is_active}
                      editTitle="Editează departament"
                      toggleTitle={
                        d.is_active ? "Dezactivează departamentul" : "Activează departamentul"
                      }
                      deleteTitle="Șterge departament"
                      onEdit={() => onEdit(d)}
                      onToggle={() => onToggle(d)}
                      onDelete={() => onDelete(d)}
                    />
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
