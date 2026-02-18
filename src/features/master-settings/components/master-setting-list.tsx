"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { ResourceActions } from "@/components/shared/resource-actions"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { DateCell, StatusCell } from "@/components/shared/data-table-cells"

import {
  useMasterSettings,
  useDeleteMasterSetting,
  useDeleteManyMasterSettings,
  usePartialUpdateMasterSetting,
  useUpdateManyMasterSettings,
} from "../master-setting.api"
import { MasterSetting } from "../master-setting.schema"
import { useMasterSettingModal } from "../master-setting-modal-context"
import { STATUS_OPTIONS, MASTER_SETTING_TYPE_OPTIONS } from "../master-setting.constants"

const MASTER_SETTINGS_BASE_HREF = "/dashboard/options/settings"

const INITIAL_FILTERS = {
  search: "",
  page: 1,
  pageSize: 10,
  status: "active",
  type: "all",
}

export function MasterSettingList() {
  const deleteMasterSettingMutation = useDeleteMasterSetting()
  const updateMasterSettingMutation = usePartialUpdateMasterSetting()
  const bulkDeleteMutation = useDeleteManyMasterSettings()
  const bulkStatusUpdateMutation = useUpdateManyMasterSettings()
  const { openModal } = useMasterSettingModal()

  const columns: ColumnDef<MasterSetting>[] = useMemo(
    () => [
      {
        accessorKey: "type",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      },
      {
        accessorKey: "label",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Label" />,
        cell: ({ row }) => (
          <div className="font-medium cursor-pointer hover:underline" onClick={() => openModal({ initialData: row.original, isViewMode: true })}>
            {row.getValue("label")}
          </div>
        ),
      },
      {
        accessorKey: "value",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Value" />,
      },
      {
        accessorKey: "isActive",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Active?" />,
        cell: ({ row }) => <StatusCell isActive={row.original.isActive} />,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ row }) => <DateCell date={row.original.createdAt} />,
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <ResourceActions
            resource={row.original}
            resourceName="Setting"
            resourceTitle={row.original.label}
            onView={(setting) => openModal({ initialData: setting, isViewMode: true })}
            onEdit={(setting) => openModal({ initialData: setting })}
            deleteMutation={deleteMasterSettingMutation}
            updateMutation={updateMasterSettingMutation}
          />
        ),
      },
    ],
    [deleteMasterSettingMutation, updateMasterSettingMutation, openModal]
  )

  const filterDefinitions = [
    {
      key: "status",
      title: "Status",
      options: STATUS_OPTIONS,
    },
    {
        key: "type",
        title: "Type",
        options: MASTER_SETTING_TYPE_OPTIONS,
    }
  ]

  return (
    <>
      <ResourceListPage<MasterSetting, unknown>
        title="Master Settings"
        resourceName="master-settings"
        description="Manage lookup values"
        onAdd={() => openModal()}
        addLabel="Add Setting"
        columns={columns}
        useResourceQuery={useMasterSettings}
        bulkDeleteMutation={bulkDeleteMutation}
        bulkStatusUpdateMutation={bulkStatusUpdateMutation}
        initialFilters={INITIAL_FILTERS}
        searchPlaceholder="Search by label or value..."
        filterDefinitions={filterDefinitions}
      />
    </>
  )
}
