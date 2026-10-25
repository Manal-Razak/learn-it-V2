const dayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })
const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

/** "Thu 30 Oct, 16:00" */
export function formatSlot(iso: string): string {
  const d = new Date(iso)
  return `${dayFmt.format(d)}, ${timeFmt.format(d)}`
}

/** "14:02" */
export function formatTime(iso: string): string {
  return timeFmt.format(new Date(iso))
}

/** "Today", "Yesterday" or "26 Oct" */
export function formatDay(iso: string, now = new Date()): string {
  const d = new Date(iso)
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86_400_000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return dateFmt.format(d)
}

/** Three bookable slots over the next few days. */
export function upcomingSlots(now = new Date()): string[] {
  const plan: [days: number, hour: number][] = [
    [1, 18],
    [2, 16],
    [4, 10],
  ]
  return plan.map(([days, hour]) => {
    const d = new Date(now)
    d.setDate(d.getDate() + days)
    d.setHours(hour, 0, 0, 0)
    return d.toISOString()
  })
}
