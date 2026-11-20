import React from "react"
import { Input } from "../../../components/ui/input"
import type { Department, Faculty } from "../../../types"
import { AcademicModalShell } from "./AcademicModalShell"

interface DepartmentModalProps {
  editingDept: Department | null
  faculties: Faculty[]
  modalError: string | null
  isSubmitting: boolean
  deptFacultateId: number | ""
  deptCod: string
  deptNume: string
  deptSefId: string
  deptDescriere: string
  onChangeFacultateId: (v: number) => void
  onChangeCod: (v: string) => void
  onChangeNume: (v: string) => void
  onChangeSefId: (v: string) => void
  onChangeDescriere: (v: string) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}

export function DepartmentFormModal({
  editingDept,
  faculties,
  modalError,
  isSubmitting,
  deptFacultateId,
  deptCod,
  deptNume,
  deptSefId,
  deptDescriere,
  onChangeFacultateId,
  onChangeCod,
  onChangeNume,
  onChangeSefId,
  onChangeDescriere,
  onClose,
  onSubmit,
}: DepartmentModalProps) {
  return (
    <AcademicModalShell
      title={editingDept ? `Editează ${editingDept.cod}` : "Adaugă departament nou"}
      modalError={modalError}
      isSubmitting={isSubmitting}
      submitLabel="Salvează departamentul"
      onClose={onClose}
      onSubmit={onSubmit}
    >
      {!editingDept && (
        <div>
          <label className="font-semibold text-neutral-700 block mb-1">Facultate părinte</label>
          <select
            value={deptFacultateId}
            onChange={(e) => onChangeFacultateId(Number(e.target.value))}
            className="w-full h-9 rounded-lg border border-neutral-200 px-3 bg-neutral-50 text-xs"
            required
          >
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nume} ({f.cod}) - {f.institutie_nume}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-semibold text-neutral-700 block mb-1">Cod departament</label>
          <Input
            type="text"
            placeholder="ex: CALCULATOARE"
            value={deptCod}
            onChange={(e) => onChangeCod(e.target.value)}
            required
            className="h-9 text-xs"
          />
        </div>
        <div>
          <label className="font-semibold text-neutral-700 block mb-1">Denumire departament</label>
          <Input
            type="text"
            placeholder="ex: Calculatoare și Tehnologia Informației"
            value={deptNume}
            onChange={(e) => onChangeNume(e.target.value)}
            required
            className="h-9 text-xs"
          />
        </div>
      </div>

      <div>
        <label className="font-semibold text-neutral-700 block mb-1">
          ID utilizator șef departament (profesor - opțional)
        </label>
        <Input
          type="number"
          placeholder="Lăsați gol dacă nu este atribuit"
          value={deptSefId}
          onChange={(e) => onChangeSefId(e.target.value)}
          className="h-9 text-xs"
        />
      </div>

      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Descriere (opțional)</label>
        <textarea
          value={deptDescriere}
          onChange={(e) => onChangeDescriere(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-neutral-200 p-2 text-xs bg-neutral-50 focus:bg-white focus:outline-none"
        />
      </div>
    </AcademicModalShell>
  )
}
