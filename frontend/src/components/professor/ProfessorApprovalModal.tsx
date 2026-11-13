import { X } from "lucide-react"
import { Button } from "../ui/button"
import type { Reservation } from "../../types"

export interface DemoApprovalItem {
  id: number
  studentName: string
  resourceName: string
  scope: string
  timeRange: string
}

interface ProfessorApprovalModalProps {
  selectedRequest: Reservation | null
  selectedDemoRequest: DemoApprovalItem | null
  rejectionReason: string
  onRejectionReasonChange: (val: string) => void
  isActing: boolean
  onCloseRequest: () => void
  onCloseDemoRequest: () => void
  onApprove: (id: number) => void
  onReject: (id: number) => void
  onApproveDemo: (id: number) => void
  onRejectDemo: (id: number) => void
}

export function ProfessorApprovalModal({
  selectedRequest,
  selectedDemoRequest,
  rejectionReason,
  onRejectionReasonChange,
  isActing,
  onCloseRequest,
  onCloseDemoRequest,
  onApprove,
  onReject,
  onApproveDemo,
  onRejectDemo,
}: ProfessorApprovalModalProps) {
  return (
    <>
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-200 overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-neutral-900">
                  Examinare cerere de rezervare
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Decizie de aprobare sau respingere de către reprezentantul de laborator
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseRequest}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                    Student
                  </span>
                  <span className="font-semibold text-neutral-900">
                    {selectedRequest.utilizator_nume}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                    Email
                  </span>
                  <span className="text-neutral-800">{selectedRequest.utilizator_email}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                    Echipament
                  </span>
                  <span className="font-semibold text-neutral-900">
                    {selectedRequest.resursa_nume}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                    Sală
                  </span>
                  <span className="text-neutral-800">{selectedRequest.sala_nume}</span>
                </div>
              </div>

              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-bold mb-1">
                  Scopul utilizării
                </span>
                <p className="text-neutral-800 bg-neutral-50 p-3 rounded-xl border border-neutral-100 leading-relaxed">
                  {selectedRequest.scop}
                </p>
              </div>

              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-bold mb-1">
                  Interval solicitat
                </span>
                <p className="text-neutral-800 font-mono bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                  {new Date(selectedRequest.data_inceput).toLocaleDateString("ro-RO")} ·{" "}
                  {new Date(selectedRequest.data_inceput).toLocaleTimeString("ro-RO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(selectedRequest.data_sfarsit).toLocaleTimeString("ro-RO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-neutral-700">
                  Motiv respingere (obligatoriu doar pentru respingere)
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => onRejectionReasonChange(e.target.value)}
                  placeholder="Introduceți motivul respingerii..."
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-100">
                <Button
                  variant="outline"
                  onClick={() => onReject(selectedRequest.id)}
                  disabled={isActing}
                  className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  Respinge cererea
                </Button>
                <Button
                  onClick={() => onApprove(selectedRequest.id)}
                  disabled={isActing}
                  className="text-xs bg-black hover:bg-neutral-800 text-white"
                >
                  Aprobă cererea
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedDemoRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-200 overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-neutral-900">
                  Examinare cerere de rezervare
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Decizie de aprobare sau respingere de către reprezentantul de laborator
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseDemoRequest}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                    Student
                  </span>
                  <span className="font-semibold text-neutral-900">
                    {selectedDemoRequest.studentName}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                    Echipament
                  </span>
                  <span className="font-semibold text-neutral-900">
                    {selectedDemoRequest.resourceName}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-bold mb-1">
                  Scopul utilizării
                </span>
                <p className="text-neutral-800 bg-neutral-50 p-3 rounded-xl border border-neutral-100 leading-relaxed">
                  {selectedDemoRequest.scope}
                </p>
              </div>

              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-bold mb-1">
                  Interval solicitat
                </span>
                <p className="text-neutral-800 font-mono bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                  {selectedDemoRequest.timeRange}
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-neutral-700">
                  Motiv respingere (obligatoriu doar pentru respingere)
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => onRejectionReasonChange(e.target.value)}
                  placeholder="Introduceți motivul respingerii..."
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-100">
                <Button
                  variant="outline"
                  onClick={() => onRejectDemo(selectedDemoRequest.id)}
                  className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  Respinge cererea
                </Button>
                <Button
                  onClick={() => onApproveDemo(selectedDemoRequest.id)}
                  className="text-xs bg-black hover:bg-neutral-800 text-white"
                >
                  Aprobă cererea
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
