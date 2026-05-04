import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Repeat } from "lucide-react"
import Link from "next/link"

interface RecurringItem {
  id: string
  vendorId: string
  cadence: string
  amountCentsAvg: number
  vendor: { name: string; id: string }
}

export function NewRecurringList({ items }: { items: RecurringItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Repeat className="h-4 w-4" />Recurring Subscriptions</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No recurring subscriptions detected yet</p>
        ) : (
          <div className="space-y-2">
            {items.slice(0, 8).map((item) => (
              <Link key={item.id} href={"/app/vendors/" + item.vendor.id} className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-muted/30 px-1 rounded transition-colors">
                <div>
                  <p className="text-sm font-medium">{item.vendor.name}</p>
                  <Badge variant="secondary" className="text-xs mt-1">{item.cadence}</Badge>
                </div>
                <p className="text-sm font-medium">{formatCurrency(item.amountCentsAvg)}</p>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
