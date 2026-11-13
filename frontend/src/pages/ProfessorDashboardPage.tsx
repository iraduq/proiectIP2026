import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, CheckCircle2, AlertCircle, Wrench } from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { resourcesApi } from "../api/resources"
import { reservationsApi } from "../api/reservations"
import type { Resource, Reservation } from "../types"
import { Button } from "../components/ui/button"
import {
  ProfessorApprovalModal,
  type DemoApprovalItem,
} from "../components/professor/ProfessorApprovalModal"
import {
  ProfessorRequestsPanel,
  DEMO_PROFESSOR_ACTIVITIES,
} from "../components/professor/ProfessorRequestsPanel"

const DEMO_CATALOG_ITEMS = [
  {
    id: 1,
    nume: "Braț robotic educațional Niryo Ned 2",
    cod_inventar: "INV-USV-2026-088",
    sala_cod: "Lab 208",
    specs: "6 axe, ROS2",
    imagine_url:
      "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    nume: "Kit NVIDIA Jetson Orin Nano Dev Kit",
    cod_inventar: "INV-USV-2026-102",
    sala_cod: "Lab 210",
    specs: "40 TOPS",
    imagine_url:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    nume: "Osciloscop digital Rohde & Schwarz RTB2004",
    cod_inventar: "INV-USV-2026-215",
    sala_cod: "Lab 105",
    specs: "300 MHz",
    imagine_url:
      "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80",
  },
]

const DEMO_APPROVALS: DemoApprovalItem[] = [
  {
    id: 101,
    studentName: "Radu Ivan",
    resourceName: "Bambu Lab X1-Carbon AMS",
    scope: "Proiect de licență · AIA",
    timeRange: "26.10.2026 · 10:00–12:00",
  },
  {
    id: 102,
    studentName: "Mircea Marius",
    resourceName: "Niryo Ned 2",
    scope: "Proiect de robotică · Calculatoare",
    timeRange: "27.10.2026 · 12:00–14:00",
  },
  {
    id: 103,
    studentName: "Stelica Vali",
    resourceName: "Rohde & Schwarz RTB2004",
    scope: "Măsurători de laborator · AIA",
    timeRange: "28.10.2026 · 10:00–12:00",
  },
]

