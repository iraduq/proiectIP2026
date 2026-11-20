import { useState } from "react"
import { Badge } from "../../../components/ui/badge"
import { PaginationFooter } from "../../../components/common/PaginationFooter"
import { ADMIN_ROLES, DEMO_USERS } from "../data/adminDemoData"

const USERS_PAGE_SIZE = 4

export function UsersSection() {
  const [page, setPage] = useState(1)
  const [roles, setRoles] = useState<Record<string, string>>(
    Object.fromEntries(DEMO_USERS.map((u) => [u.email, u.rol]))
  )
  const visible = DEMO_USERS.slice((page - 1) * USERS_PAGE_SIZE, page * USERS_PAGE_SIZE)

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-950">Management utilizatori</h2>
        <Badge variant="outline">Date demonstrative</Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-neutral-500 border-b border-neutral-200">
              <th className="py-2 pr-3 font-medium">Nume</th>
              <th className="py-2 pr-3 font-medium">E-mail instituțional</th>
              <th className="py-2 pr-3 font-medium">Specializare / Dept.</th>
              <th className="py-2 pr-3 font-medium">Rol</th>
              <th className="py-2 font-medium">Stare cont</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((u) => (
              <tr key={u.email} className="border-b border-neutral-100 last:border-0">
                <td className="py-3 pr-3 font-medium text-neutral-900">{u.nume}</td>
                <td className="py-3 pr-3 text-neutral-600">{u.email}</td>
                <td className="py-3 pr-3 text-neutral-600">
                  {u.dept}
                  {u.nota && <div className="text-xs text-neutral-500">{u.nota}</div>}
                </td>
                <td className="py-3 pr-3">
                  <select
                    value={roles[u.email]}
                    onChange={(e) => setRoles((prev) => ({ ...prev, [u.email]: e.target.value }))}
                    className="h-8 rounded-md border border-neutral-200 bg-white px-2 text-sm"
                  >
                    {ADMIN_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="py-3"><Badge variant={u.stare === "Activ" ? "success" : "warning"}>{u.stare}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationFooter
        totalItems={DEMO_USERS.length}
        pageSize={USERS_PAGE_SIZE}
        currentPage={page}
        onPageChange={setPage}
        itemLabel="utilizatori"
      />
      <p className="text-xs text-neutral-500">
        Administratorul NU completează jurnalul tehnic și NU confirmă predarea / returul în locul
        tehnicianului. Acțiunile de custodie sunt rezervate rolului Tehnician.
      </p>
    </section>
  )
}
