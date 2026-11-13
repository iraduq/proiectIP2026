import { useNavigate } from "react-router-dom"
import { DoorOpen } from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { useRoomsCatalog } from "../hooks/useRoomsCatalog"
import { RoomsHeroCard } from "../components/rooms/RoomsHeroCard"
import { RoomFilterBar } from "../components/rooms/RoomFilterBar"
import { RoomLocatorCard } from "../components/rooms/RoomLocatorCard"
import { RoomFormModal } from "../components/rooms/RoomFormModal"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"

export function RoomsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const canEdit =
    user?.rol === "ADMINISTRATOR" ||
    user?.rol === "RESPONSABIL_LABORATOR" ||
    Boolean(user?.permissions?.includes("rooms:write"))

  const catalog = useRoomsCatalog(user?.id_utilizator)

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Laboratoare și săli"]}>
      <div className="max-w-7xl mx-auto space-y-5">
        <RoomsHeroCard
          roomsCount={catalog.roomsCount}
          canEdit={canEdit}
          onCreateClick={catalog.openCreateModal}
        />

        <RoomFilterBar
          search={catalog.search}
          onSearchChange={catalog.setSearch}
          selectedWing={catalog.selectedWing}
          onWingChange={catalog.setSelectedWing}
          selectedDeptId={catalog.selectedDeptId}
          onDeptChange={catalog.setSelectedDeptId}
          selectedFloor={catalog.selectedFloor}
          onFloorChange={catalog.setSelectedFloor}
          departments={catalog.departments}
          filteredCount={catalog.filteredRooms.length}
        />

        {catalog.isLoading ? (
          <Card className="rounded-2xl border-neutral-200 bg-white p-12 text-center text-xs text-neutral-400 shadow-none">
            Se încarcă harta și lista laboratoarelor...
          </Card>
        ) : catalog.filteredRooms.length === 0 ? (
          <Card className="rounded-2xl border-neutral-200 bg-white p-12 text-center space-y-3 shadow-none">
            <DoorOpen className="h-8 w-8 text-neutral-300 mx-auto" />
            <div className="text-sm font-bold text-neutral-800">
              Niciun laborator găsit pentru criteriile selectate
            </div>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Încearcă să cauți după indicativul sălii (ex: Lab 204, Lab 208, Lab 105) sau resetează
              filtrele de etaj și aripă.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={catalog.resetFilters}
              className="rounded-xl text-xs"
            >
              Resetează toate filtrele
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {catalog.filteredRooms.map(
              ({ room, meta, floorText, equipmentInRoom, deptName, facCode }) => (
                <RoomLocatorCard
                  key={room.id}
                  room={room}
                  meta={meta}
                  floorText={floorText}
                  equipmentInRoom={equipmentInRoom}
                  deptName={deptName}
                  facCode={facCode}
                  canEdit={canEdit}
                  isExpanded={catalog.expandedRoomId === room.id}
                  onToggleExpand={(id) =>
                    catalog.setExpandedRoomId(catalog.expandedRoomId === id ? null : id)
                  }
                  onEdit={catalog.openEditModal}
                  onSelectEquipment={(resId) => navigate(`/resources/${resId}`)}
                  onBrowseResources={() => navigate("/resources")}
                />
              )
            )}
          </div>
        )}
      </div>

      <RoomFormModal
        isOpen={catalog.isModalOpen}
        editingRoom={catalog.editingRoom}
        formData={catalog.formData}
        formError={catalog.formError}
        isSubmitting={catalog.isSubmitting}
        departments={catalog.departments}
        onClose={() => catalog.setIsModalOpen(false)}
        onChange={catalog.setFormData}
        onSubmit={catalog.handleSubmit}
      />
    </AppLayout>
  )
}
