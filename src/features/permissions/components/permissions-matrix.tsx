"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { PERMISSION_GROUPS } from "@/constants/permissions"
import { cn } from "@/lib/utils"

interface PermissionsMatrixProps {
  value: string[]
  onChange: (value: string[]) => void
  readOnly?: boolean
  className?: string
}

export function PermissionsMatrix({ value = [], onChange, readOnly = false, className }: PermissionsMatrixProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  const handleGroupToggle = (groupPerms: string[], isChecked: boolean) => {
    if (readOnly) return
    const current = new Set(value)
    groupPerms.forEach(p => isChecked ? current.add(p) : current.delete(p))
    onChange(Array.from(current))
  }

  const togglePermission = (perm: string, checked: boolean) => {
    if (readOnly) return
    const current = new Set(value)
    checked ? current.add(perm) : current.delete(perm)
    onChange(Array.from(current))
  }

  const toggleGroupExpansion = (groupName: string) => {
    setExpandedGroups(prev => ({...prev, [groupName]: !prev[groupName]}))
  }

  return (
    <div className={cn("border-t divide-y border-slate-200", className)}>
      {PERMISSION_GROUPS.map((group) => {
        const groupPerms = group.permissions
        const selectedInGroup = groupPerms.filter(p => value.includes(p))
        const isAllSelected = selectedInGroup.length === groupPerms.length
        const isIndeterminate = selectedInGroup.length > 0 && !isAllSelected
        const isExpanded = expandedGroups[group.name]

        return (
          <div key={group.name} className="bg-white">
            <div className="flex items-center justify-between p-3 px-5 group hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-4 flex-1">
                <Checkbox 
                  checked={isAllSelected ? true : isIndeterminate ? "indeterminate" : false}
                  onCheckedChange={(checked) => handleGroupToggle(groupPerms, checked === true)}
                  disabled={readOnly}
                  className="h-4 w-4"
                />
                <div 
                  className="flex items-center gap-2 cursor-pointer flex-1 select-none"
                  onClick={() => toggleGroupExpansion(group.name)}
                >
                  <span className="text-xs font-bold text-slate-600">{group.name}</span>
                  <Badge variant="ghost" className="text-[9px] h-4 bg-slate-100 text-slate-400 font-bold">
                    {selectedInGroup.length}/{groupPerms.length}
                  </Badge>
                </div>
              </div>
              <Button 
                variant="ghost" size="sm" type="button"
                onClick={() => toggleGroupExpansion(group.name)}
                className="h-7 w-7 p-0"
              >
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </Button>
            </div>

            {isExpanded && (
              <div className="px-5 pb-4 ml-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 animate-in fade-in duration-150">
                {groupPerms.map((perm) => (
                  <div key={perm} className="flex items-center gap-2">
                    <Checkbox 
                      id={`perm-${perm}`}
                      checked={value.includes(perm)}
                      onCheckedChange={(checked) => togglePermission(perm, checked === true)}
                      disabled={readOnly}
                      className="h-3.5 w-3.5"
                    />
                    <label htmlFor={`perm-${perm}`} className={cn("text-[10px] font-medium text-slate-500 cursor-pointer select-none", readOnly && "cursor-default")}>
                      {perm.split(/[.:_]/).pop()?.replace('_', ' ').toUpperCase()}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
