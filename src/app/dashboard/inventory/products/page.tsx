import { ItemList } from "@/features/items/components/item-list"

export default function ItemsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <ItemList />
    </div>
  )
}