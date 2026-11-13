import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronRight, Search } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { WelcomeSidebar } from "../components/welcome/WelcomeSidebar"
import { WelcomeHero, WelcomeCategoriesAndSteps } from "../components/welcome/WelcomeHeroAndSteps"

export function WelcomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(user ? `/resources?search=${encodeURIComponent(searchTerm)}` : "/login")
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      <WelcomeSidebar
        searchTerm={searchTerm}
        isAuthenticated={Boolean(user)}
        onSearchChange={setSearchTerm}
        onNavigate={navigate}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-[#e5e7eb] bg-white px-8 flex items-center justify-between shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-xs text-neutral-600 font-medium">
            <span>Spațiu de lucru</span>
            <ChevronRight className="h-3 w-3 text-neutral-400" />
            <span className="text-neutral-900 font-semibold">Bun venit</span>
          </div>

          <div className="flex items-center gap-2">
            {!user ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="text-xs h-8 px-3.5 border-neutral-300 bg-white hover:bg-neutral-50 rounded-md font-medium"
                >
                  Autentificare
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/register")}
                  className="text-xs h-8 px-3.5 bg-black hover:bg-neutral-800 text-white rounded-md font-medium shadow-xs"
                >
                  Creează cont
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="text-xs h-8 px-3.5 bg-black hover:bg-neutral-800 text-white rounded-md font-medium"
              >
                Panou de bord
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 px-8 py-6 w-full space-y-6 overflow-y-auto">
          <WelcomeHero isAuthenticated={Boolean(user)} onNavigate={navigate} />

          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Caută resurse după nume, categorie sau laborator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 text-xs bg-white border-neutral-200 rounded-xl shadow-xs placeholder:text-neutral-400"
            />
          </form>

          <WelcomeCategoriesAndSteps isAuthenticated={Boolean(user)} onNavigate={navigate} />
        </main>
      </div>
    </div>
  )
}
