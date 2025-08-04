import { Button } from '@/components/ui/button'
import { getWarehouses } from '@/lib/actions/warehouse'
import { Plus } from 'lucide-react'
import { WarehouseForm } from './components/warehouse-form'
import { WarehousesList } from './components/warehouse-list'


export default async function WarehousesPage() {
  const warehouses = await getWarehouses()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Warehouses</h1>
          <p className="text-gray-600 mt-2">
            Manage your storage locations and inventory distribution
          </p>
        </div>
        <WarehouseForm>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Warehouse
          </Button>
        </WarehouseForm>
      </div>

      <WarehousesList warehouses={warehouses} />
    </div>
  )
}