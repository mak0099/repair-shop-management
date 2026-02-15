import { is } from "date-fns/locale"

export const ROLE_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: true, label: "Dealer" },
  { value: false, label: "Customer" },
]

export const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

export const PROVINCE_OPTIONS = [
  { value: "RM", label: "Roma (RM)" },
  { value: "MI", label: "Milano (MI)" },
  { value: "NA", label: "Napoli (NA)" },
]

export const BOX_NUMBER_OPTIONS = [
  { value: "box-1", label: "Box 1" },
  { value: "box-2", label: "Box 2" },
  { value: "box-3", label: "Box 3" },
]

export const INITIAL_FILTERS = {
  search: "",
  role: "all",
  branch: "all",
  status: "active",
  isDealer: "all",
  page: 1,
  pageSize: 10,
}