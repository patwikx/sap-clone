
import { getItems } from '@/lib/items'
import { StockStatusList } from './components/stock-status-list'


export default async function StockStatusPage() {
  const items = await getItems()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Status</h1>
          <p className="text-gray-600 mt-2">
            Monitor inventory levels and stock availability across all warehouses
          </p>
        </div>
      </div>

      <StockStatusList items={items} />
    </div>
  )
}