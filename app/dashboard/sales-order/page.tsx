
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { SalesOrdersList } from './components/sales-order-list'
import { getSalesOrders } from '@/lib/sales-orders'

export default async function SalesOrdersPage() {
  const salesOrders = await getSalesOrders()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Orders</h1>
          <p className="text-gray-600 mt-2">
            Manage customer orders and track sales progress
          </p>
        </div>
        <Link href="/sales-orders/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Sales Order
          </Button>
        </Link>
      </div>

      <SalesOrdersList salesOrders={salesOrders} />
    </div>
  )
}