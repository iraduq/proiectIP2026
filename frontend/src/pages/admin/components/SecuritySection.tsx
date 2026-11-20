import { Badge } from "../../../components/ui/badge"

export function SecuritySection() {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-950">Securitate și 2FA</h2>
        <Badge variant="outline">Date demonstrative</Badge>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-medium text-neutral-900">Autentificare 2FA obligatorie</div>
            <p className="text-xs text-neutral-500">
              Obligatorie pentru rolurile administrative (Tehnician, Administrator).
            </p>
          </div>
          <Badge variant="success">Activ</Badge>
        </div>
        <div>
          <div className="font-medium text-neutral-900">Orare acces clădiri</div>
          <p className="text-xs text-neutral-500">Luni – Sâmbătă · 07:00 – 22:00</p>
        </div>
        <div>
          <div className="font-medium text-neutral-900">Timeout sesiune inactivă</div>
          <p className="text-xs text-neutral-500">Deconectare automată după inactivitate.</p>
        </div>
      </div>
    </section>
  )
}
