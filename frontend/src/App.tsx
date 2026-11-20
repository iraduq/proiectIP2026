import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { LoginPage } from "./pages/auth/LoginPage"
import { RegisterPage } from "./pages/auth/RegisterPage"
import { WelcomePage } from "./pages/welcome/WelcomePage"
import { DashboardPage } from "./pages/dashboard/DashboardPage"
import { AcademicAdminPage } from "./pages/academic/AcademicAdminPage"
import { AdminPage } from "./pages/admin/AdminPage"
import { RoomsPage } from "./pages/rooms/RoomsPage"
import { ResourcesPage } from "./pages/resources/ResourcesPage"
import { ResourceDetailPage } from "./pages/resources/ResourceDetailPage"
import { ReservationsPage } from "./pages/reservations/ReservationsPage"
import { TechnicalHistoryPage } from "./pages/technical/TechnicalHistoryPage"
import { ProfessorDashboardPage } from "./pages/professor/ProfessorDashboardPage"
import { GroupBookingPage } from "./pages/professor/GroupBookingPage"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-xs text-neutral-500 font-medium">Se verifică autentificarea...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rooms"
            element={
              <ProtectedRoute>
                <RoomsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <ResourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources/:id"
            element={
              <ProtectedRoute>
                <ResourceDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute>
                <ReservationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations/new"
            element={<Navigate to="/resources/1" replace />}
          />
          <Route
            path="/technical-history"
            element={
              <ProtectedRoute>
                <TechnicalHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/academic"
            element={
              <ProtectedRoute>
                <AcademicAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professor"
            element={
              <ProtectedRoute>
                <ProfessorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professor/group-booking"
            element={
              <ProtectedRoute>
                <GroupBookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professor/approvals"
            element={<Navigate to="/professor" replace />}
          />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/" element={<WelcomePage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
