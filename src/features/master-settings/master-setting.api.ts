import { createApiHooksFor } from "@/lib/api-factory";
import { createBulkDeleteHook, createBulkUpdateHook } from "@/lib/api-bulk-hooks";
import type { MasterSetting } from "./master-setting.schema";

/**
 * Form values for Master Settings.
 * Used for updating configurations like Device Types, Payment Methods, etc.
 */
type MasterSettingFormValues = Partial<MasterSetting>;

const masterSettingApiHooks = createApiHooksFor<MasterSetting, MasterSettingFormValues>("master-settings");

export interface MasterSettingOption {
  id: string;
  name: string;
}

/**
 * Hook to fetch the list of all Master Settings (e.g., all 7 cards).
 */
export const useMasterSettings = masterSettingApiHooks.useGetList;

/**
 * Hook to fetch a specific Master Setting by ID.
 */
export const useMasterSetting = masterSettingApiHooks.useGetOne;

/**
 * Hook to update values within a Master Setting category.
 * Essential for adding or removing options from a specific configuration.
 */
export const useUpdateMasterSetting = masterSettingApiHooks.useUpdate;

/**
 * Hook to delete a Master Setting category if needed.
 */
export const useDeleteMasterSetting = masterSettingApiHooks.useDelete;

/**
 * Bulk operation hooks for management.
 */
export const useDeleteManyMasterSettings = createBulkDeleteHook<MasterSetting>("master-settings");
export const useUpdateManyMasterSettings = createBulkUpdateHook<MasterSetting>("master-settings");

/**
 * Hook to get options for dropdowns if needed in other parts of the system.
 */
export const useMasterSettingOptions = masterSettingApiHooks.useGetOptions<MasterSettingOption>;