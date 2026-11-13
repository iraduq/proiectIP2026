import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import {
  RESOURCES_PAGE_SIZE,
  useResourcesCatalog,
} from "../hooks/useResourcesCatalog"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Card } from "../components/ui/card"
import { ResourceFilterBar } from "../components/resources/ResourceFilterBar"
import { ResourceCatalogCard } from "../components/resources/ResourceCatalogCard"
import { CatalogPagination } from "../components/resources/CatalogPagination"

export function ResourcesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isStudent = !user || user.rol === "STUDENT"
  const catalog = useResourcesCatalog(isStudent)

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Catalog de resurse"]}>
      <div className="max-w-7xl mx-auto space-y-4">
        <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Catalog de resurse
            </h1>
            <p className="text-xs text-neutral-500">
              Filtrează rapid după clasă, departament, specializare, sală sau specificații tehnice
              și rezervă pe ore sau pe mai multe zile.
            </p>
          </div>

          <Button
            onClick={() => {
              const el = document.getElementById("catalog-search-input")
              el?.focus()
              el?.scrollIntoView({ behavior: "smooth", block: "center" })
            }}
            className="bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold h-9 px-4 rounded-lg gap-1.5 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Rezervare nouă
          </Button>
        </Card>

        <ResourceFilterBar
          filters={catalog.filters}
          classCounts={catalog.classCounts}
          departmentsList={catalog.departmentsList}
          specializationsList={catalog.specializationsList}
          roomsList={catalog.roomsList}
          activeFiltersCount={catalog.activeFiltersCount}
          isStudent={isStudent}
          onFilterChange={catalog.handleFilterChange}
          onResetFilters={catalog.handleResetFilters}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-neutral-900">
              {catalog.totalItems} resurse găsite
            </span>
            <Badge
              variant="outline"
              className="rounded-full bg-neutral-100 border-neutral-200 text-neutral-700 text-[11px] font-medium px-2.5 py-0.5"
            >
              {catalog.availableCount} disponibile · {catalog.reservedCount} rezervate ·{" "}
              {catalog.inUseCount} în utilizare
            </Badge>
          </div>

          <select
            value={catalog.sortBy}
            onChange={(e) => catalog.setSortBy(e.target.value)}
            className="h-8 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="Disponibilitate">Sortează: disponibilitate</option>
            <option value="Clasă / Categorie">Sortează: clasă / categorie</option>
            <option value="Nume (A-Z)">Sortează: nume (A–Z)</option>
            <option value="Nume (Z-A)">Sortează: nume (Z–A)</option>
            <option value="Laborator / Sală">Sortează: laborator / sală</option>
            <option value="Cod inventar">Sortează: cod inventar</option>
          </select>
        </div>

        {catalog.paginatedItems.length === 0 ? (
          <Card className="rounded-2xl border-neutral-200 bg-white p-10 text-center space-y-3 shadow-none">
            <div className="text-sm font-bold text-neutral-900">
              Nicio resursă nu corespunde filtrelor selectate
            </div>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Încearcă să selectezi altă clasă de echipament sau să resetezi filtrele active.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={catalog.handleResetFilters}
              className="rounded-xl text-xs font-semibold"
            >
              Resetează filtrele
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {catalog.paginatedItems.map((item) => (
              <ResourceCatalogCard
                key={`${item.code}-${item.id}`}
                item={item}
                onOpenDetail={(id) => navigate(`/resources/${id}`)}
                onSelectCategory={(category) => catalog.handleFilterChange("typeFilter", category)}
                onSelectDepartment={(dept) => catalog.handleFilterChange("deptFilter", dept)}
                onSelectRoom={(room) => catalog.handleFilterChange("roomFilter", room)}
              />
            ))}
          </div>
        )}

        <CatalogPagination
          totalItems={catalog.totalItems}
          pageSize={RESOURCES_PAGE_SIZE}
          currentPage={catalog.safePage}
          onPageChange={catalog.setCurrentPage}
        />
      </div>
    </AppLayout>
  )
}
