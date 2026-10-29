// Builds an iCalendar (.ics) feed from the Firestore `tasks` collection so
// students can subscribe from iPhone / Google / Outlook calendars.
//
// Usage: node scripts/build-ics.mjs <output-file>
// Reads VITE_FIREBASE_PROJECT_ID and VITE_FIREBASE_API_KEY from the
// environment or from .env (tasks are publicly readable, no login needed).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const TYPE_LABELS = {
  presentation: 'Presentation',
  project: 'Project',
  midterm: 'Mid-term Exam',
  final: 'Final Exam',
  submission: 'Submission',
}

function loadEnv() {
  const env = { ...process.env }
  try {
    for (const line of readFileSync('.env', 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)
      if (m && !env[m[1]]) env[m[1]] = m[2]
    }
  } catch {
    // no .env file — rely on process.env
  }
  return env
}

async function fetchTasks(projectId, apiKey) {
  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/tasks`
  const tasks = []
  let pageToken = ''
  do {
    const url = `${base}?pageSize=300&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ''}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Firestore ${res.status}: ${await res.text()}`)
    const data = await res.json()
    for (const d of data.documents ?? []) {
      const fields = Object.fromEntries(
        Object.entries(d.fields ?? {}).map(([k, v]) => [k, Object.values(v)[0]]),
      )
      tasks.push({ id: d.name.split('/').pop(), updateTime: d.updateTime, ...fields })
    }
    pageToken = data.nextPageToken ?? ''
  } while (pageToken)
  return tasks
}

const escapeText = (s) =>
  String(s ?? '')
    .trim()
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')

// RFC 5545: lines longer than 75 octets are folded with CRLF + space
function fold(line) {
  const bytes = Buffer.from(line, 'utf8')
  if (bytes.length <= 75) return line
  const parts = []
  let current = ''
  let size = 0
  for (const ch of line) {
    const n = Buffer.byteLength(ch, 'utf8')
    if (size + n > (parts.length ? 74 : 75)) {
      parts.push(current)
      current = ''
      size = 0
    }
    current += ch
    size += n
  }
  parts.push(current)
  return parts.join('\r\n ')
}

const toDate = (iso) => iso.replace(/-/g, '')
const toStamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

function nextDay(iso) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

function buildEvent(task) {
  const typeLabel = TYPE_LABELS[task.type] ?? task.type ?? ''
  const details = [
    typeLabel && `Type: ${typeLabel}`,
    task.courseName && `Course: ${task.courseCode ?? ''} – ${task.courseName}`,
    task.doctor && `Doctor: ${task.doctor}`,
    task.description,
    task.attachmentUrl && `Attachment: ${task.attachmentUrl}`,
  ].filter(Boolean)

  return [
    'BEGIN:VEVENT',
    `UID:${task.id}@emfti`,
    `DTSTAMP:${toStamp(task.updateTime ?? new Date().toISOString())}`,
    `DTSTART;VALUE=DATE:${toDate(task.dueDate)}`,
    `DTEND;VALUE=DATE:${toDate(nextDay(task.dueDate))}`,
    `SUMMARY:${escapeText(`${task.courseCode ? `${task.courseCode.trim()} · ` : ''}${task.title}`)}`,
    `DESCRIPTION:${escapeText(details.join('\n'))}`,
    typeLabel && `CATEGORIES:${escapeText(typeLabel)}`,
    'TRANSP:TRANSPARENT',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(task.title)}`,
    'TRIGGER:-PT15H',
    'END:VALARM',
    'END:VEVENT',
  ].filter(Boolean)
}

export function buildCalendar(tasks) {
  const events = tasks
    .filter((t) => /^\d{4}-\d{2}-\d{2}$/.test(t.dueDate ?? ''))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .flatMap(buildEvent)

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EMFTI//Task Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:EMFTI',
    'X-WR-TIMEZONE:Asia/Riyadh',
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
    'X-PUBLISHED-TTL:PT1H',
    ...events,
    'END:VCALENDAR',
  ]
    .map(fold)
    .join('\r\n') + '\r\n'
}

const output = process.argv[2]
if (!output) {
  console.error('Usage: node scripts/build-ics.mjs <output-file>')
  process.exit(1)
}

const env = loadEnv()
const projectId = env.VITE_FIREBASE_PROJECT_ID
const apiKey = env.VITE_FIREBASE_API_KEY
if (!projectId || !apiKey) {
  console.error('Missing VITE_FIREBASE_PROJECT_ID or VITE_FIREBASE_API_KEY')
  process.exit(1)
}

const tasks = await fetchTasks(projectId, apiKey)
mkdirSync(dirname(output), { recursive: true })
writeFileSync(output, buildCalendar(tasks))
console.log(`Wrote ${tasks.length} tasks to ${output}`)
