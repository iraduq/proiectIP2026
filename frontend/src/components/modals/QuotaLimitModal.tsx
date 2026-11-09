import { useNavigate } from "react-router-dom"
import { X } from "lucide-react"
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
  attemptedDate = "22.10.2026",
  attemptedTime = "14:00-16:00",
  currentActiveCount = 4,
  maxLimit = 4,
}: QuotaLimitModalProps) {
  const navigate = useNavigate()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-200 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-neutral-900">Limită cotă atinsă</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 rounded-lg p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed">
          Limită cotă atinsă: Ai atins plafonul maxim de {maxLimit} resurse simultan. Returnează o resursă pentru a continua.
        </p>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-neutral-900">
            <span>Resurse simultane în interval</span>
            <span className="font-bold font-mono">{currentActiveCount}/{maxLimit}</span>
          </div>
          <div className="w-full h-1 bg-black rounded-full" />
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white text-xs space-y-1">
          <div className="font-bold text-neutral-900">
            Încercare: a {currentActiveCount + 1}-a resursă
          </div>
          <div className="text-neutral-600 font-medium">{attemptedDate} · {attemptedTime}</div>
          <p className="text-[11px] text-neutral-500 pt-0.5">
            Interval suprapus cu cele {currentActiveCount} resurse deja rezervate.
          </p>
        </div>

        <p className="text-[11px] text-neutral-400 leading-relaxed">
          Plafonul se aplică resurselor simultane, nu rezervărilor dintr-o săptămână.
        </p>

        <div className="flex items-center gap-3 pt-1">
          <Button
            onClick={() => {
              onClose()
              navigate("/reservations")
            }}
            className="bg-black hover:bg-neutral-800 text-white text-xs px-4 h-9 rounded-lg font-medium"
          >
            Vezi rezervările mele
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="border border-neutral-200 text-neutral-800 hover:bg-neutral-50 text-xs px-4 h-9 rounded-lg font-medium"
          >
            Închide
          </Button>
        </div>
      </div>
    </div>
  )
}
