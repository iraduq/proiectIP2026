import React from "react"
import { Wrench } from "lucide-react"
import { Button } from "../ui/button"
import {
  INTERVENTION_LOG_OPTIONS,
  TECHNICAL_STATE_OPTIONS,
} from "../../data/technicalHistoryConstants"
import type { Resource, StareTehnica } from "../../types"

interface TechnicalLogModalProps {
  resources: Resource[]
  selectedResourceId: number
  logType: string
  logState: StareTehnica
  logDesc: string
  isSubmitting: boolean
  onResourceChange: (id: number) => void
  onTypeChange: (type: string) => void
  onStateChange: (state: StareTehnica) => void
  onDescChange: (desc: string) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}

export function TechnicalLogModal({
  resources,
  selectedResourceId,
  logType,
  logState,
  logDesc,
  isSubmitting,
  onResourceChange,
  onTypeChange,
  onStateChange,
  onDescChange,
  onClose,
  onSubmit,
}: TechnicalLogModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-200 overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-neutral-700" />
            Înregistrează în jurnalul tehnic
          </h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 text-lg">
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Selectează echipamentul
            </label>
            <select
              value={selectedResourceId}
              onChange={(e) => onResourceChange(Number(e.target.value))}
              className="w-full h-9 rounded-md border border-neutral-200 bg-white px-3 text-xs"
            >
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.cod_inventar} - {r.nume} ({r.stare_tehnica})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Tip intervenție
              </label>
              <select
                value={logType}
                onChange={(e) => onTypeChange(e.target.value)}
                className="w-full h-9 rounded-md border border-neutral-200 bg-white px-3 text-xs"
              >
                {INTERVENTION_LOG_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Stare nouă rezultată
              </label>
              <select
                value={logState}
                onChange={(e) => onStateChange(e.target.value as StareTehnica)}
                className="w-full h-9 rounded-md border border-neutral-200 bg-white px-3 text-xs"
              >
                {TECHNICAL_STATE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Descriere detaliată a intervenției
            </label>
            <textarea
              required
              rows={3}
              placeholder="Specificați ce operațiuni au fost realizate sau ce probleme au fost constatate..."
              value={logDesc}
              onChange={(e) => onDescChange(e.target.value)}
              className="w-full text-xs rounded-md border border-neutral-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs">
              Anulează
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !logDesc.trim()}
              className="bg-black hover:bg-neutral-800 text-white text-xs"
            >
              {isSubmitting ? "Se înregistrează..." : "Salvează eveniment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
