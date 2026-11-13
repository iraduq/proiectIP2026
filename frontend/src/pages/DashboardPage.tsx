import { useNavigate } from "react-router-dom"
import { AlertTriangle, Plus } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useDashboardData } from "../hooks/useDashboardData"
import { AppLayout } from "../components/layout/AppLayout"
import { DashboardStatsGrid } from "../components/dashboard/DashboardStatsGrid"
import { DashboardReservationsSection } from "../components/dashboard/DashboardReservationsSection"
import { DashboardSidebarWidgets } from "../components/dashboard/DashboardSidebarWidgets"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Badge } from "../components/ui/badge"

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const dash = useDashboardData(user)

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Panou de bord"]}>
      <div className="max-w-7xl mx-auto space-y-4">
        <Card className="rounded-2xl border-neutral-200 bg-white p-6 shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                Bună, {dash.firstName}!
              </h1>
              <Badge
                variant="outline"
                className="rounded-full bg-neutral-100 border-neutral-200 text-neutral-700 text-[11px] font-medium px-2.5 py-0.5"
              >
                {dash.roleLabel}
              </Badge>
            </div>
            <p className="text-xs text-neutral-500">
              Panou de bord personal · Gestiune rezervări și echipamente
            </p>
          </div>

          <Button
            onClick={() => navigate("/resources")}
            className="bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold h-9 px-4 rounded-lg gap-1.5 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Rezervare nouă
          </Button>
        </Card>

        {dash.dueTodayRows.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-5 py-3.5 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <p className="font-bold text-amber-900">
                Ai {dash.dueTodayRows.length}{" "}
                {dash.dueTodayRows.length === 1 ? "resursă" : "resurse"} cu termen astăzi
              </p>
              <p className="text-amber-800">
                De returnat astăzi: {dash.dueTodayRows[0].name} ({dash.dueTodayRows[0].room}) până la
                ora {dash.dueTodayRows[0].endTimeStr || "16:00"}.
              </p>
            </div>
          </div>
        )}

        <DashboardStatsGrid
          activeCount={dash.activeCount}
          maxQuota={dash.maxQuota}
          quotaPercent={dash.quotaPercent}
          upcomingCount={dash.upcomingRows.length}
          nextUpcomingText={dash.nextUpcomingText}
          returnedCount={dash.returnedCount}
          dueTodayCount={dash.dueTodayRows.length}
          dueEndTimeStr={dash.dueTodayRows[0]?.endTimeStr}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <DashboardReservationsSection
            inUseRows={dash.inUseRows}
            upcomingRows={dash.upcomingRows}
            isLoading={dash.isLoading}
            totalCatalogCount={dash.totalCatalogCount}
            onNavigateReservations={() => navigate("/reservations")}
            onSelectResource={(id) => navigate(`/resources/${id}`)}
          />

          <DashboardSidebarWidgets
            initials={dash.initials}
            fullName={dash.fullName}
            roleLabel={dash.roleLabel}
            activeCount={dash.activeCount}
            maxQuota={dash.maxQuota}
            quotaPercent={dash.quotaPercent}
            totalCatalogCount={dash.totalCatalogCount}
            onNavigateResources={() => navigate("/resources")}
            onNavigateReservations={() => navigate("/reservations")}
            onNavigateRooms={() => navigate("/rooms")}
          />
        </div>
      </div>
    </AppLayout>
  )
}
