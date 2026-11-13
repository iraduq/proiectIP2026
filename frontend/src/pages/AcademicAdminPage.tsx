import { useAuth } from "../context/AuthContext"
import { useAcademicAdmin } from "../hooks/useAcademicAdmin"
import { AppLayout } from "../components/layout/AppLayout"
import { AcademicHeader } from "../components/academic/AcademicHeader"
import { AcademicFilterBar } from "../components/academic/AcademicFilterBar"
import { InstitutionsGrid } from "../components/academic/InstitutionsGrid"
import { FacultiesTable, DepartmentsTable } from "../components/academic/AcademicStructureTables"
import {
  InstitutionFormModal,
  FacultyFormModal,
  DepartmentFormModal,
} from "../components/academic/AcademicModals"

export function AcademicAdminPage() {
  const { user } = useAuth()
  const isAdmin = Boolean(
    user?.rol === "ADMINISTRATOR" || user?.permissions?.includes("structure:manage")
  )
  const admin = useAcademicAdmin()

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Structură academică"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <AcademicHeader
          isAdmin={isAdmin}
          tab={admin.tab}
          institutionsCount={admin.institutions.length}
          facultiesCount={admin.faculties.length}
          departmentsCount={admin.departments.length}
          onTabChange={(nextTab) => {
            admin.setTab(nextTab)
            admin.setSearch("")
          }}
          onAddInstitution={admin.openAddInstitution}
          onAddFaculty={admin.openAddFaculty}
          onAddDepartment={admin.openAddDepartment}
        />

        <AcademicFilterBar
          tab={admin.tab}
          search={admin.search}
          onSearchChange={admin.setSearch}
          filterInstitutionId={admin.filterInstitutionId}
          onFilterInstitutionChange={admin.setFilterInstitutionId}
          filterFacultyId={admin.filterFacultyId}
          onFilterFacultyChange={admin.setFilterFacultyId}
          institutions={admin.institutions}
          faculties={admin.faculties}
          onSubmit={admin.handleSearchSubmit}
        />

        {admin.tab === "institutions" && (
          <InstitutionsGrid
            institutions={admin.institutions}
            isLoading={admin.isLoading}
            isAdmin={isAdmin}
            onEdit={admin.openEditInstitution}
            onToggle={admin.handleToggleInstitution}
            onDelete={admin.handleDeleteInstitution}
          />
        )}

        {admin.tab === "faculties" && (
          <FacultiesTable
            faculties={admin.faculties}
            isLoading={admin.isLoading}
            isAdmin={isAdmin}
            onEdit={admin.openEditFaculty}
            onToggle={admin.handleToggleFaculty}
            onDelete={admin.handleDeleteFaculty}
          />
        )}

        {admin.tab === "departments" && (
          <DepartmentsTable
            departments={admin.departments}
            isLoading={admin.isLoading}
            isAdmin={isAdmin}
            onEdit={admin.openEditDepartment}
            onToggle={admin.handleToggleDepartment}
            onDelete={admin.handleDeleteDepartment}
          />
        )}
      </div>

      {admin.isInstModalOpen && (
        <InstitutionFormModal
          editingInst={admin.editingInst}
          modalError={admin.modalError}
          isSubmitting={admin.isSubmitting}
          instCod={admin.instCod}
          instOras={admin.instOras}
          instNume={admin.instNume}
          instAdresa={admin.instAdresa}
          instEmail={admin.instEmail}
          instTelefon={admin.instTelefon}
          instWebsite={admin.instWebsite}
          onChangeCod={admin.setInstCod}
          onChangeOras={admin.setInstOras}
          onChangeNume={admin.setInstNume}
          onChangeAdresa={admin.setInstAdresa}
          onChangeEmail={admin.setInstEmail}
          onChangeTelefon={admin.setInstTelefon}
          onChangeWebsite={admin.setInstWebsite}
          onClose={() => admin.setIsInstModalOpen(false)}
          onSubmit={admin.handleSaveInstitution}
        />
      )}

      {admin.isFacModalOpen && (
        <FacultyFormModal
          editingFac={admin.editingFac}
          institutions={admin.institutions}
          modalError={admin.modalError}
          isSubmitting={admin.isSubmitting}
          facInstitutieId={admin.facInstitutieId}
          facCod={admin.facCod}
          facNume={admin.facNume}
          facDescriere={admin.facDescriere}
          onChangeInstitutieId={admin.setFacInstitutieId}
          onChangeCod={admin.setFacCod}
          onChangeNume={admin.setFacNume}
          onChangeDescriere={admin.setFacDescriere}
          onClose={() => admin.setIsFacModalOpen(false)}
          onSubmit={admin.handleSaveFaculty}
        />
      )}

      {admin.isDeptModalOpen && (
        <DepartmentFormModal
          editingDept={admin.editingDept}
          faculties={admin.faculties}
          modalError={admin.modalError}
          isSubmitting={admin.isSubmitting}
          deptFacultateId={admin.deptFacultateId}
          deptCod={admin.deptCod}
          deptNume={admin.deptNume}
          deptSefId={admin.deptSefId}
          deptDescriere={admin.deptDescriere}
          onChangeFacultateId={admin.setDeptFacultateId}
          onChangeCod={admin.setDeptCod}
          onChangeNume={admin.setDeptNume}
          onChangeSefId={admin.setDeptSefId}
          onChangeDescriere={admin.setDeptDescriere}
          onClose={() => admin.setIsDeptModalOpen(false)}
          onSubmit={admin.handleSaveDepartment}
        />
      )}
    </AppLayout>
  )
}
