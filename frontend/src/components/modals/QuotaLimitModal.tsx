import { useNavigate } from "react-router-dom"
import { AlertCircle, AlertTriangle, X, ArrowRight } from "lucide-react"
import { Button } from "../ui/button"

interface QuotaLimitModalProps {
  isOpen: boolean
  onClose: () => void
  attemptedDate?: string
  attemptedTime?: string
  currentActiveCount?: number
  maxLimit?: number
}

export function QuotaLimitModal({
  isOpen,
  onClose,
  attemptedDate = "Astăzi",
  attemptedTime = "Intervalul selectat",
  currentActiveCount = 4,
  maxLimit = 4,
}: QuotaLimitModalProps) {
  const navigate = useNavigate()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-900 leading-tight">Limită cotă atinsă</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Plafon maxim conform cerinței PRD FR-07</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 rounded-lg p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 leading-relaxed">
            Ai atins plafonul maxim de <span className="font-bold text-neutral-900">{maxLimit} resurse simultan</span>. Returnează o resursă activă sau așteaptă finalizarea unui împrumut pentru a continua.
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-neutral-800">
              <span>Resurse simultane în interval</span>
              <span className="font-mono text-rose-600">{currentActiveCount}/{maxLimit}</span>
            </div>
            <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (currentActiveCount / maxLimit) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 text-xs space-y-1">
            <div className="font-bold text-rose-900 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
              Încercare: a {currentActiveCount + 1}-a resursă
            </div>
            <div className="text-rose-800 font-medium">{attemptedDate} · {attemptedTime}</div>
            <p className="text-[11px] text-rose-700 leading-snug pt-0.5">
              Interval suprapus cu cele {currentActiveCount} resurse deja rezervate pe contul dumneavoastră.
            </p>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Notă: Plafonul de 4 se aplică resurselor utilizate simultan în același interval orar, nu rezervărilor dintr-o săptămână întreagă.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-9"
            >
              Închide
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onClose()
                navigate("/reservations")
              }}
              className="text-xs bg-black hover:bg-neutral-800 text-white gap-1.5 h-9 shadow-sm"
            >
              <span>Vezi rezervările mele</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
