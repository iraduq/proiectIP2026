import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  FlaskConical,
  Search,
  LayoutDashboard,
  Cpu,
  Calendar,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Bot,
  CircuitBoard,
  Activity,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"

export function WelcomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")

  const categories = [
    {
      title: "Calculatoare AI",
      desc: "Stații de lucru pentru AI și calcul intensiv",
      icon: Cpu,
      color: "from-blue-600 to-indigo-700",
      catId: 1,
    },
    {
      title: "Roboți",
      desc: "Brațe robotice pentru proiecte practice",
      icon: Bot,
      color: "from-emerald-600 to-teal-700",
      catId: 2,
    },
    {
      title: "Kituri IoT",
      desc: "Seturi embedded și dezvoltare IoT",
      icon: CircuitBoard,
      color: "from-amber-600 to-orange-700",
      catId: 4,
    },
    {
      title: "Osciloscoape",
      desc: "Instrumente de măsurare și analiză",
      icon: Activity,
      color: "from-rose-600 to-pink-700",
      catId: 3,
    },
    {
      title: "Imprimante 3D",
      desc: "Prototipare rapidă cu filament FDM",
      icon: Printer,
      color: "from-violet-600 to-purple-700",
      catId: 5,
    },
  ]

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (user) {
      navigate(`/resources?search=${encodeURIComponent(searchTerm)}`)
    } else {
      navigate(`/login`)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <aside className="w-64 border-r border-[#e5e7eb] bg-white flex flex-col justify-between shrink-0">
        <div className="p-4 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-black flex items-center justify-center text-white font-bold shadow-sm">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-sm leading-tight text-neutral-900">RRM / kit</div>
              <div className="text-xs text-neutral-500">Resurse de laborator</div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Caută în RRM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 text-xs bg-neutral-50 border-neutral-200"
            />
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 py-1">
              Spațiu de lucru
            </div>
            <button
              onClick={() => navigate(user ? "/dashboard" : "/login")}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors text-left"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Panou de bord</span>
            </button>
            <button
              onClick={() => navigate(user ? "/resources" : "/login")}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors text-left"
            >
              <Cpu className="h-4 w-4" />
              <span>Catalog de resurse</span>
            </button>
            <button
              onClick={() => navigate(user ? "/reservations" : "/login")}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors text-left"
            >
              <Calendar className="h-4 w-4" />
              <span>Rezervările mele</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-neutral-100">
          {!user ? (
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2.5">
              <div className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-neutral-600" />
                Ajutor și ghiduri
              </div>
              <p className="text-[11px] text-neutral-500 leading-snug">
                Autentifică-te pentru a rezerva resurse și a verifica orarele.
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="w-full h-8 text-xs bg-black text-white hover:bg-neutral-800"
              >
                Autentificare
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Conectat ca:</span>
              <span className="font-semibold text-neutral-900">{user.nume}</span>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-[#e5e7eb] bg-white px-8 flex items-center justify-between shrink-0">
          <div className="text-xs text-neutral-500 flex items-center gap-1.5">
            <span>Spațiu de lucru</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-neutral-900 font-medium">Bun venit</span>
          </div>

          <div className="flex items-center gap-2">
            {!user ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="text-xs h-8"
                >
                  Autentificare
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/register")}
                  className="text-xs h-8 bg-black hover:bg-neutral-800 text-white shadow-sm"
                >
                  Creează cont
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="text-xs h-8 bg-black hover:bg-neutral-800 text-white shadow-sm"
              >
                Mergi la Panou
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-8 overflow-y-auto">
          <div className="relative rounded-2xl overflow-hidden bg-neutral-950 text-white p-8 md:p-10 shadow-xl border border-neutral-800">
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-md border border-white/15">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Resource Research Manager
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Resursele potrivite.
                <br />
                La momentul potrivit.
              </h1>

              <p className="text-sm md:text-base text-neutral-300 leading-relaxed max-w-xl">
                Explorează resursele de laborator, verifică disponibilitatea în timp real și pregătește rezervarea în câțiva pași simpli.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => navigate(user ? "/resources" : "/login")}
                  className="bg-white hover:bg-neutral-100 text-black text-xs font-semibold h-10 px-5 gap-2 shadow-sm"
                >
                  Explorează catalogul
                  <ArrowRight className="h-4 w-4" />
                </Button>
                {!user && (
                  <Button
                    variant="outline"
                    onClick={() => navigate("/register")}
                    className="border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800 text-white text-xs h-10 px-5"
                  >
                    Creează un cont
                  </Button>
                )}
              </div>
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none bg-gradient-to-l from-blue-500/30 to-transparent"></div>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Caută resurse după nume, categorie sau laborator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-11 text-xs rounded-xl border border-neutral-200 bg-white shadow-xs focus:outline-none focus:ring-1 focus:ring-black"
            />
          </form>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Ce resurse cauți?</h2>
                <p className="text-xs text-neutral-500">Clasificarea echipamentelor din laboratoare</p>
              </div>
              <button
                onClick={() => navigate(user ? "/resources" : "/login")}
                className="text-xs text-neutral-600 hover:text-black font-semibold flex items-center gap-1"
              >
                Explorează după categorie
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {categories.map((c, i) => {
                const Icon = c.icon
                return (
                  <div
                    key={i}
                    onClick={() => navigate(user ? `/resources?cat=${c.catId}` : "/login")}
                    className="group p-4 bg-white rounded-xl border border-neutral-200 hover:border-neutral-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-40"
                  >
                    <div className="space-y-2">
                      <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${c.color} text-white flex items-center justify-center shadow-xs`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="font-bold text-xs text-neutral-900 group-hover:text-black">
                        {c.title}
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-snug line-clamp-2">
                        {c.desc}
                      </p>
                    </div>
                    <div className="flex items-center justify-end text-neutral-400 group-hover:text-black transition-colors pt-2">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Cum rezervi o resursă</h2>
                <p className="text-xs text-neutral-500">Proces simplu și transparent în 3 pași</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-full">
                3 pași simpli
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="h-7 w-7 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                  1
                </div>
                <div className="font-semibold text-xs text-neutral-900">Autentifică-te</div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Accesul la rezervare necesită un cont instituțional autorizat (Student, Profesor sau Personal tehnic).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="h-7 w-7 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                  2
                </div>
                <div className="font-semibold text-xs text-neutral-900">Alege resursa și intervalul</div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Caută în catalogul centralizat, verifică calendarul orar și selectează sloturile libere.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="h-7 w-7 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                  3
                </div>
                <div className="font-semibold text-xs text-neutral-900">Rezervă și urmărești</div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Gestionează rezervările din panoul personal, urmărește aprobarea responsabilului de sală și termenele de retur.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-3">
              <div className="flex items-center gap-2">
                {!user ? (
                  <>
                    <Button
                      onClick={() => navigate("/login")}
                      className="text-xs bg-black text-white hover:bg-neutral-800 h-9 px-4"
                    >
                      Autentificare
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/register")}
                      className="text-xs h-9 px-4"
                    >
                      Creează cont
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => navigate("/resources")}
                    className="text-xs bg-black text-white hover:bg-neutral-800 h-9 px-4"
                  >
                    Deschide catalogul
                  </Button>
                )}
              </div>

              <button
                onClick={() => navigate(user ? "/resources" : "/login")}
                className="text-xs text-neutral-600 hover:text-black font-semibold flex items-center gap-1.5"
              >
                <span>Catalog public</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
