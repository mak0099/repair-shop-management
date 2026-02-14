// Helper to access nested properties using a string path like "branch.name"
export function getNestedValue(obj: unknown, path: string): unknown {
  return path.split(".").reduce((o: unknown, k: string) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj)
}

export function applySort<T>(data: T[], sort: string | null, order: string | null): T[] {
  if (!sort || !order) {
    return data
  }

  // Use a stable sort by creating a shallow copy
  return [...data].sort((a, b) => {
    const valA = getNestedValue(a, sort)
    const valB = getNestedValue(b, sort)

    if (valA === null || typeof valA === "undefined") return 1
    if (valB === null || typeof valB === "undefined") return -1

    const comparison = String(valA).localeCompare(String(valB), undefined, {
      numeric: true,
      sensitivity: "base",
    })

    return order === "asc" ? comparison : -comparison
  })
}