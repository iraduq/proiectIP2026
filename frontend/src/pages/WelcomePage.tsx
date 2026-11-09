import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  FlaskConical,
  Search,
  LayoutDashboard,
  Cpu,
  Calendar,
  ChevronRight,
  Bot,
  CircuitBoard,
  Activity,
  Printer,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"

function WorkstationVisual() {
  return (
    <div className="w-full h-full bg-[#0a0f1d] relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 z-10" />
      <svg viewBox="0 0 200 120" className="w-full h-full object-cover">
        <rect width="200" height="120" fill="#080c16" />
        <circle cx="100" cy="60" r="42" fill="none" stroke="#00f0ff" strokeWidth="2.5" opacity="0.85" filter="drop-shadow(0 0 8px #00f0ff)" />
        <circle cx="100" cy="60" r="34" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <circle cx="100" cy="60" r="14" fill="#0b1329" stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx="100" cy="60" r="6" fill="#38bdf8" />
        <path d="M100 46 C115 48 126 56 128 60 C118 64 108 55 100 46 Z" fill="#0284c7" opacity="0.75" />
        <path d="M114 60 C122 73 118 85 114 88 C106 82 108 70 114 60 Z" fill="#0284c7" opacity="0.75" />
        <path d="M100 74 C85 72 74 64 72 60 C82 56 92 65 100 74 Z" fill="#0284c7" opacity="0.75" />
        <path d="M86 60 C78 47 82 35 86 32 C94 38 92 50 86 60 Z" fill="#0284c7" opacity="0.75" />
        <line x1="16" y1="20" x2="16" y2="100" stroke="#1e293b" strokeWidth="2" />
        <line x1="24" y1="20" x2="24" y2="100" stroke="#1e293b" strokeWidth="2" />
        <rect x="150" y="24" width="36" height="72" rx="4" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
        <line x1="156" y1="36" x2="180" y2="36" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" />
        <line x1="156" y1="44" x2="180" y2="44" stroke="#0ea5e9" strokeWidth="1" opacity="0.5" />
      </svg>
    </div>
  )
}

