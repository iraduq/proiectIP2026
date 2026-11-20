import React from "react"
import { Input } from "../../../components/ui/input"
import type { Institution } from "../../../types"
import { AcademicModalShell } from "./AcademicModalShell"

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
