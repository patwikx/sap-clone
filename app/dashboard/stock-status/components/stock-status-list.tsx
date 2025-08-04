'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  AlertTriangle,
  CheckCircle,
  Package,
  Search,
  Building
} from 'lucide-react'
import { ItemWithRelations } from '@/lib/types'

interface StockStatusListProps {
  items: ItemWithRelations[]
}

export function StockStatusList({ items }: StockStatusListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const getStockStatus = (onHand: number) => {
    if (onHand <= 0) {
      return { label: 'Out of Stock', variant: 'destructive' as const, icon: AlertTriangle }
    } else if (onHand <= 10) {
      return { label: 'Low Stock', variant: 'secondary' as const, icon: AlertTriangle }
    } else {
      return { label: 'In Stock', variant: 'default' as const, icon: CheckCircle }
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    
    const stockStatus = getStockStatus(item.onHand)
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'in-stock' && stockStatus.label === 'In Stock') ||
      (statusFilter === 'low-stock' && stockStatus.label === 'Low Stock') ||
      (statusFilter === 'out-of-stock' && stockStatus.label === 'Out of Stock')

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in-stock">In Stock</SelectItem>
            <SelectItem value="low-stock">Low Stock</SelectItem>
            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const stockStatus = getStockStatus(item.onHand)
          const StatusIcon = stockStatus.icon

          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.itemName}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{item.itemCode}</p>
                  </div>
                  <Badge variant={stockStatus.variant}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {stockStatus.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="mr-2 h-4 w-4" />
                    Group: {item.itemGroup.groupName}
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-xs text-gray-500">On Hand</p>
                      <p className="font-medium text-lg">{item.onHand}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Committed</p>
                      <p className="font-medium text-lg">{item.committed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Available</p>
                      <p className="font-medium text-lg">{item.onHand - item.committed}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">On Order:</span>
                      <span className="font-medium">{item.onOrder}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Unit Price:</span>
                      <span className="font-medium">${item.price.toFixed(2)}</span>
                    </div>
                  </div>

                  {item.itemWarehouses.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500 mb-2">Warehouse Stock:</p>
                      <div className="space-y-1">
                        {item.itemWarehouses.map((itemWarehouse) => (
                          <div key={itemWarehouse.id} className="flex justify-between text-xs">
                            <span className="flex items-center">
                              <Building className="mr-1 h-3 w-3" />
                              {itemWarehouse.warehouse.whsName}
                            </span>
                            <span className="font-medium">{itemWarehouse.onHand} units</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No items found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}