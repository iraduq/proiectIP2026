import { CheckCircle2, XCircle } from "lucide-react"
import { Button } from "../ui/button"
import type { Reservation } from "../../types"

interface ReservationActionModalsProps {
  returnModalReservation: Reservation | null
  returnCondition: "DISPONIBILA" | "IN_MENTENANTA" | "DEFECTA"
  onReturnConditionChange: (val: "DISPONIBILA" | "IN_MENTENANTA" | "DEFECTA") => void
  returnNotes: string
  onReturnNotesChange: (val: string) => void
  isSubmittingReturn: boolean
  onCloseReturnModal: () => void
  onConfirmReturn: (e: React.FormEvent) => void
  rejectModalReservation: Reservation | null
  rejectionReason: string
  onRejectionReasonChange: (val: string) => void
  isRejecting: boolean
  onCloseRejectModal: () => void
  onConfirmReject: (e: React.FormEvent) => void
}

export function ReservationActionModals({
  returnModalReservation,
  returnCondition,
  onReturnConditionChange,
  returnNotes,
  onReturnNotesChange,
  isSubmittingReturn,
  onCloseReturnModal,
  onConfirmReturn,
  rejectModalReservation,
  rejectionReason,
  onRejectionReasonChange,
  isRejecting,
  onCloseRejectModal,
  onConfirmReject,
}: ReservationActionModalsProps) {
  return (
    <>
      {returnModalReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-neutral-800" />
                Înregistrare predare / retur fizic
              </h3>
              <button
                type="button"
                onClick={onCloseReturnModal}
                className="text-neutral-400 hover:text-neutral-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onConfirmReturn} className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1">
                <div>
                  <span className="font-semibold text-neutral-700">Echipament: </span>
                  <span className="text-neutral-900 font-medium">
                    {returnModalReservation.resursa_nume}
                  </span>{" "}
                  ({returnModalReservation.resursa_cod})
                </div>
                <div>
                  <span className="font-semibold text-neutral-700">Utilizator: </span>
                  <span className="text-neutral-900">
                    {returnModalReservation.utilizator_nume}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  Stare echipament la returnare
                </label>
                <select
                  value={returnCondition}
                  onChange={(e) =>
                    onReturnConditionChange(
                      e.target.value as "DISPONIBILA" | "IN_MENTENANTA" | "DEFECTA"
                    )
                  }
                  className="w-full h-9 rounded-lg border border-neutral-200 bg-white px-3 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="DISPONIBILA">Funcțional / conform (disponibil imediat)</option>
                  <option value="IN_MENTENANTA">Necesită verificare / mentenanță</option>
                  <option value="DEFECTA">Defect / deteriorat în utilizare</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Observații tehnice (opțional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Consemnați starea la primire sau eventualele defecțiuni..."
                  value={returnNotes}
                  onChange={(e) => onReturnNotesChange(e.target.value)}
                  className="w-full text-xs rounded-lg border border-neutral-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCloseReturnModal}
                  className="text-xs"
                >
                  Anulează
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="bg-black hover:bg-neutral-800 text-white text-xs"
                >
                  {isSubmittingReturn ? "Se înregistrează..." : "Confirmă returul"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {rejectModalReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-rose-600" />
                Respinge cererea de rezervare
              </h3>
              <button
                type="button"
                onClick={onCloseRejectModal}
                className="text-neutral-400 hover:text-neutral-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onConfirmReject} className="p-6 space-y-4">
              <div className="text-xs text-neutral-600">
                Specificați motivul pentru care cererea studentului{" "}
                <span className="font-semibold text-neutral-900">
                  {rejectModalReservation.utilizator_nume}
                </span>{" "}
                este respinsă:
              </div>
              <div>
                <textarea
                  required
                  rows={3}
                  placeholder="ex: Echipamentul este rezervat pentru o sesiune de laborator didactic..."
                  value={rejectionReason}
                  onChange={(e) => onRejectionReasonChange(e.target.value)}
                  className="w-full text-xs rounded-md border border-neutral-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCloseRejectModal}
                  className="text-xs"
                >
                  Anulează
                </Button>
                <Button
                  type="submit"
                  disabled={isRejecting || !rejectionReason.trim()}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
                >
                  {isRejecting ? "Se respinge..." : "Confirmă respingerea"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
