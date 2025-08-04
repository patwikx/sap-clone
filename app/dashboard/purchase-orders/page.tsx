
import { Button } from '@/components/ui/button'
import { getPurchaseOrders } from '@/lib/actions/purchase-order'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { PurchaseOrdersList } from './components/purchase-order-list'

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
        <Link href="/purchase-orders/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Purchase Order
          </Button>
        </Link>
      </div>

      <PurchaseOrdersList purchaseOrders={purchaseOrders} />
    </div>
  )
}