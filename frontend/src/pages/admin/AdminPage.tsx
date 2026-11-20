import { useState } from "react"
import { ShieldAlert } from "lucide-react"
import { AppLayout } from "../../components/layout/AppLayout"
import { Badge } from "../../components/ui/badge"
import { useAuth } from "../../context/AuthContext"
import type { Resource } from "../../types"
import { useAdminInventory } from "./hooks/useAdminInventory"
import { AdminStats } from "./components/AdminStats"
import { InventorySection } from "./components/InventorySection"
import { ResourceEditorPanel } from "./components/ResourceEditorPanel"
import { UsersSection } from "./components/UsersSection"
import { AuditSection } from "./components/AuditSection"
import { RbacMatrix } from "./components/RbacMatrix"
import { SecuritySection } from "./components/SecuritySection"

export function AdminPage() {
  const { user } = useAuth()
  const isAdmin = user?.rol === "ADMINISTRATOR"
  const inv = useAdminInventory(isAdmin)
  const [editing, setEditing] = useState<Resource | null>(null)

  if (!isAdmin) {
    return (
      <AppLayout breadcrumbs={["Spațiu de lucru", "Administrare"]}>
        <div className="p-8 max-w-2xl mx-auto my-12 text-center space-y-3 bg-white rounded-2xl border border-neutral-200">
          <ShieldAlert className="h-8 w-8 mx-auto text-amber-600" />
          <h2 className="text-xl font-bold text-neutral-900">Acces restricționat</h2>
          <p className="text-sm text-neutral-500">Pagina este rezervată administratorilor.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Administrare"]}>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <header className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-950">Administrare sistem RRM</h1>
            <Badge variant="outline">Administrator</Badge>
          </div>
          <p className="text-sm text-neutral-500">Inventar, roluri și securitate RRM.</p>
        </header>

        <AdminStats counts={inv.counts} />

        <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
          <div className="space-y-6">
            <InventorySection
              items={inv.items}
              total={inv.total}
              page={inv.page}
              isLoading={inv.isLoading}
              error={inv.error}
              searchInput={inv.searchInput}
              stare={inv.stare}
              onSearchInput={inv.setSearchInput}
              onSearch={inv.applySearch}
              onStare={inv.changeStare}
              onPage={inv.setPage}
              onEdit={setEditing}
              onToggleActive={(r) => inv.setActive(r.id, !r.is_active)}
            />
            <UsersSection />
            <AuditSection />
          </div>
          <div className="space-y-6">
            <ResourceEditorPanel
              resource={editing}
              categories={inv.categories}
              rooms={inv.rooms}
              onSave={inv.saveResource}
              onReset={() => setEditing(null)}
            />
            <SecuritySection />
          </div>
        </div>

        <RbacMatrix />
      </div>
    </AppLayout>
  )
}
