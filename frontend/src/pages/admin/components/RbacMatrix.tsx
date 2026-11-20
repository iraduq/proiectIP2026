import { RBAC_MATRIX } from "../data/adminDemoData"

export function RbacMatrix() {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
      <h2 className="text-lg font-semibold text-neutral-950">Matrice roluri RBAC</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {RBAC_MATRIX.map((r) => (
          <div key={r.rol} className="rounded-lg border border-neutral-200 p-4 space-y-1.5">
            <div className="font-semibold text-neutral-900">{r.rol}</div>
            <p className="text-sm text-neutral-700">{r.permisiuni}</p>
            <p className="text-xs text-neutral-500">{r.restrictii}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
