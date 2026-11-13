import React from "react"
import { AlertCircle, X } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Department, Faculty, Institution } from "../../types"

interface ModalShellProps {
  title: string
  modalError: string | null
  isSubmitting: boolean
  submitLabel: string
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  children: React.ReactNode
}

function AcademicModalShell({
  title,
  modalError,
  isSubmitting,
  submitLabel,
  onClose,
  onSubmit,
  children,
}: ModalShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-neutral-200 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="text-base font-bold text-neutral-900">{title}</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {modalError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{modalError}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          {children}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Anulează
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-neutral-900 hover:bg-black text-white"
            >
              {isSubmitting ? "Se salvează..." : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface InstitutionModalProps {
  editingInst: Institution | null
  modalError: string | null
  isSubmitting: boolean
  instCod: string
  instOras: string
  instNume: string
  instAdresa: string
  instEmail: string
  instTelefon: string
  instWebsite: string
  onChangeCod: (v: string) => void
  onChangeOras: (v: string) => void
  onChangeNume: (v: string) => void
  onChangeAdresa: (v: string) => void
  onChangeEmail: (v: string) => void
  onChangeTelefon: (v: string) => void
  onChangeWebsite: (v: string) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}

export function InstitutionFormModal({
  editingInst,
  modalError,
  isSubmitting,
  instCod,
  instOras,
  instNume,
  instAdresa,
  instEmail,
  instTelefon,
  instWebsite,
  onChangeCod,
  onChangeOras,
  onChangeNume,
  onChangeAdresa,
  onChangeEmail,
  onChangeTelefon,
  onChangeWebsite,
  onClose,
  onSubmit,
}: InstitutionModalProps) {
  return (
    <AcademicModalShell
      title={editingInst ? `Editează ${editingInst.cod}` : "Adaugă instituție nouă"}
      modalError={modalError}
      isSubmitting={isSubmitting}
      submitLabel="Salvează instituția"
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-semibold text-neutral-700 block mb-1">Cod instituție</label>
          <Input
            type="text"
            placeholder="ex: UPB"
            value={instCod}
            onChange={(e) => onChangeCod(e.target.value)}
            required
            className="h-9 text-xs"
          />
        </div>
        <div>
          <label className="font-semibold text-neutral-700 block mb-1">Oraș</label>
          <Input
            type="text"
            placeholder="ex: București"
            value={instOras}
            onChange={(e) => onChangeOras(e.target.value)}
            required
            className="h-9 text-xs"
          />
        </div>
      </div>

      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Denumire completă</label>
        <Input
          type="text"
          placeholder="ex: Universitatea Națională de Știință și Tehnologie Politehnica"
          value={instNume}
          onChange={(e) => onChangeNume(e.target.value)}
          required
          className="h-9 text-xs"
        />
      </div>

      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Adresă sediu</label>
        <Input
          type="text"
          placeholder="ex: Splaiul Independenței nr. 313"
          value={instAdresa}
          onChange={(e) => onChangeAdresa(e.target.value)}
          required
          className="h-9 text-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-semibold text-neutral-700 block mb-1">Email contact</label>
          <Input
            type="email"
            placeholder="contact@upb.ro"
            value={instEmail}
            onChange={(e) => onChangeEmail(e.target.value)}
            className="h-9 text-xs"
          />
        </div>
        <div>
          <label className="font-semibold text-neutral-700 block mb-1">Telefon</label>
          <Input
            type="text"
            placeholder="+40214029100"
            value={instTelefon}
            onChange={(e) => onChangeTelefon(e.target.value)}
            className="h-9 text-xs"
          />
        </div>
      </div>

      <div>
        <label className="font-semibold text-neutral-700 block mb-1">Website</label>
        <Input
          type="url"
          placeholder="https://upb.ro"
          value={instWebsite}
          onChange={(e) => onChangeWebsite(e.target.value)}
          className="h-9 text-xs"
        />
      </div>
    </AcademicModalShell>
  )
}

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
