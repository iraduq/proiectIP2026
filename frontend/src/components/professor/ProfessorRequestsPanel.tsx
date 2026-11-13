import { Calendar } from "lucide-react"
import { Button } from "../ui/button"
import type { Reservation } from "../../types"
import type { DemoApprovalItem } from "./ProfessorApprovalModal"

export const DEMO_PROFESSOR_ACTIVITIES = [
  {
    id: 201,
    course: "Inteligență artificială și învățare profundă · Grupa 341C1",
    resourceName: "Workstation AI Deep Learning RTX 4090 (Lab 204)",
    timeRange: "Miercuri · 10:00–12:00",
    room: "Lab 204",
  },
  {
    id: 202,
    course: "Sisteme încorporate și timp real · Grupa 332AC",
    resourceName: "Kit NVIDIA Jetson Orin Nano + FPGA Zynq (Lab 210)",
    timeRange: "Joi · 14:00–16:00",
    room: "Lab 210",
  },
]

interface ProfessorRequestsPanelProps {
  canApproveRequests: boolean
  pendingCount: number
  pendingRequests: Reservation[]
  demoApprovals: DemoApprovalItem[]
  myReservations: Reservation[]
  profActivitiesCount: number
  onExamineRequest: (req: Reservation) => void
  onExamineDemoRequest: (item: DemoApprovalItem) => void
  onNavigateGroupBooking: () => void
}

export function ProfessorRequestsPanel({
  canApproveRequests,
  pendingCount,
  pendingRequests,
  demoApprovals,
  myReservations,
  profActivitiesCount,
  onExamineRequest,
  onExamineDemoRequest,
  onNavigateGroupBooking,
}: ProfessorRequestsPanelProps) {
  return (
    <div className="lg:col-span-5 space-y-4">
      {canApproveRequests ? (
        <>
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h2 className="text-sm font-bold text-neutral-900">Aprobări cereri studenți</h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-black text-white">
              {pendingCount} în așteptare
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {pendingRequests.length > 0
              ? pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2 shadow-2xs"
                  >
                    <div className="text-xs font-bold text-neutral-900">
                      {req.utilizator_nume || "Student"}
                    </div>
                    <div className="text-xs text-neutral-800 font-semibold">
                      {req.resursa_nume}
                    </div>
                    <div className="text-[11px] text-neutral-500 leading-snug">{req.scop}</div>
                    <div className="text-[11px] text-neutral-500">
                      {req.data_inceput
                        ? `${new Date(req.data_inceput).toLocaleDateString("ro-RO")} · ${new Date(
                            req.data_inceput
                          ).toLocaleTimeString("ro-RO", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}–${new Date(req.data_sfarsit).toLocaleTimeString("ro-RO", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : "26.10.2026 · 10:00–12:00"}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onExamineRequest(req)}
                      className="w-full h-8 text-xs bg-white text-neutral-900 hover:bg-neutral-50 border-neutral-200 font-medium rounded-lg mt-2"
                    >
                      Examinează cererea
                    </Button>
                  </div>
                ))
              : demoApprovals.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2 shadow-2xs"
                  >
                    <div className="text-xs font-bold text-neutral-900">{item.studentName}</div>
                    <div className="text-xs text-neutral-800 font-semibold">
                      {item.resourceName}
                    </div>
                    <div className="text-[11px] text-neutral-500 leading-snug">{item.scope}</div>
                    <div className="text-[11px] text-neutral-500">{item.timeRange}</div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onExamineDemoRequest(item)}
                      className="w-full h-8 text-xs bg-white text-neutral-900 hover:bg-neutral-50 border-neutral-200 font-medium rounded-lg mt-2"
                    >
                      Examinează cererea
                    </Button>
                  </div>
                ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h2 className="text-sm font-bold text-neutral-900">
              Activități didactice programate
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800">
              {profActivitiesCount} activități
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {myReservations.length > 0
              ? myReservations.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-neutral-200 bg-white space-y-1.5 shadow-2xs"
                  >
                    <div className="text-xs font-bold text-neutral-900">{req.resursa_nume}</div>
                    <div className="text-[11px] text-neutral-600">{req.scop}</div>
                    <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                      <span>
                        {new Date(req.data_inceput).toLocaleDateString("ro-RO")} ·{" "}
                        {new Date(req.data_inceput).toLocaleTimeString("ro-RO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        –
                        {new Date(req.data_sfarsit).toLocaleTimeString("ro-RO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              : DEMO_PROFESSOR_ACTIVITIES.map((act) => (
                  <div
                    key={act.id}
                    className="p-4 rounded-xl border border-neutral-200 bg-white space-y-1.5 shadow-2xs"
                  >
                    <div className="text-xs font-bold text-neutral-900">{act.course}</div>
                    <div className="text-xs text-neutral-700 font-medium">
                      {act.resourceName}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {act.timeRange} · {act.room}
                    </div>
                  </div>
                ))}

            <Button
              variant="outline"
              onClick={onNavigateGroupBooking}
              className="w-full h-9 text-xs border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 font-semibold rounded-xl mt-2"
            >
              Programează laborator pentru o grupă
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
