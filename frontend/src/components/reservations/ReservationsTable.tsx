import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  RotateCcw,
  X,
  XCircle,
} from "lucide-react"
import { Button } from "../ui/button"
import type { Reservation, StareRezervare } from "../../types"

interface ReservationsTableProps {
  reservations: Reservation[]
  isLoading: boolean
  activeTab: "MY" | "MANAGEMENT"
  currentUserId?: number
  currentUserRole?: string
  canApprove: boolean
  canReturn: boolean
  onCancel: (id: number, name: string) => void
  onApprove: (id: number, name: string) => void
  onOpenReject: (res: Reservation) => void
  onOpenReturn: (res: Reservation) => void
}

function getStatusBadge(stare: StareRezervare) {
  switch (stare) {
    case "IN_ASTEPTARE":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="h-3.5 w-3.5" />
          În așteptare
        </span>
      )
    case "APROBATA":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Aprobată
        </span>
      )
    case "FINALIZATA":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Check className="h-3.5 w-3.5" />
          Finalizată / returnată
        </span>
      )
    case "RESPINSA":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="h-3.5 w-3.5" />
          Respinsă
        </span>
      )
    case "ANULATA":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
          <RotateCcw className="h-3.5 w-3.5" />
          Anulată
        </span>
      )
  }
}

export function ReservationsTable({
  reservations,
  isLoading,
  activeTab,
  currentUserId,
  currentUserRole,
  canApprove,
  canReturn,
  onCancel,
  onApprove,
  onOpenReject,
  onOpenReturn,
}: ReservationsTableProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      {isLoading ? (
        <div className="p-12 text-center text-neutral-500 space-y-3">
          <div className="h-7 w-7 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-xs font-medium">Se încarcă rezervările...</div>
        </div>
      ) : reservations.length === 0 ? (
        <div className="p-16 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="font-semibold text-neutral-800 text-sm">Nicio rezervare găsită</div>
          <div className="text-xs text-neutral-500 max-w-sm mx-auto">
            Nu există rezervări înregistrate care să corespundă filtrului selectat.
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Echipament și locație</th>
                <th className="py-3.5 px-4">Solicitant</th>
                <th className="py-3.5 px-4">Interval orar rezervare</th>
                <th className="py-3.5 px-4">Scop didactic / cercetare</th>
                <th className="py-3.5 px-4">Stare</th>
                <th className="py-3.5 px-4 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {reservations.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-neutral-900">{r.resursa_nume}</div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500 font-mono">
                      <span>{r.resursa_cod}</span>
                      {r.sala_nume && <span>• Sala {r.sala_nume}</span>}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-neutral-900">{r.utilizator_nume}</div>
                    <div className="text-[11px] text-neutral-500">
                      {r.numar_matricol ? `Matricol: ${r.numar_matricol}` : r.utilizator_email}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-neutral-900">
                      {new Date(r.data_inceput).toLocaleDateString("ro-RO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      până la{" "}
                      {new Date(r.data_sfarsit).toLocaleDateString("ro-RO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="text-neutral-700 leading-snug line-clamp-2">{r.scop}</div>
                    {r.motiv_respingere && (
                      <div className="text-[11px] text-rose-600 font-medium mt-1">
                        Motiv respingere: {r.motiv_respingere}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">{getStatusBadge(r.stare)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {(r.stare === "IN_ASTEPTARE" || r.stare === "APROBATA") &&
                        (r.utilizator_id === currentUserId || currentUserRole === "ADMINISTRATOR") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onCancel(r.id, r.resursa_nume || "Resursă")}
                            className="h-8 text-xs text-neutral-600 hover:text-rose-600"
                          >
                            Anulează
                          </Button>
                        )}

                      {activeTab === "MANAGEMENT" && (
                        <>
                          {canApprove && r.stare === "IN_ASTEPTARE" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => onApprove(r.id, r.resursa_nume || "Resursă")}
                                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Aprobă
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onOpenReject(r)}
                                className="h-8 text-xs text-rose-600 hover:bg-rose-50 border-rose-200 gap-1"
                              >
                                <X className="h-3.5 w-3.5" />
                                Respinge
                              </Button>
                            </>
                          )}

                          {canReturn && r.stare === "APROBATA" && (
                            <Button
                              size="sm"
                              onClick={() => onOpenReturn(r)}
                              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1 shadow-sm"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Confirmă retur
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
