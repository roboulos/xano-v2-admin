"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Download, ArrowRight, CheckCircle2, XCircle, AlertTriangle, Layers, Hash, Key, Link2, Columns } from "lucide-react"

// ============================================================================
// TYPES
// ============================================================================

type ComparisonType = "table" | "function" | "endpoint"

type ComparisonStatus = "match" | "missing_in_v2" | "missing_in_v1" | "different"

interface SchemaField {
  name: string
  type: string
  required: boolean
  unique: boolean
  indexed: boolean
  reference?: string
}

interface TableSchema {
  id: number
  name: string
  fields: SchemaField[]
}

interface FieldComparison {
  fieldName: string
  v1Field: SchemaField | null
  v2Field: SchemaField | null
  status: ComparisonStatus
  differences?: string[]
}

interface FunctionMetadata {
  id: number
  name: string
  type: string
  category: string
  tags: string[]
  last_modified: string
  inputs?: Array<{ name: string; type: string; required: boolean }>
  outputs?: Array<{ name: string; type: string }>
}

interface FunctionComparison {
  field: string
  v1Value: string | string[] | null
  v2Value: string | string[] | null
  status: ComparisonStatus
}

interface ComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  type: ComparisonType
  v1Id?: number | string
  v2Id?: number | string
  v1Name: string
  v2Name?: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getStatusColor(status: ComparisonStatus) {
  switch (status) {
    case "match":
      return "bg-green-50 text-green-700 border-green-200"
    case "missing_in_v1":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "missing_in_v2":
      return "bg-amber-50 text-amber-700 border-amber-200"
    case "different":
      return "bg-orange-50 text-orange-700 border-orange-200"
  }
}

function getStatusIcon(status: ComparisonStatus) {
  switch (status) {
    case "match":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case "missing_in_v1":
      return <Layers className="h-4 w-4 text-blue-500" />
    case "missing_in_v2":
      return <AlertTriangle className="h-4 w-4 text-amber-500" />
    case "different":
      return <XCircle className="h-4 w-4 text-orange-500" />
  }
}

function getStatusLabel(status: ComparisonStatus) {
  switch (status) {
    case "match":
      return "Match"
    case "missing_in_v1":
      return "New in V2"
    case "missing_in_v2":
      return "Removed"
    case "different":
      return "Changed"
  }
}

function getFieldTypeIcon(field: SchemaField) {
  if (field.reference) return <Link2 className="h-3 w-3" />
  if (field.unique) return <Key className="h-3 w-3" />
  if (field.indexed) return <Hash className="h-3 w-3" />
  return <Columns className="h-3 w-3" />
}

function compareFields(v1Field: SchemaField | null, v2Field: SchemaField | null): { status: ComparisonStatus; differences: string[] } {
  if (!v1Field && v2Field) {
    return { status: "missing_in_v1", differences: ["New field in V2"] }
  }
  if (v1Field && !v2Field) {
    return { status: "missing_in_v2", differences: ["Field removed in V2"] }
  }
  if (!v1Field || !v2Field) {
    return { status: "match", differences: [] }
  }

  const differences: string[] = []

  if (v1Field.type !== v2Field.type) {
    differences.push(`Type: ${v1Field.type} → ${v2Field.type}`)
  }
  if (v1Field.required !== v2Field.required) {
    differences.push(`Required: ${v1Field.required} → ${v2Field.required}`)
  }
  if (v1Field.unique !== v2Field.unique) {
    differences.push(`Unique: ${v1Field.unique} → ${v2Field.unique}`)
  }
  if (v1Field.indexed !== v2Field.indexed) {
    differences.push(`Indexed: ${v1Field.indexed} → ${v2Field.indexed}`)
  }
  if (v1Field.reference !== v2Field.reference) {
    differences.push(`Reference: ${v1Field.reference || "none"} → ${v2Field.reference || "none"}`)
  }

  return {
    status: differences.length > 0 ? "different" : "match",
    differences,
  }
}

