"use client"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, Loader2 } from "lucide-react"

export function CsvUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.name.endsWith(".csv")) setFile(dropped)
    else toast({ variant: "destructive", title: "Invalid file", description: "Please upload a CSV file" })
  }, [toast])

  const handleSubmit = async () => {
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/import/csv", { method: "POST", body: formData })
    const data = await res.json()
    setUploading(false)
    if (res.ok) {
      toast({ title: "Import complete", description: "Processed " + data.count + " transactions" })
      router.push("/app/transactions")
      router.refresh()
    } else {
      toast({ variant: "destructive", title: "Import failed", description: data.error ?? "Unknown error" })
    }
  }

  return (
    <div className="space-y-4">
      <Card
        className={"border-2 border-dashed transition-colors cursor-pointer " + (dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("csv-input")?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Upload className="h-10 w-10 text-muted-foreground mb-4" />
          {file ? (
            <div className="text-center">
              <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="font-medium">Drop your CSV file here</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
              <p className="text-xs text-muted-foreground mt-2">Supports Chase, Bank of America, Amex, and generic CSV formats</p>
            </div>
          )}
        </CardContent>
      </Card>
      <input id="csv-input" type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f) }} />
      <Button onClick={handleSubmit} disabled={!file || uploading} className="w-full" size="lg">
        {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : "Import Transactions"}
      </Button>
    </div>
  )
}
