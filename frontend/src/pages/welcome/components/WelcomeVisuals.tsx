export function WorkstationVisual() {
  return (
    <div className="w-full h-full bg-[#070b14] relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10" />
      <svg viewBox="0 0 240 140" className="w-full h-full object-cover">
        <rect width="240" height="140" fill="#060911" />
        <circle cx="120" cy="70" r="52" fill="none" stroke="#00f0ff" strokeWidth="3" opacity="0.9" filter="drop-shadow(0 0 10px #00f0ff)" />
        <circle cx="120" cy="70" r="42" fill="none" stroke="#0ea5e9" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.6" />
        <circle cx="120" cy="70" r="18" fill="#080f20" stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx="120" cy="70" r="8" fill="#38bdf8" />
        <path d="M120 52 C138 54 152 64 154 70 C142 74 130 63 120 52 Z" fill="#0284c7" opacity="0.75" />
        <path d="M138 70 C148 86 142 102 136 106 C126 98 130 84 138 70 Z" fill="#0284c7" opacity="0.75" />
        <path d="M120 88 C102 86 88 76 86 70 C98 66 110 77 120 88 Z" fill="#0284c7" opacity="0.75" />
        <path d="M102 70 C92 54 98 38 104 34 C114 42 110 56 102 70 Z" fill="#0284c7" opacity="0.75" />
        <circle cx="210" cy="70" r="45" fill="none" stroke="#00f0ff" strokeWidth="2" opacity="0.4" />
        <line x1="20" y1="20" x2="20" y2="120" stroke="#1e293b" strokeWidth="2" />
        <line x1="30" y1="20" x2="30" y2="120" stroke="#1e293b" strokeWidth="2" />
      </svg>
    </div>
  )
}

export function RobotArmVisual() {
  return (
    <div className="w-full h-full bg-[#eef2f6] relative flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 240 140" className="w-full h-full object-contain p-2">
        <rect x="80" y="112" width="80" height="14" rx="3" fill="#1e293b" />
        <rect x="100" y="98" width="40" height="14" rx="2" fill="#0284c7" />
        <circle cx="120" cy="94" r="9" fill="#0369a1" stroke="#e2e8f0" strokeWidth="2" />
        <line x1="120" y1="94" x2="94" y2="56" stroke="#0284c7" strokeWidth="10" strokeLinecap="round" />
        <circle cx="94" cy="56" r="7.5" fill="#0f172a" stroke="#e2e8f0" strokeWidth="2" />
        <line x1="94" y1="56" x2="142" y2="36" stroke="#0284c7" strokeWidth="8" strokeLinecap="round" />
        <circle cx="142" cy="36" r="6.5" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1.5" />
        <line x1="142" y1="36" x2="158" y2="46" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
        <path d="M158 42 L170 39 M158 50 L170 53" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function IotKitVisual() {
  return (
    <div className="w-full h-full bg-[#0a0e17] relative flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 240 140" className="w-full h-full object-contain p-2">
        <rect x="48" y="24" width="144" height="92" rx="6" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
        <rect x="60" y="34" width="70" height="54" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <line x1="68" y1="42" x2="122" y2="42" stroke="#0f172a" strokeWidth="2.5" />
        <line x1="68" y1="50" x2="122" y2="50" stroke="#0f172a" strokeWidth="2.5" />
        <line x1="68" y1="58" x2="122" y2="58" stroke="#0f172a" strokeWidth="2.5" />
        <line x1="68" y1="66" x2="122" y2="66" stroke="#0f172a" strokeWidth="2.5" />
        <line x1="68" y1="74" x2="122" y2="74" stroke="#0f172a" strokeWidth="2.5" />
        <rect x="140" y="34" width="42" height="26" rx="2" fill="#0f172a" stroke="#22c55e" strokeWidth="1" />
        <text x="148" y="51" fill="#22c55e" fontSize="9" fontFamily="monospace" fontWeight="bold">AI-IOT</text>
        <circle cx="150" cy="74" r="3.5" fill="#eab308" />
        <circle cx="162" cy="74" r="3.5" fill="#ef4444" />
        <circle cx="174" cy="74" r="3.5" fill="#3b82f6" />
        <line x1="58" y1="104" x2="182" y2="104" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4 2" />
      </svg>
    </div>
  )
}

export function OscilloscopeVisual() {
  return (
    <div className="w-full h-full bg-[#1e2638] relative flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 240 140" className="w-full h-full object-contain p-2">
        <rect x="25" y="16" width="190" height="108" rx="5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
        <rect x="36" y="26" width="108" height="86" rx="3" fill="#051726" stroke="#0f766e" strokeWidth="1" />
        <line x1="36" y1="69" x2="144" y2="69" stroke="#0f766e" strokeWidth="0.5" strokeDasharray="3 3" />
        <line x1="90" y1="26" x2="90" y2="112" stroke="#0f766e" strokeWidth="0.5" strokeDasharray="3 3" />
        <path d="M38 69 Q50 40 62 69 T86 69 T110 69 T134 69" fill="none" stroke="#22c55e" strokeWidth="2" />
        <circle cx="164" cy="42" r="9" fill="#475569" stroke="#334155" strokeWidth="1" />
        <circle cx="190" cy="42" r="9" fill="#475569" stroke="#334155" strokeWidth="1" />
        <circle cx="164" cy="74" r="6.5" fill="#64748b" />
        <circle cx="190" cy="74" r="6.5" fill="#64748b" />
        <circle cx="164" cy="98" r="5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
        <circle cx="190" cy="98" r="5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
      </svg>
    </div>
  )
}

export function Printer3DVisual() {
  return (
    <div className="w-full h-full bg-[#18202d] relative flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 240 140" className="w-full h-full object-contain p-2">
        <rect x="55" y="14" width="130" height="114" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="2" />
        <rect x="68" y="26" width="104" height="90" rx="2" fill="#1e293b" stroke="#0284c7" strokeWidth="0.6" opacity="0.9" />
        <line x1="78" y1="26" x2="78" y2="116" stroke="#94a3b8" strokeWidth="3" />
        <line x1="162" y1="26" x2="162" y2="116" stroke="#94a3b8" strokeWidth="3" />
        <line x1="78" y1="58" x2="162" y2="58" stroke="#cbd5e1" strokeWidth="3.5" />
        <rect x="112" y="52" width="18" height="15" rx="2" fill="#f97316" />
        <polygon points="121,67 117,75 125,75" fill="#fbbf24" />
        <rect x="90" y="96" width="60" height="8" rx="1.5" fill="#475569" stroke="#64748b" strokeWidth="0.5" />
        <circle cx="120" cy="10" r="8" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
      </svg>
    </div>
  )
}
