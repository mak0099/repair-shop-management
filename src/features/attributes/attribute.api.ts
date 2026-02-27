import { createApiHooksFor } from "@/lib/api-factory";
import { createBulkDeleteHook, createBulkUpdateHook } from "@/lib/api-bulk-hooks";
import type { Attribute } from "./attribute.schema";

/**
 * Since we're only managing values for fixed categories, 
 * we focus on GET and PATCH operations.
 */
type AttributeFormValues = Partial<Attribute>;

const attributeApiHooks = createApiHooksFor<Attribute, AttributeFormValues>("attributes");

export interface AttributeOption {
  id: string;
  name: string;
}

// Fetching fixed attributes (RAM, ROM, Color) with their values
export const useAttributes = attributeApiHooks.useGetList;

// Fetching a single category (e.g. just RAM details)
export const useAttribute = attributeApiHooks.useGetOne;

/**
 * Update logic: 
 * Used for adding/removing values within a category via PATCH.
 */
export const useUpdateAttribute = attributeApiHooks.useUpdate;

export const useDeleteAttribute = attributeApiHooks.useDelete;

/**
 * Bulk operation hooks.
 * FIX: Removed <Attribute> from createBulkDeleteHook to match its new non-generic signature.
 */
export const useDeleteManyAttributes = createBulkDeleteHook("attributes");
export const useUpdateManyAttributes = createBulkUpdateHook<Attribute>("attributes");

// Options for dropdowns if needed in other modules
export const useAttributeOptions = attributeApiHooks.useGetOptions<AttributeOption>;