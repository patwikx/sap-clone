
import { Button } from '@/components/ui/button'
import { getPurchaseOrders } from '@/lib/actions/purchase-order'
import { Plus } from 'lucide-react'
import { PurchaseOrdersList } from './components/purchase-order-list'
import { PurchaseOrderForm } from './components/purchase-order-form'

export default async function PurchaseOrdersPage() {
  const purchaseOrders = await getPurchaseOrders()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600 mt-2">
            Manage supplier orders and track purchasing progress
          </p>
        </div>
      <PurchaseOrderForm>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Purchase Order
          </Button>
      </PurchaseOrderForm>
      </div>

      <PurchaseOrdersList purchaseOrders={purchaseOrders} />
    </div>
  )
}