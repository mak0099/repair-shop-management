"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { PERMISSION_GROUPS, PermissionType } from "@/constants/permissions"
import { cn } from "@/lib/utils"

interface PermissionsMatrixProps {
  value: PermissionType[] // Updated to use strict type
  onChange: (value: PermissionType[]) => void // Updated to use strict type
  readOnly?: boolean
  className?: string
}

export function PermissionsMatrix({ value = [], onChange, readOnly = false, className }: PermissionsMatrixProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  const handleGroupToggle = (groupPerms: string[], isChecked: boolean) => {
    if (readOnly) return
    const current = new Set<string>(value)
    
    if (isChecked) {
      groupPerms.forEach(p => current.add(p))
    } else {
      groupPerms.forEach(p => current.delete(p))
    }
    onChange(Array.from(current) as PermissionType[])
  }

  const togglePermission = (perm: string, checked: boolean) => {
    if (readOnly) return
    const current = new Set<string>(value)
    
    if (checked) {
      current.add(perm)
    } else {
      current.delete(perm)
    }
    onChange(Array.from(current) as PermissionType[])
  }

  return (
    <div className={cn("border-t divide-y border-border", className)}>
      {PERMISSION_GROUPS.map((group) => {
        const groupPerms = group.permissions
        const selectedInGroup = groupPerms.filter(p => value.includes(p as PermissionType))
        const isAllSelected = selectedInGroup.length === groupPerms.length
        const isIndeterminate = selectedInGroup.length > 0 && !isAllSelected
        const isExpanded = expandedGroups[group.name]

        return (
          <div key={group.name} className="bg-card">
            <div className="flex items-center justify-between p-3 px-5 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4 flex-1">
                <Checkbox 
                  checked={isAllSelected ? true : isIndeterminate ? "indeterminate" : false}
                  onCheckedChange={(checked) => handleGroupToggle(groupPerms, checked === true)}
                  disabled={readOnly}
                />
                <div 
                  className="flex items-center gap-2 cursor-pointer flex-1 select-none"
                  onClick={() => setExpandedGroups(p => ({...p, [group.name]: !isExpanded}))}
                >
                  <span className="text-xs font-bold text-foreground">{group.name}</span>
                  <Badge variant="secondary" className="text-[9px] h-4 bg-muted text-muted-foreground font-bold border-none">
                    {selectedInGroup.length}/{groupPerms.length}
                  </Badge>
                </div>
              </div>
              <Button 
                variant="ghost" size="sm" type="button"
                onClick={() => setExpandedGroups(p => ({...p, [group.name]: !isExpanded}))}
                className="h-7 w-7 p-0"
              >
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </Button>
            </div>

            {isExpanded && (
              <div className="px-5 pb-4 ml-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {groupPerms.map((perm) => (
                  <div key={perm} className="flex items-center gap-2 py-1">
                    <Checkbox 
                      id={`perm-${perm}`}
                      checked={value.includes(perm as PermissionType)}
                      onCheckedChange={(checked) => togglePermission(perm, checked === true)}
                      disabled={readOnly}
                    />
                    <label htmlFor={`perm-${perm}`} className="text-[10px] font-medium text-muted-foreground cursor-pointer">
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