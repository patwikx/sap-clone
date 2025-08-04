import { notFound } from 'next/navigation'
import { getItemById } from '@/lib/items'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, Building, DollarSign, Clock, Truck } from 'lucide-react'
import Link from 'next/link'

interface ItemDetailPageProps {
  params: {
    id: string
  }
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const item = await getItemById(params.id)

  if (!item) {
    notFound()
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'I': return 'Inventory'
      case 'S': return 'Sales'
      case 'P': return 'Purchase'
      default: return type
    }
  }

  const getStockStatus = (onHand: number) => {
    if (onHand <= 0) {
      return { label: 'Out of Stock', variant: 'destructive' as const }
    } else if (onHand <= 10) {
      return { label: 'Low Stock', variant: 'secondary' as const }
    } else {
      return { label: 'In Stock', variant: 'default' as const }
    }
  }

  const stockStatus = getStockStatus(item.onHand)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/items">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Items
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{item.itemName}</h1>
          <p className="text-gray-600 mt-2">Item Code: {item.itemCode}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Item Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Item Code</p>
                      <p className="font-medium">{item.itemCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Item Name</p>
                      <p className="font-medium">{item.itemName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Item Type</p>
                      <Badge variant="outline">{getTypeLabel(item.itemType)}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Item Group</p>
                      <p className="font-medium">{item.itemGroup.groupName}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Pricing & Procurement</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{item.price.toFixed(2)} {item.currency}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Procurement Method</p>
                      <Badge variant={item.procurementMethod === 'B' ? 'default' : 'secondary'}>
                        {item.procurementMethod === 'B' ? 'Buy' : 'Make'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lead Time</p>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="font-medium">{item.leadTime} days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {item.itemWarehouses.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Warehouse Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {item.itemWarehouses.map((itemWarehouse) => (
                    <div key={itemWarehouse.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Building className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <h4 className="font-medium">{itemWarehouse.warehouse.whsName}</h4>
                            <p className="text-sm text-gray-600">{itemWarehouse.warehouse.whsCode}</p>
                          </div>
                        </div>
                        <Badge variant={getStockStatus(itemWarehouse.onHand).variant}>
                          {getStockStatus(itemWarehouse.onHand).label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600">On Hand</p>
                          <p className="text-lg font-semibold">{itemWarehouse.onHand}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Committed</p>
                          <p className="text-lg font-semibold">{itemWarehouse.committed}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Available</p>
                          <p className="text-lg font-semibold text-green-600">
                            {itemWarehouse.onHand - itemWarehouse.committed}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge variant={stockStatus.variant} className="mb-2">
                  {stockStatus.label}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">On Hand:</span>
                  <span className="font-semibold">{item.onHand}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Committed:</span>
                  <span className="font-semibold">{item.committed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">On Order:</span>
                  <span className="font-semibold">{item.onOrder}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Available:</span>
                    <span className="font-bold text-green-600">
                      {item.onHand - item.committed}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/dashboard/items/${item.id}/edit`}>
                <Button variant="outline" className="w-full">
                  Edit Item
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                <Package className="mr-2 h-4 w-4" />
                Stock Transfer
              </Button>
              <Button variant="outline" className="w-full">
                <Truck className="mr-2 h-4 w-4" />
                Create Purchase Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}