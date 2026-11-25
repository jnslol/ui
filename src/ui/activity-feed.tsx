import { History } from "lucide-react"
import { Avatar } from "./avatar"
import { Badge, EmptyState, type Tone } from "./display"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"

export type ActivityEntry = {
  id: string
  actor: string
  action: string
  when: string
  dateTime?: string
  status?: { label: string; tone: Tone }
}

export function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Activity</CardTitle><CardDescription>Recent changes in this workspace.</CardDescription></CardHeader>
      {entries.length === 0 ? (
        <EmptyState icon={<History aria-hidden />} title="No activity yet" description="Changes will appear here." />
      ) : (
        <CardContent className="pb-0">
          <ul className="divide-y divide-divider">
            {entries.map(({ id, actor, action, when, dateTime, status }) => (
              <li key={id} className="flex flex-wrap items-start gap-3 py-3">
                <Avatar name={actor} size="md" />
                <div className="min-w-0 flex-1 basis-32">
                  <p className="wrap-break-word"><strong className="font-semibold">{actor}</strong> {action}</p>
                  {dateTime ? <time dateTime={dateTime} className="text-label text-muted">{when}</time> : <span className="text-label text-muted">{when}</span>}
                </div>
                {status && <Badge tone={status.tone} dot>{status.label}</Badge>}
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  )
}
