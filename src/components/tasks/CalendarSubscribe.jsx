import { useState, useEffect, useRef } from 'react'
import { CalendarPlus, Smartphone, Copy, Check } from 'lucide-react'

const feedPath = `${window.location.host}${import.meta.env.BASE_URL}calendar.ics`
const WEBCAL_URL = `webcal://${feedPath}`
const HTTPS_URL = `https://${feedPath}`

export default function CalendarSubscribe() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(HTTPS_URL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this calendar link:', HTTPS_URL)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Sync with your calendar"
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        <CalendarPlus size={14} />
        <span className="hidden sm:inline">Sync</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-1.5 z-50">
          <a
            href={WEBCAL_URL}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <Smartphone size={16} className="text-indigo-600" />
            Add to iPhone Calendar
          </a>
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left text-gray-700 hover:bg-gray-50"
          >
            {copied ? (
              <Check size={16} className="text-emerald-600" />
            ) : (
              <Copy size={16} className="text-indigo-600" />
            )}
            {copied ? 'Link copied' : 'Copy link (Google / Outlook)'}
          </button>
        </div>
      )}
    </div>
  )
}