function RobotArmVisual() {
  return (
    <div className="w-full h-full bg-[#f1f5f9] relative flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 200 120" className="w-full h-full object-contain p-2">
        <rect x="70" y="100" width="60" height="12" rx="3" fill="#1e293b" />
        <rect x="85" y="88" width="30" height="12" rx="2" fill="#0284c7" />
        <circle cx="100" cy="85" r="7" fill="#0369a1" stroke="#e2e8f0" strokeWidth="1.5" />
        <line x1="100" y1="85" x2="80" y2="52" stroke="#0284c7" strokeWidth="9" strokeLinecap="round" />
        <circle cx="80" cy="52" r="6" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1.5" />
        <line x1="80" y1="52" x2="118" y2="34" stroke="#0284c7" strokeWidth="7" strokeLinecap="round" />
        <circle cx="118" cy="34" r="5" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1" />
        <line x1="118" y1="34" x2="132" y2="42" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
        <path d="M132 38 L142 36 M132 46 L142 48" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function IotKitVisual() {
  return (
    <div className="w-full h-full bg-[#0c121e] relative flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 200 120" className="w-full h-full object-contain p-2">
        <rect x="42" y="24" width="116" height="72" rx="6" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
        <rect x="52" y="32" width="56" height="42" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <line x1="58" y1="38" x2="102" y2="38" stroke="#0f172a" strokeWidth="2" />
        <line x1="58" y1="44" x2="102" y2="44" stroke="#0f172a" strokeWidth="2" />
        <line x1="58" y1="50" x2="102" y2="50" stroke="#0f172a" strokeWidth="2" />
        <line x1="58" y1="56" x2="102" y2="56" stroke="#0f172a" strokeWidth="2" />
        <line x1="58" y1="62" x2="102" y2="62" stroke="#0f172a" strokeWidth="2" />
        <line x1="58" y1="68" x2="102" y2="68" stroke="#0f172a" strokeWidth="2" />
        <rect x="116" y="32" width="34" height="20" rx="2" fill="#0f172a" stroke="#22c55e" strokeWidth="0.8" />
        <text x="122" y="45" fill="#22c55e" fontSize="7" fontFamily="monospace" fontWeight="bold">AI-IOT</text>
        <circle cx="124" cy="62" r="3" fill="#eab308" />
        <circle cx="134" cy="62" r="3" fill="#ef4444" />
        <circle cx="144" cy="62" r="3" fill="#3b82f6" />
        <line x1="50" y1="88" x2="150" y2="88" stroke="#eab308" strokeWidth="1.5" strokeDasharray="3 2" />
      </svg>
    </div>
  )
}

function OscilloscopeVisual() {
  return (
    <div className="w-full h-full bg-[#1b2230] relative flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 200 120" className="w-full h-full object-contain p-2">
        <rect x="25" y="18" width="150" height="84" rx="4" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
        <rect x="34" y="26" width="85" height="66" rx="2" fill="#051726" stroke="#0f766e" strokeWidth="1" />
        <line x1="34" y1="59" x2="119" y2="59" stroke="#0f766e" strokeWidth="0.5" strokeDasharray="2 2" />
        <line x1="76" y1="26" x2="76" y2="92" stroke="#0f766e" strokeWidth="0.5" strokeDasharray="2 2" />
        <path d="M36 59 Q46 36 56 59 T76 59 T96 59 T116 59" fill="none" stroke="#22c55e" strokeWidth="1.5" />
        <circle cx="134" cy="38" r="7" fill="#475569" stroke="#334155" strokeWidth="1" />
        <circle cx="154" cy="38" r="7" fill="#475569" stroke="#334155" strokeWidth="1" />
        <circle cx="134" cy="62" r="5" fill="#64748b" />
        <circle cx="154" cy="62" r="5" fill="#64748b" />
        <circle cx="134" cy="80" r="4" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
        <circle cx="154" cy="80" r="4" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
      </svg>
    </div>
  )
}

function Printer3DVisual() {
  return (
    <div className="w-full h-full bg-[#1e2430] relative flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 200 120" className="w-full h-full object-contain p-2">
        <rect x="48" y="16" width="104" height="92" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
        <rect x="58" y="26" width="84" height="72" rx="2" fill="#1e293b" stroke="#0284c7" strokeWidth="0.5" opacity="0.9" />
        <line x1="66" y1="26" x2="66" y2="98" stroke="#94a3b8" strokeWidth="2.5" />
        <line x1="134" y1="26" x2="134" y2="98" stroke="#94a3b8" strokeWidth="2.5" />
        <line x1="66" y1="52" x2="134" y2="52" stroke="#cbd5e1" strokeWidth="3" />
        <rect x="94" y="47" width="14" height="12" rx="1.5" fill="#f97316" />
        <polygon points="101,59 98,66 104,66" fill="#fbbf24" />
        <rect x="76" y="82" width="48" height="6" rx="1" fill="#475569" stroke="#64748b" strokeWidth="0.5" />
        <circle cx="100" cy="12" r="7" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

export function WelcomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")

  const categories = [
    {
      title: "Calculatoare AI",
      desc: "Stații de lucru pentru AI și calcul intensiv",
      icon: Cpu,
      visual: WorkstationVisual,
      catId: 1,
    },
    {
      title: "Roboți",
      desc: "Brațe robotice pentru proiecte practice",
      icon: Bot,
      visual: RobotArmVisual,
      catId: 2,
    },
    {
      title: "Kituri IoT",
      desc: "Seturi embedded și dezvoltare IoT",
      icon: CircuitBoard,
      visual: IotKitVisual,
      catId: 4,
    },
    {
      title: "Osciloscoape",
      desc: "Instrumente de măsurare și analiză",
      icon: Activity,
      visual: OscilloscopeVisual,
      catId: 3,
    },
    {
      title: "Imprimante 3D",
      desc: "Prototipare rapidă cu filament FDM",
      icon: Printer,
      visual: Printer3DVisual,
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
    <div className="min-h-screen bg-[#fafafa] flex">
      <aside className="w-60 border-r border-[#e5e7eb] bg-white flex flex-col justify-between shrink-0">
        <div className="p-4 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center text-white shrink-0">
              <FlaskConical className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-neutral-900 leading-tight">RRM</div>
              <div className="text-[10px] text-neutral-500">Resurse de laborator</div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <Input
              type="text"
              placeholder="Caută în RRM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs bg-neutral-50 border-neutral-200 rounded-lg placeholder:text-neutral-400"
            />
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-semibold tracking-wider text-neutral-400 px-2 py-1 uppercase">
              Spațiu de lucru
            </div>
            <button
              onClick={() => navigate(user ? "/dashboard" : "/login")}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors text-left"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Panou de bord</span>
            </button>
            <button
              onClick={() => navigate(user ? "/resources" : "/login")}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors text-left"
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Catalog de resurse</span>
            </button>
            <button
              onClick={() => navigate(user ? "/reservations" : "/login")}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors text-left"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Rezervările mele</span>
            </button>
          </div>
        </div>

        <div className="p-3">
          <div className="p-3 rounded-xl border border-dashed border-neutral-300 bg-white space-y-2">
            <div className="text-xs font-semibold text-neutral-900">Ajutor și ghiduri</div>
            <p className="text-[11px] text-neutral-500 leading-snug">
              Autentifică-te pentru a rezerva resurse.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="w-full h-7 text-xs border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 rounded-md"
            >
              Autentificare
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-13 border-b border-[#e5e7eb] bg-white px-6 py-2.5 flex items-center justify-between shrink-0">
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
                  className="text-xs h-7 px-3 border-neutral-300 bg-white hover:bg-neutral-50 rounded-md font-medium"
                >
                  Autentificare
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/register")}
                  className="text-xs h-7 px-3 bg-black hover:bg-neutral-800 text-white rounded-md font-medium shadow-xs"
                >
                  Creează cont
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="text-xs h-7 px-3 bg-black hover:bg-neutral-800 text-white rounded-md font-medium"
              >
                Panou de bord
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6 overflow-y-auto">
          <Card className="relative overflow-hidden rounded-2xl bg-[#070b14] text-white border-neutral-900 shadow-md">
            <div className="relative z-10 p-7 md:p-9 max-w-xl space-y-3.5">
              <Badge
                variant="outline"
                className="bg-neutral-900/80 text-neutral-200 border-neutral-700 text-[11px] font-normal px-2.5 py-0.5 rounded-full"
              >
                Resource Research Manager
              </Badge>

              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
                Resursele potrivite.
                <br />
                La momentul potrivit.
              </h1>

              <p className="text-xs text-neutral-300 leading-relaxed max-w-md">
                Explorează resursele de laborator, verifică disponibilitatea și pregătește rezervarea în câțiva pași simpli.
              </p>

              <div className="pt-1.5 flex items-center gap-2.5">
                <Button
                  variant="outline"
                  onClick={() => navigate(user ? "/resources" : "/login")}
                  className="border-neutral-500/80 bg-transparent hover:bg-white/10 text-white text-xs h-8 px-3.5 rounded-md"
                >
                  Explorează catalogul
                </Button>
                {!user && (
                  <Button
                    onClick={() => navigate("/register")}
                    className="bg-neutral-900/90 hover:bg-neutral-800 text-white text-xs h-8 px-3.5 rounded-md border border-neutral-700"
                  >
                    Creează un cont
                  </Button>
                )}
              </div>
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-2/5 pointer-events-none opacity-80 overflow-hidden">
              <svg viewBox="0 0 300 240" className="w-full h-full object-cover">
                <circle cx="210" cy="120" r="95" fill="none" stroke="#00f0ff" strokeWidth="3" opacity="0.8" filter="drop-shadow(0 0 12px #00f0ff)" />
                <circle cx="210" cy="120" r="75" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="5 4" opacity="0.6" />
                <circle cx="210" cy="120" r="30" fill="#080f20" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="210" cy="120" r="12" fill="#38bdf8" />
                <path d="M210 90 C240 95 260 110 265 120 C245 130 225 110 210 90 Z" fill="#0284c7" opacity="0.6" />
                <path d="M240 120 C255 145 245 170 238 176 C220 165 225 140 240 120 Z" fill="#0284c7" opacity="0.6" />
                <path d="M210 150 C180 145 160 130 155 120 C175 110 195 130 210 150 Z" fill="#0284c7" opacity="0.6" />
                <path d="M180 120 C165 95 175 70 182 64 C200 75 195 100 180 120 Z" fill="#0284c7" opacity="0.6" />
              </svg>
            </div>
          </Card>

          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <Input
              type="text"
              placeholder="Caută resurse după nume, categorie sau laborator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs bg-white border-neutral-200 rounded-xl shadow-xs placeholder:text-neutral-400"
            />
          </form>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-neutral-900">Ce resurse cauți?</h2>
              <span className="text-[11px] text-neutral-500 font-medium">Explorează după categorie</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {categories.map((c, i) => {
                const Icon = c.icon
                const Visual = c.visual
                return (
                  <Card
                    key={i}
                    onClick={() => navigate(user ? `/resources?cat=${c.catId}` : "/login")}
                    className="overflow-hidden border border-neutral-200 rounded-xl hover:border-neutral-300 hover:shadow-xs transition-all cursor-pointer bg-white group flex flex-col justify-between"
                  >
                    <div className="h-22 w-full relative overflow-hidden border-b border-neutral-100">
                      <Visual />
                    </div>

                    <CardContent className="p-2.5 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <div className="h-4.5 w-4.5 rounded bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                          <Icon className="h-3 w-3" />
                        </div>
                        <span className="text-xs font-bold text-neutral-900 group-hover:text-black leading-tight">
                          {c.title}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-0.5">
                        <span className="line-clamp-2 leading-tight pr-1">{c.desc}</span>
                        <ChevronRight className="h-3 w-3 text-neutral-400 group-hover:text-black shrink-0 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          <Card className="p-5 border border-neutral-200 rounded-2xl bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-neutral-900">Cum rezervi o resursă</h2>
              <span className="text-[11px] text-neutral-500 font-medium">3 pași simpli</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-50/70 border border-neutral-200/70 space-y-1.5">
                <div className="h-5 w-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                  1
                </div>
                <div className="font-bold text-xs text-neutral-900">Autentifică-te</div>
                <p className="text-[11px] text-neutral-500 leading-snug">
                  Accesul la rezervare necesită un cont instituțional.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50/70 border border-neutral-200/70 space-y-1.5">
                <div className="h-5 w-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                  2
                </div>
                <div className="font-bold text-xs text-neutral-900">Alege resursa și intervalul</div>
                <p className="text-[11px] text-neutral-500 leading-snug">
                  Caută în catalog și verifică disponibilitatea.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50/70 border border-neutral-200/70 space-y-1.5">
                <div className="h-5 w-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                  3
                </div>
                <div className="font-bold text-xs text-neutral-900">Rezervă și urmărești</div>
                <p className="text-[11px] text-neutral-500 leading-snug">
                  Gestionează rezervările din panoul personal.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigate("/login")}
                  className="h-7 text-xs bg-black text-white hover:bg-neutral-800 rounded-md px-3 font-medium"
                >
                  Autentificare
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/register")}
                  className="h-7 text-xs border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 rounded-md px-3 font-medium"
                >
                  Creează cont
                </Button>
              </div>

              <button
                onClick={() => navigate(user ? "/resources" : "/login")}
                className="text-xs text-neutral-600 hover:text-black font-semibold flex items-center gap-1"
              >
                <span>Catalog public</span>
                <span className="text-neutral-400">↗</span>
              </button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
