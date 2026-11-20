import React from "react"
import { AlertCircle, X } from "lucide-react"
import { Button } from "../../../components/ui/button"

export interface ModalShellProps {
  title: string
  modalError: string | null
  isSubmitting: boolean
  submitLabel: string
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  children: React.ReactNode
}

export function AcademicModalShell({
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