export function ProfessorDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const canApproveRequests =
    user?.rol === "RESPONSABIL_LABORATOR" ||
    user?.rol === "ADMINISTRATOR" ||
    Boolean(user?.permissions?.includes("bookings:approve"))

  const roleBadgeLabel =
    user?.rol === "RESPONSABIL_LABORATOR"
      ? "Reprezentant laborator"
      : user?.rol === "ADMINISTRATOR"
      ? "Administrator"
      : "Profesor"

  const [resources, setResources] = useState<Resource[]>([])
  const [pendingRequests, setPendingRequests] = useState<Reservation[]>([])
  const [myReservations, setMyReservations] = useState<Reservation[]>([])
  const [selectedRequest, setSelectedRequest] = useState<Reservation | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isActing, setIsActing] = useState(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [demoApprovals, setDemoApprovals] = useState<DemoApprovalItem[]>(DEMO_APPROVALS)
  const [selectedDemoRequest, setSelectedDemoRequest] = useState<DemoApprovalItem | null>(null)

  const loadDashboardData = useCallback(async () => {
    try {
      const resData = await resourcesApi.getResources({ limit: 16 })
      setResources(resData.items)

      if (canApproveRequests) {
        const reqData = await reservationsApi.getReservations({
          stare: "IN_ASTEPTARE",
          limit: 10,
        })
        setPendingRequests(reqData.items)
      } else {
        const ownData = await reservationsApi.getReservations({
          utilizator_id: user?.id_utilizator,
          limit: 10,
        })
        setMyReservations(ownData.items)
      }
    } catch {
    }
  }, [canApproveRequests, user?.id_utilizator])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handleApprove = async (id: number) => {
    setIsActing(true)
    setActionError(null)
    try {
      await reservationsApi.approveReservation(id)
      setActionSuccess("Rezervarea a fost aprobată de reprezentantul de laborator.")
      setSelectedRequest(null)
      loadDashboardData()
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: string } } }
      setActionError(errorObj.response?.data?.detail || "Eroare la aprobare.")
    } finally {
      setIsActing(false)
    }
  }

  const handleReject = async (id: number) => {
    if (!rejectionReason.trim()) {
      setActionError("Motivul respingerii este obligatoriu.")
      return
    }
    setIsActing(true)
    setActionError(null)
    try {
      await reservationsApi.rejectReservation(id, rejectionReason.trim())
      setActionSuccess("Rezervarea a fost respinsă.")
      setSelectedRequest(null)
      setRejectionReason("")
      loadDashboardData()
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: string } } }
      setActionError(errorObj.response?.data?.detail || "Eroare la respingere.")
    } finally {
      setIsActing(false)
    }
  }

  const handleApproveDemo = (id: number) => {
    setDemoApprovals((prev) => prev.filter((item) => item.id !== id))
    setSelectedDemoRequest(null)
    setActionSuccess("Cererea studentului a fost aprobată de reprezentantul de laborator.")
  }

  const handleRejectDemo = (id: number) => {
    if (!rejectionReason.trim()) {
      setActionError("Motivul respingerii este obligatoriu.")
      return
    }
    setDemoApprovals((prev) => prev.filter((item) => item.id !== id))
    setSelectedDemoRequest(null)
    setRejectionReason("")
    setActionSuccess("Cererea studentului a fost respinsă.")
  }

  const displayCatalog = resources.length >= 3 ? resources.slice(0, 3) : DEMO_CATALOG_ITEMS
  const pendingCount =
    pendingRequests.length > 0 ? pendingRequests.length : demoApprovals.length
  const profActivitiesCount =
    myReservations.length > 0 ? myReservations.length : DEMO_PROFESSOR_ACTIVITIES.length

  return (
    <AppLayout
      breadcrumbs={[
        "Spațiu de lucru",
        canApproveRequests ? "Gestiune laborator" : "Panou departament",
      ]}
    >
      <div className="space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                {canApproveRequests ? "Gestiune laborator" : "Panou departament"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold">
                {roleBadgeLabel}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              {canApproveRequests
                ? "Aprobarea cererilor de rezervare ale studenților, recepția echipamentelor și jurnalul tehnic"
                : "Activități didactice, rezervări pentru grupe de studenți și resursele departamentului"}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canApproveRequests && (
              <Button
                variant="outline"
                onClick={() => navigate("/technical-history")}
                className="border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 text-xs gap-1.5 h-9 rounded-lg font-semibold"
              >
                <Wrench className="h-3.5 w-3.5" />
                Jurnal tehnic
              </Button>
            )}
            <Button
              onClick={() => navigate("/professor/group-booking")}
              className="bg-black hover:bg-neutral-800 text-white text-xs gap-1.5 h-9 rounded-lg font-semibold shadow-xs"
            >
              <Plus className="h-4 w-4" />
              {canApproveRequests ? "Rezervare nouă" : "Rezervare grupă"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user?.nume ? user.nume.charAt(0).toUpperCase() : "D"}
            </div>
            <div>
              <div className="font-bold text-xs text-neutral-900">
                {user?.nume || "Cadru didactic"}
              </div>
              <div className="text-[11px] text-neutral-500">{roleBadgeLabel}</div>
            </div>
          </div>
          <div className="text-xs text-neutral-500">
            {canApproveRequests
              ? "Responsabil cu aprobarea cererilor studenților și starea tehnică a resurselor"
              : "Rezervare echipamente pentru activitate didactică și grupe"}
          </div>
        </div>

        {actionSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{actionSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="font-bold text-emerald-700"
            >
              ✕
            </button>
          </div>
        )}

        {actionError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span className="font-medium">{actionError}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="font-bold text-rose-700"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
            <div className="text-xs text-neutral-500">
              Elemente din catalogul departamentului
            </div>
            <div className="text-3xl font-bold text-neutral-900">
              {resources.length || 16}
            </div>
            <div className="text-xs text-neutral-500 pt-0.5">unități active în laboratoare</div>
          </div>

          {canApproveRequests ? (
            <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
              <div className="text-xs text-neutral-500">Cereri studenți în așteptare</div>
              <div className="text-3xl font-bold text-neutral-900">{pendingCount}</div>
              <div className="text-xs text-neutral-500 pt-0.5">
                necesită decizia reprezentantului de laborator
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
              <div className="text-xs text-neutral-500">
                Programări didactice și ședințe de laborator
              </div>
              <div className="text-3xl font-bold text-neutral-900">{profActivitiesCount}</div>
              <div className="text-xs text-neutral-500 pt-0.5">
                cererea ta individuală sau de grupă este validată de reprezentantul de laborator
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-neutral-900">Catalogul departamentului</h2>
                <p className="text-xs text-neutral-500">
                  Acces la catalogul complet, dintr-un singur loc.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/resources")}
                className="text-xs h-8 border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 font-medium rounded-lg"
              >
                Catalog complet
              </Button>
            </div>

            <div className="space-y-4 pt-1">
              {displayCatalog.map((r: Resource | (typeof DEMO_CATALOG_ITEMS)[number]) => (
                <div
                  key={r.id}
                  onClick={() => navigate(`/resources/${r.id}`)}
                  className="p-3 bg-white hover:bg-neutral-50/80 rounded-xl transition-colors cursor-pointer flex items-center gap-4"
                >
                  <div className="h-20 w-32 rounded-lg bg-neutral-900/5 border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {r.imagine_url ? (
                      <img
                        src={r.imagine_url}
                        alt={r.nume}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-neutral-400 font-bold text-xs">RRM</div>
                    )}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-bold text-neutral-900 leading-tight truncate">
                      {r.nume}
                    </div>
                    <div className="text-[11px] text-neutral-500 font-mono">
                      {"specs" in r && r.specs ? `${r.specs} · ` : ""}
                      {r.cod_inventar} · {r.sala_cod}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ProfessorRequestsPanel
            canApproveRequests={canApproveRequests}
            pendingCount={pendingCount}
            pendingRequests={pendingRequests}
            demoApprovals={demoApprovals}
            myReservations={myReservations}
            profActivitiesCount={profActivitiesCount}
            onExamineRequest={(req) => {
              setActionError(null)
              setRejectionReason("")
              setSelectedRequest(req)
            }}
            onExamineDemoRequest={(item) => {
              setActionError(null)
              setRejectionReason("")
              setSelectedDemoRequest(item)
            }}
            onNavigateGroupBooking={() => navigate("/professor/group-booking")}
          />
        </div>
      </div>

      {canApproveRequests && (
        <ProfessorApprovalModal
          selectedRequest={selectedRequest}
          selectedDemoRequest={selectedDemoRequest}
          rejectionReason={rejectionReason}
          onRejectionReasonChange={setRejectionReason}
          isActing={isActing}
          onCloseRequest={() => setSelectedRequest(null)}
          onCloseDemoRequest={() => setSelectedDemoRequest(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onApproveDemo={handleApproveDemo}
          onRejectDemo={handleRejectDemo}
        />
      )}
    </AppLayout>
  )
}

export default ProfessorDashboardPage
