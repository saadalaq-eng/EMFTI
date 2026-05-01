import { GraduationCap } from 'lucide-react'

export default function Header({ children }) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <GraduationCap size={15} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-base tracking-tight">EMFTI</span>
        </div>
        {children}
      </div>
    </header>
  )
}
