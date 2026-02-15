import { useQuery } from "@tanstack/react-query"

import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook, createBulkUpdateHook } from "@/lib/api-bulk-hooks"
import { apiClient } from "@/lib/api-client"
import type { MasterSetting } from "./master-setting.schema"
import type { MasterSettingFormValues } from "./master-setting.schema"

const masterSettingApiHooks = createApiHooksFor<MasterSetting, MasterSettingFormValues>("master-settings")

interface MasterSettingOption {
  id: string
  label: string
  value: string
}

export const useMasterSettings = masterSettingApiHooks.useGetList
export const useMasterSettingOptions = (type: string) => {
  const queryParams = new URLSearchParams()
  if (type) {
    queryParams.append("type", type)
  }

  return useQuery<MasterSettingOption[], Error>({
    queryKey: ["master-setting-options", type],
    queryFn: async () => (await apiClient.get(`/master-settings/options?${queryParams.toString()}`)).data,
    enabled: !!type,
  })
}
export const useCreateMasterSetting = masterSettingApiHooks.useCreate
export const useUpdateMasterSetting = masterSettingApiHooks.useUpdate
export const usePartialUpdateMasterSetting = masterSettingApiHooks.useUpdate
export const useDeleteMasterSetting = masterSettingApiHooks.useDelete

export const useDeleteManyMasterSettings = createBulkDeleteHook<MasterSetting>("master-settings")
export const useUpdateManyMasterSettings = createBulkUpdateHook<MasterSetting>("master-settings")
export const useMasterSetting = masterSettingApiHooks.useGetOne
