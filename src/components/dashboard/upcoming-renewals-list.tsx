import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Calendar } from "lucide-react"

interface Renewal {
  id: string
  vendorName: string
  amountCents: number
  nextExpectedDate: Date | null
  cadence: string
}

export function UpcomingRenewalsList({ renewals }: { renewals: Renewal[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Calendar className="h-4 w-4" />Upcoming Renewals</CardTitle>
      </CardHeader>
      <CardContent>
        {renewals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No upcoming renewals detected yet</p>
        ) : (
          <div className="space-y-3">
            {renewals.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{r.vendorName}</p>
                  <p className="text-xs text-muted-foreground">{r.nextExpectedDate ? formatDate(r.nextExpectedDate) : "Unknown"}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{formatCurrency(r.amountCents)}</p>
                  <Badge variant="secondary" className="text-xs">{r.cadence}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
