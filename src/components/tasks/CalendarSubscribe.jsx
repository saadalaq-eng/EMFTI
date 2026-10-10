import { useState } from 'react'
import { CalendarPlus, Copy, Check } from 'lucide-react'

const feedPath = `${window.location.host}${import.meta.env.BASE_URL}calendar.ics`
const WEBCAL_URL = `webcal://${feedPath}`
const HTTPS_URL = `https://${feedPath}`

export default function CalendarSubscribe() {
  const [copied, setCopied] = useState(false)

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
    <div className="flex items-center gap-2 mb-4">
      <a
        href={WEBCAL_URL}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
      >
        <CalendarPlus size={16} />
        Add to iPhone Calendar
      </a>
      <button
        onClick={copyLink}
        title="Copy calendar link (Google, Outlook)"
        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:border-gray-300 transition-colors"
      >
        {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
        <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy link'}</span>
      </button>
    </div>
  )
}
