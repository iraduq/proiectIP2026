import { useCallback, useEffect, useState } from "react"
import { reservationsApi } from "../api/reservations"
import { resourcesApi } from "../api/resources"
import type { DemoApprovalItem } from "../components/professor/ProfessorApprovalModal"
import { DEMO_PROFESSOR_ACTIVITIES } from "../components/professor/ProfessorRequestsPanel"
import { DEMO_APPROVALS, DEMO_CATALOG_ITEMS } from "../data/professorDashboardConstants"
import type { Reservation, Resource } from "../types"

export function useProfessorDashboard(canApproveRequests: boolean, userId?: number) {
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
          utilizator_id: userId,
          limit: 10,
        })
        setMyReservations(ownData.items)
      }
    } catch {}
  }, [canApproveRequests, userId])

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

  return {
    resourcesCount: resources.length || 16,
    displayCatalog: resources.length >= 3 ? resources.slice(0, 3) : DEMO_CATALOG_ITEMS,
    pendingRequests,
    pendingCount: pendingRequests.length > 0 ? pendingRequests.length : demoApprovals.length,
    myReservations,
    profActivitiesCount:
      myReservations.length > 0 ? myReservations.length : DEMO_PROFESSOR_ACTIVITIES.length,
    demoApprovals,
    selectedRequest,
    setSelectedRequest,
    selectedDemoRequest,
    setSelectedDemoRequest,
    rejectionReason,
    setRejectionReason,
    isActing,
    actionSuccess,
    setActionSuccess,
    actionError,
    setActionError,
    handleApprove,
    handleReject,
    handleApproveDemo,
    handleRejectDemo,
  }
}
