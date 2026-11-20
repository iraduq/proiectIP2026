import React from "react"
import { Input } from "../../../components/ui/input"
import type { Faculty, Institution } from "../../../types"
import { AcademicModalShell } from "./AcademicModalShell"

interface FacultyModalProps {
  editingFac: Faculty | null
  institutions: Institution[]
  modalError: string | null
  isSubmitting: boolean
  facInstitutieId: number | ""
  facCod: string
  facNume: string
  facDescriere: string
  onChangeInstitutieId: (v: number) => void
  onChangeCod: (v: string) => void
  onChangeNume: (v: string) => void
  onChangeDescriere: (v: string) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}

export function FacultyFormModal({
  editingFac,
  institutions,
  modalError,
  isSubmitting,
  facInstitutieId,
  facCod,
  facNume,
  facDescriere,
  onChangeInstitutieId,
  onChangeCod,
  onChangeNume,
  onChangeDescriere,
  onClose,
  onSubmit,
}: FacultyModalProps) {
  return (
    <AcademicModalShell
      title={editingFac ? `Editează ${editingFac.cod}` : "Adaugă facultate nouă"}
      modalError={modalError}
      isSubmitting={isSubmitting}
      submitLabel="Salvează facultatea"
      onClose={onClose}
      onSubmit={onSubmit}
    >
      {!editingFac && (
        <div>
          <label className="font-semibold text-neutral-700 block mb-1">Instituție părinte</label>
          <select
            value={facInstitutieId}
            onChange={(e) => onChangeInstitutieId(Number(e.target.value))}
            className="w-full h-9 rounded-lg border border-neutral-200 px-3 bg-neutral-50 text-xs"
            required
          >
            {institutions.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nume} ({i.cod})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-semibold text-neutral-700 block mb-1">Cod facultate</label>
          <Input
            type="text"
            placeholder="ex: ACS"
            value={facCod}
            onChange={(e) => onChangeCod(e.target.value)}
            required
            className="h-9 text-xs"
          />
        </div>
        <div>
          <label className="font-semibold text-neutral-700 block mb-1">Denumire facultate</label>
          <Input
            type="text"
            placeholder="ex: Automatică și Calculatoare"
            value={facNume}
            onChange={(e) => onChangeNume(e.target.value)}
            required
            className="h-9 text-xs"
          />
        </div>
      </div>

      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Descriere (opțional)</label>
        <textarea
          value={facDescriere}
          onChange={(e) => onChangeDescriere(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-neutral-200 p-2 text-xs bg-neutral-50 focus:bg-white focus:outline-none"
        />
      </div>
    </AcademicModalShell>
  )
}
