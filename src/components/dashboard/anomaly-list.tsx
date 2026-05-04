import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"

interface Anomaly {
  id: string
  type: string
  severity: string
  explanation: string
  createdAt: Date
  vendor: { name: string } | null
}

function getSeverityVariant(severity: string) {
  if (severity === "HIGH") return "destructive"
  if (severity === "MEDIUM") return "warning"
  return "secondary"
}

export function AnomalyList({ anomalies }: { anomalies: Anomaly[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />Anomalies
        </CardTitle>
      </CardHeader>
      <CardContent>
        {anomalies.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No anomalies detected</p>
        ) : (
          <div className="space-y-3">
            {anomalies.map((a) => (
              <div key={a.id} className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{a.vendor?.name ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{a.explanation}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(a.createdAt)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Badge variant="outline" className="text-xs">{a.type}</Badge>
                    <Badge variant={getSeverityVariant(a.severity) as "default" | "destructive" | "warning" | "secondary" | "outline"} className="text-xs">{a.severity}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
