
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { ProductionOrdersList } from './components/production-order-list'
import { getProductionOrders } from '@/lib/actions/production-order'
import { ProductionOrderForm } from './components/production-order-form'

export default async function ProductionOrdersPage() {
  const productionOrders = await getProductionOrders()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production Orders</h1>
          <p className="text-gray-600 mt-2">
            Manage manufacturing orders and production planning
          </p>
        </div>
        <ProductionOrderForm>
          <Button asChild>
            <Link href="/dashboard/production-orders/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Production Order
            </Link>
          </Button>
        </ProductionOrderForm>
      </div>

      <ProductionOrdersList productionOrders={productionOrders} />
    </div>
  )
}