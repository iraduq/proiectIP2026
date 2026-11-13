import { Compass, X } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import type { Room, Department } from "../../types"

export interface RoomFormState {
  departament_id: string
  nume: string
  cod: string
  etaj: string
  capacitate: string
  descriere: string
}

interface RoomFormModalProps {
  isOpen: boolean
  editingRoom: Room | null
  formData: RoomFormState
  formError: string | null
  isSubmitting: boolean
  departments: Department[]
  onClose: () => void
  onChange: (next: RoomFormState) => void
  onSubmit: (e: React.FormEvent) => void
}

export function RoomFormModal({
  isOpen,
  editingRoom,
  formData,
  formError,
  isSubmitting,
  departments,
  onClose,
  onChange,
  onSubmit,
}: RoomFormModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-neutral-900" />
            <h2 className="text-base font-bold text-neutral-900">
              {editingRoom ? "Editează laborator sau sală" : "Adaugă laborator sau sală"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
              {formError}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="departament_id" className="text-xs font-semibold text-neutral-700">
              Departament
            </label>
            <select
              id="departament_id"
              required
              value={formData.departament_id}
              onChange={(e) => onChange({ ...formData, departament_id: e.target.value })}
              className="w-full h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm"
            >
              <option value="" disabled>
                Selectează departamentul
              </option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nume} ({d.cod})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="cod" className="text-xs font-semibold text-neutral-700">
                Cod sală / indicativ
              </label>
              <Input
                id="cod"
                required
                placeholder="UPT-AC-CTI-L1"
                value={formData.cod}
                onChange={(e) => onChange({ ...formData, cod: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="etaj" className="text-xs font-semibold text-neutral-700">
                Etaj (-1 subsol, 0 parter, 1, 2)
              </label>
              <Input
                id="etaj"
                type="number"
                min={-2}
                max={10}
                placeholder="2"
                value={formData.etaj}
                onChange={(e) => onChange({ ...formData, etaj: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="nume" className="text-xs font-semibold text-neutral-700">
              Denumire laborator
            </label>
            <Input
              id="nume"
              required
              placeholder="Laborator inteligență artificială (Lab 204)"
              value={formData.nume}
              onChange={(e) => onChange({ ...formData, nume: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="capacitate" className="text-xs font-semibold text-neutral-700">
              Capacitate (locuri de lucru)
            </label>
            <Input
              id="capacitate"
              type="number"
              min={1}
              placeholder="28"
              value={formData.capacitate}
              onChange={(e) => onChange({ ...formData, capacitate: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="descriere" className="text-xs font-semibold text-neutral-700">
              Detalii orientare și dotări principale
            </label>
            <Input
              id="descriere"
              placeholder="Indicații de acces și echipamente găzduite..."
              value={formData.descriere}
              onChange={(e) => onChange({ ...formData, descriere: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Anulează
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Se salvează..." : "Salvează"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