function exportDiff(comparisons: FieldComparison[] | FunctionComparison[], name: string) {
  const csv = [
    ["Field", "V1 Value", "V2 Value", "Status", "Differences"],
    ...comparisons.map((comp) => {
      if ("fieldName" in comp) {
        return [
          comp.fieldName,
          comp.v1Field ? `${comp.v1Field.type}${comp.v1Field.required ? "*" : ""}` : "-",
          comp.v2Field ? `${comp.v2Field.type}${comp.v2Field.required ? "*" : ""}` : "-",
          getStatusLabel(comp.status),
          comp.differences?.join("; ") || "-",
        ]
      } else {
        return [
          comp.field,
          Array.isArray(comp.v1Value) ? comp.v1Value.join(", ") : comp.v1Value || "-",
          Array.isArray(comp.v2Value) ? comp.v2Value.join(", ") : comp.v2Value || "-",
          getStatusLabel(comp.status),
          "-",
        ]
      }
    }),
  ]

  const csvContent = csv.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${name}-comparison-${new Date().toISOString().split("T")[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ComparisonModal({ isOpen, onClose, type, v1Id, v2Id, v1Name, v2Name }: ComparisonModalProps) {
  const [v1Data, setV1Data] = useState<TableSchema | FunctionMetadata | null>(null)
  const [v2Data, setV2Data] = useState<TableSchema | FunctionMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        if (type === "table") {
          // Fetch V1 table schema
          const v1Response = await fetch(`/api/v1/tables/${v1Id || v1Name}`)
          if (!v1Response.ok) throw new Error("Failed to fetch V1 table schema")
          const v1TableData = await v1Response.json()
          setV1Data(v1TableData)

          // Fetch V2 table schema
          const v2Response = await fetch(`/api/v2/tables/${v2Id || v2Name || v1Name}`)
          if (!v2Response.ok) throw new Error("Failed to fetch V2 table schema")
          const v2TableData = await v2Response.json()
          setV2Data(v2TableData)
        } else if (type === "function") {
          // Fetch V1 function metadata
          const v1Response = await fetch(`/api/v1/functions/${v1Id}`)
          if (!v1Response.ok) throw new Error("Failed to fetch V1 function metadata")
          const v1FuncData = await v1Response.json()
          setV1Data(v1FuncData)

          // Fetch V2 function metadata
          const v2Response = await fetch(`/api/v2/functions/${v2Id || v1Id}`)
          if (!v2Response.ok) throw new Error("Failed to fetch V2 function metadata")
          const v2FuncData = await v2Response.json()
          setV2Data(v2FuncData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isOpen, type, v1Id, v2Id, v1Name, v2Name])

  // Generate comparisons based on type
  const comparisons: FieldComparison[] | FunctionComparison[] = (() => {
    if (type === "table" && v1Data && v2Data) {
      const v1Table = v1Data as TableSchema
      const v2Table = v2Data as TableSchema

      const v1FieldMap = new Map(v1Table.fields.map((f) => [f.name, f]))
      const v2FieldMap = new Map(v2Table.fields.map((f) => [f.name, f]))
      const allFieldNames = new Set([...v1FieldMap.keys(), ...v2FieldMap.keys()])

      const fieldComparisons: FieldComparison[] = []

      for (const fieldName of allFieldNames) {
        const v1Field = v1FieldMap.get(fieldName) || null
        const v2Field = v2FieldMap.get(fieldName) || null
        const { status, differences } = compareFields(v1Field, v2Field)

        fieldComparisons.push({
          fieldName,
          v1Field,
          v2Field,
          status,
          differences: differences.length > 0 ? differences : undefined,
        })
      }

      // Sort: match first, then different, then missing
      fieldComparisons.sort((a, b) => {
        const order = { match: 0, different: 1, missing_in_v2: 2, missing_in_v1: 3 }
        return order[a.status] - order[b.status]
      })

      return fieldComparisons
    } else if (type === "function" && v1Data && v2Data) {
      const v1Func = v1Data as FunctionMetadata
      const v2Func = v2Data as FunctionMetadata

      const funcComparisons: FunctionComparison[] = []

      // Compare metadata fields
      const fields = ["name", "type", "category", "tags", "last_modified"]
      for (const field of fields) {
        const v1Value = v1Func[field as keyof FunctionMetadata]
        const v2Value = v2Func[field as keyof FunctionMetadata]
        const v1Str: string | string[] = Array.isArray(v1Value)
          ? (v1Value as string[])
          : String(v1Value || "")
        const v2Str: string | string[] = Array.isArray(v2Value)
          ? (v2Value as string[])
          : String(v2Value || "")

        let status: ComparisonStatus = "match"
        if (JSON.stringify(v1Str) !== JSON.stringify(v2Str)) {
          status = "different"
        }

        funcComparisons.push({
          field,
          v1Value: v1Str,
          v2Value: v2Str,
          status,
        })
      }

      return funcComparisons
    }

    return []
  })()

  const summary = comparisons.reduce(
    (acc, comp) => {
      acc[comp.status]++
      return acc
    },
    { match: 0, missing_in_v1: 0, missing_in_v2: 0, different: 0 }
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            V1 vs V2 Comparison: {v1Name}
          </DialogTitle>
          <DialogDescription>
            {type === "table" ? "Table schema field-by-field comparison" : "Function metadata comparison"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card className={summary.match > 0 ? "border-green-200 bg-green-50" : ""}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-700">{summary.match}</div>
                  <div className="text-sm text-green-600">Matching</div>
                </CardContent>
              </Card>
              <Card className={summary.different > 0 ? "border-orange-200 bg-orange-50" : ""}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-700">{summary.different}</div>
                  <div className="text-sm text-orange-600">Changed</div>
                </CardContent>
              </Card>
              <Card className={summary.missing_in_v2 > 0 ? "border-amber-200 bg-amber-50" : ""}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-amber-700">{summary.missing_in_v2}</div>
                  <div className="text-sm text-amber-600">Removed</div>
                </CardContent>
              </Card>
              <Card className={summary.missing_in_v1 > 0 ? "border-blue-200 bg-blue-50" : ""}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-700">{summary.missing_in_v1}</div>
                  <div className="text-sm text-blue-600">New in V2</div>
                </CardContent>
              </Card>
            </div>

            {/* Comparison Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/20">
                  <tr>
                    <th className="text-left px-4 py-2 text-sm font-medium">Field</th>
                    <th className="text-left px-4 py-2 text-sm font-medium">V1</th>
                    <th className="text-center px-4 py-2 text-sm font-medium"></th>
                    <th className="text-left px-4 py-2 text-sm font-medium">V2</th>
                    <th className="text-left px-4 py-2 text-sm font-medium">Status</th>
                    <th className="text-left px-4 py-2 text-sm font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {comparisons.map((comp, index) => {
                    if ("fieldName" in comp) {
                      const fieldComp = comp as FieldComparison
                      return (
                        <tr key={index} className={`hover:bg-muted/10 ${getStatusColor(fieldComp.status)}`}>
                          <td className="px-4 py-2 font-mono text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                {fieldComp.v1Field ? getFieldTypeIcon(fieldComp.v1Field) : fieldComp.v2Field ? getFieldTypeIcon(fieldComp.v2Field) : null}
                              </span>
                              {fieldComp.fieldName}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {fieldComp.v1Field ? (
                              <div className="flex items-center gap-1">
                                <code className="bg-blue-50 px-2 py-0.5 rounded text-blue-700">
                                  {fieldComp.v1Field.type}
                                </code>
                                {fieldComp.v1Field.required && <span className="text-red-500">*</span>}
                                {fieldComp.v1Field.indexed && <Hash className="h-3 w-3 text-blue-500" />}
                                {fieldComp.v1Field.unique && <Key className="h-3 w-3 text-purple-500" />}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <ArrowRight className="h-4 w-4 text-muted-foreground inline" />
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {fieldComp.v2Field ? (
                              <div className="flex items-center gap-1">
                                <code className="bg-green-50 px-2 py-0.5 rounded text-green-700">
                                  {fieldComp.v2Field.type}
                                </code>
                                {fieldComp.v2Field.required && <span className="text-red-500">*</span>}
                                {fieldComp.v2Field.indexed && <Hash className="h-3 w-3 text-blue-500" />}
                                {fieldComp.v2Field.unique && <Key className="h-3 w-3 text-purple-500" />}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(fieldComp.status)}
                              <Badge variant="outline" className={`text-xs ${getStatusColor(fieldComp.status)}`}>
                                {getStatusLabel(fieldComp.status)}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm text-muted-foreground">
                            {fieldComp.differences?.join(", ") || "-"}
                          </td>
                        </tr>
                      )
                    } else {
                      const funcComp = comp as FunctionComparison
                      return (
                        <tr key={index} className={`hover:bg-muted/10 ${getStatusColor(funcComp.status)}`}>
                          <td className="px-4 py-2 font-mono text-sm capitalize">{funcComp.field}</td>
                          <td className="px-4 py-2 text-sm">
                            {Array.isArray(funcComp.v1Value) ? (
                              <div className="flex flex-wrap gap-1">
                                {funcComp.v1Value.map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">{funcComp.v1Value || "-"}</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <ArrowRight className="h-4 w-4 text-muted-foreground inline" />
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {Array.isArray(funcComp.v2Value) ? (
                              <div className="flex flex-wrap gap-1">
                                {funcComp.v2Value.map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">{funcComp.v2Value || "-"}</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(funcComp.status)}
                              <Badge variant="outline" className={`text-xs ${getStatusColor(funcComp.status)}`}>
                                {getStatusLabel(funcComp.status)}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm text-muted-foreground">-</td>
                        </tr>
                      )
                    }
                  })}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 text-xs text-blue-600">
                  <span>* = Required</span>
                  <span>
                    <Hash className="h-3 w-3 inline" /> = Indexed
                  </span>
                  <span>
                    <Key className="h-3 w-3 inline" /> = Unique
                  </span>
                  <span>
                    <Link2 className="h-3 w-3 inline" /> = Foreign Key
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="outline"
            onClick={() => exportDiff(comparisons, v1Name)}
            disabled={loading || comparisons.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Diff
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
