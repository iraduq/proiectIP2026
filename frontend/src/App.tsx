import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { LoginPage } from "./pages/LoginPage"
import { RegisterPage } from "./pages/RegisterPage"
import { WelcomePage } from "./pages/WelcomePage"
import { DashboardPage } from "./pages/DashboardPage"
import { AcademicAdminPage } from "./pages/AcademicAdminPage"
import { RoomsPage } from "./pages/RoomsPage"
import { ResourcesPage } from "./pages/ResourcesPage"
import { ResourceDetailPage } from "./pages/ResourceDetailPage"
import { ReservationsPage } from "./pages/ReservationsPage"
import { TechnicalHistoryPage } from "./pages/TechnicalHistoryPage"
import { ProfessorDashboardPage } from "./pages/ProfessorDashboardPage"
import { GroupBookingPage } from "./pages/GroupBookingPage"

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
            path="/technical-history"
            element={
              <ProtectedRoute>
                <TechnicalHistoryPage />
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
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/" element={<WelcomePage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
