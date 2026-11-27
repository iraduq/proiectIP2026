import { useState } from "react"
import { Navigate } from "react-router-dom"
import { AppLayout } from "../../components/layout/AppLayout"
import { useAuth } from "../../context/AuthContext"
import { LabActiveSection } from "./components/LabActiveSection"
import { LabHandoverCard } from "./components/LabHandoverCard"
import { LabHeader } from "./components/LabHeader"
import { LabInventorySection } from "./components/LabInventorySection"
import { LabJournalSection } from "./components/LabJournalSection"
import { LabMetrics } from "./components/LabMetrics"
import { LabRequestsSection } from "./components/LabRequestsSection"
import { LabReturnCard } from "./components/LabReturnCard"
import { useLabOverview } from "./hooks/useLabOverview"

export function LabPage() {
  const { user } = useAuth()
  const lab = useLabOverview()
  const [returnId, setReturnId] = useState<number | null>(null)

  if (user && user.rol !== "RESPONSABIL_LABORATOR") return <Navigate to="/dashboard" replace />

  const first = lab.rooms[0]
  const shortName = (nume: string) => nume.match(/Lab\s*\d+/i)?.[0] ?? nume
  const labName = lab.rooms.length === 1 ? shortName(first.nume) : lab.rooms.length > 1 ? `${lab.rooms.length} laboratoare` : ""
  const manager = user?.nume ?? ""
  const toHandOver = lab.approved.filter((r) => !r.preluat_la)

  const startReturn = (id: number) => {
    setReturnId(id)
    document.getElementById("lab-return-reservation")?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Laboratorul meu"]} topBarBadges={labName ? [labName] : undefined}>
      <div className="mx-auto flex max-w-[1144px] flex-col gap-6">
        <LabHeader labName={labName} department={first?.departament_nume ?? ""} faculty={first?.facultate_nume ?? ""} />
        {lab.error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{lab.error}</div>}
        {lab.loading && <div className="text-sm text-neutral-500">Se încarcă datele laboratorului...</div>}
        <LabMetrics labName={labName} metrics={lab.metrics} />
        <LabRequestsSection faculty={first?.facultate_nume ?? ""} requests={lab.pending} onApprove={lab.approve} onReject={lab.reject} />
        <LabActiveSection labName={labName} reservations={lab.approved} onReturn={startReturn} />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LabHandoverCard labName={labName} managerName={manager} reservations={toHandOver} onHandOver={lab.handOver} />
          <LabReturnCard
            labName={labName}
            managerName={manager}
            reservations={lab.approved}
            preselected={returnId}
            onGiveBack={lab.giveBack}
          />
        </div>
        <LabJournalSection
          labName={labName}
          managerName={manager}
          entries={lab.journal}
          resources={lab.resources}
          onAdd={lab.addJournal}
        />
        <LabInventorySection labName={labName} department={first?.departament_nume ?? ""} resources={lab.resources} />
      </div>
    </AppLayout>
  )
}
