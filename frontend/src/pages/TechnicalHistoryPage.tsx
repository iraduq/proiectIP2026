import { CheckCircle2, Plus, Search, ShieldAlert, Wrench } from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { useTechnicalHistory } from "../hooks/useTechnicalHistory"
import { Button } from "../components/ui/button"
import { TechnicalHistoryTable } from "../components/technical/TechnicalHistoryTable"
import { TechnicalLogModal } from "../components/technical/TechnicalLogModal"
import { INTERVENTION_FILTER_OPTIONS } from "../data/technicalHistoryConstants"

export function TechnicalHistoryPage() {
  const { user } = useAuth()

  const canAccess =
    user?.rol === "ADMINISTRATOR" ||
    user?.rol === "RESPONSABIL_LABORATOR" ||
    Boolean(user?.permissions?.includes("technical_history:read"))

  const canCreate =
    user?.rol === "ADMINISTRATOR" ||
    user?.rol === "RESPONSABIL_LABORATOR" ||
    Boolean(user?.permissions?.includes("technical_history:create"))

  const tech = useTechnicalHistory(canAccess, canCreate)

  if (!canAccess) {
    return (
      <AppLayout breadcrumbs={["Spațiu de lucru", "Jurnal tehnic"]}>
        <div className="p-8 max-w-2xl mx-auto my-12 text-center space-y-4 bg-white rounded-2xl border border-neutral-200 shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900">Acces restricționat</h2>
          <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
            Consultarea și consemnarea în fișele de mentenanță și jurnalul tehnic sunt rezervate
            exclusiv personalului tehnic autorizat (responsabili de laborator și administratori).
          </p>
          <div className="pt-2">
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              className="text-xs bg-black text-white hover:bg-neutral-800"
            >
              Înapoi la panoul de bord
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Jurnal tehnic"]}>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
              <Wrench className="h-6 w-6 text-neutral-800" />
              Jurnal tehnic și fișe de mentenanță
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Istoric complet și imutabil al intervențiilor, reparațiilor și raportărilor de
              defecțiuni.
            </p>
          </div>
          {canCreate && (
            <Button
              onClick={() => tech.setIsModalOpen(true)}
              className="bg-black hover:bg-neutral-800 text-white gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Înregistrează intervenție
            </Button>
          )}
        </div>

        {tech.successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{tech.successMsg}</span>
            </div>
            <button
              onClick={() => tech.setSuccessMsg(null)}
              className="text-emerald-600 hover:text-emerald-800 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Caută în jurnal după echipament, autor sau descriere..."
              value={tech.search}
              onChange={(e) => tech.setSearch(e.target.value)}
              className="w-full pl-9 pr-3 h-9 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500">Tip intervenție:</span>
            <select
              value={tech.typeFilter}
              onChange={(e) => tech.setTypeFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black"
            >
              {INTERVENTION_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <TechnicalHistoryTable items={tech.filteredHistory} isLoading={tech.isLoading} />

        {tech.isModalOpen && (
          <TechnicalLogModal
            resources={tech.resources}
            selectedResourceId={tech.selectedResourceId}
            logType={tech.logType}
            logState={tech.logState}
            logDesc={tech.logDesc}
            isSubmitting={tech.isSubmitting}
            onResourceChange={tech.setSelectedResourceId}
            onTypeChange={tech.setLogType}
            onStateChange={tech.setLogState}
            onDescChange={tech.setLogDesc}
            onClose={() => tech.setIsModalOpen(false)}
            onSubmit={tech.handleCreateLog}
          />
        )}
      </div>
    </AppLayout>
  )
}
export default TechnicalHistoryPage
