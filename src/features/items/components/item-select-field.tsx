"use client"

import { useMemo, useEffect } from "react"
import { Control, FieldValues, Path, PathValue, useFormContext } from "react-hook-form"

import { SelectField } from "@/components/forms/select-field"
import { useItemOptions, type ItemOption } from "../item.api"
import { useItemModal } from "../item-modal-context"
import { useCurrency } from "@/providers/currency-provider"

interface ItemSelectFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  canAdd?: boolean
  type?: "DEVICE" | "PART" | "SERVICE" | "LOANER"
  extras?: string[]
  inStock?: boolean
  onSelectOption?: (option: ItemOption) => void
}

export function ItemSelectField<TFieldValues extends FieldValues>({
  name,
  control,
  label = "",
  placeholder = "Select Item",
  required = false,
  disabled = false,
  readOnly = false,
  canAdd = false,
  type,
  extras = [],
  inStock = false,
  onSelectOption,
}: ItemSelectFieldProps<TFieldValues>) {
  const { setValue } = useFormContext<TFieldValues>()
  const { openModal } = useItemModal()
  
  // Build query params: include type filter and requested extra fields
  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {}
    if (type) {
      params.itemType = type
    }
    if (inStock) {
      params.inStock = "true"
    }
    // Automatically add quantity when inStock is true, plus any custom extras
    const fieldsToRequest = inStock 
      ? [...new Set([...extras, "quantity"])] // Add quantity if inStock, remove duplicates
      : extras
    
    if (fieldsToRequest.length > 0) {
      params.fields = fieldsToRequest
    }
    
    console.log(`[ItemSelectField] Making API call with params:`, params)
    
    return params
  }, [type, inStock, extras])
  
  const { data: optionsData, isLoading, error } = useItemOptions(queryParams)

  // Log errors for debugging
  useEffect(() => {
    if (error) {
      console.error(`[ItemSelectField] Error loading ${type || 'all'} items:`, error)
    }
  }, [error, type])

  // Transform API response to SelectField format { value, label, ...extras }
  const itemOptions = useMemo(() => {
    if (!optionsData) {
      if (error) {
        console.warn(`[ItemSelectField] No options data (type=${type}), error:`, error)
      }
      return []
    }
    
    console.log(`[ItemSelectField] Received ${optionsData.length} options for type=${type}`)
    
    return optionsData.map((option: ItemOption) => ({
      value: option.id,
      label: option.name,
      ...Object.fromEntries(
        Object.entries(option).filter(([key]) => !['id', 'name'].includes(key))
      ),
    }))
  }, [optionsData, error, type])

  // Create a map of option values to full option objects for lookup
  const optionMap = useMemo(() => {
    const map = new Map<string, ItemOption>()
    optionsData?.forEach(opt => {
      map.set(opt.id, opt)
    })
    return map
  }, [optionsData])

  const handleAddItem = () => {
    openModal({
      onSuccess: (newItem) => {
        if (newItem?.id) {
          setValue(name, newItem.id as PathValue<TFieldValues, Path<TFieldValues>>)
        }
      },
    })
  }

  // Wrapper to call onSelectOption callback when selection changes
  const handleSelectOption = (selectedValue: string) => {
    const fullOption = optionMap.get(selectedValue)
    if (fullOption && onSelectOption) {
      onSelectOption(fullOption)
    }
  }

  // Custom renderer for displaying item with extra properties
  const { config } = useCurrency()
  
  const renderItemOption = (option: { value: string; label: string; [key: string]: unknown }) => {
    // Separate quantity for special handling (right side badge)
    const quantity = option.quantity as number | undefined
    
    // Filter extras to exclude quantity (which we handle separately)
    const displayExtras = extras.filter(key => key !== 'quantity')
    
    // Format currency values using shop's configured currency
    const formatValue = (key: string, val: unknown) => {
      if (key === 'salePrice' && typeof val === 'number') {
        return new Intl.NumberFormat(config.locale, {
          style: 'currency',
          currency: config.currencyCode,
          minimumFractionDigits: config.minimumFractionDigits,
          maximumFractionDigits: config.maximumFractionDigits,
        }).format(val)
      }
      return String(val)
    }
    
    const extraValues = displayExtras
      .map(key => {
        const val = option[key]
        if (val === undefined || val === null) return null
        return (
          <span key={key} className="text-[10px] text-muted-foreground">
            {formatValue(key, val)}
          </span>
        )
      })
      .filter(Boolean)
    
    return (
      <div className="flex items-center justify-between flex-1 min-w-0 gap-2">
        <div className="flex flex-col flex-1 min-w-0">
          <span className="truncate font-medium text-sm">{option.label}</span>
          {extraValues.length > 0 && (
            <div className="flex gap-2 mt-0.5">
              {extraValues}
            </div>
          )}
        </div>
        {quantity && inStock && (
          <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap">
            In Stock: {quantity.toString()}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <SelectField
        control={control}
        name={name}
        label={label}
        placeholder={placeholder}
        searchPlaceholder="Search items..."
        noResultsMessage="No item found."
        options={itemOptions}
        renderOption={(extras.length > 0 || inStock) ? renderItemOption : undefined}
        onAdd={canAdd ? handleAddItem : undefined}
        onValueChange={onSelectOption ? handleSelectOption : undefined}
        required={required}
        isLoading={isLoading}
        disabled={disabled}
        readOnly={readOnly}
      />
    </>
  )
}
