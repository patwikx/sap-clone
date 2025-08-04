'use client'

import { useState } from 'react'
import { ItemWithRelations } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Search, 
  Package,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { deleteItem } from '@/lib/items'

interface ItemsListProps {
  items: ItemWithRelations[]
}

export function ItemsList({ items }: ItemsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemGroup.groupName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || item.itemType === typeFilter

    return matchesSearch && matchesType
  })

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    setIsDeleting(id)
    try {
      const result = await deleteItem(id)
      if (result.success) {
        toast.success('Item deleted successfully')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to delete item ${error}`)
    } finally {
      setIsDeleting(null)
    }
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
      return { label: 'Out of Stock', variant: 'destructive' as const, icon: AlertTriangle }
    } else if (onHand <= 10) {
      return { label: 'Low Stock', variant: 'secondary' as const, icon: AlertTriangle }
    } else {
      return { label: 'In Stock', variant: 'default' as const, icon: CheckCircle }
    }
  }

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
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="I">Inventory Items</SelectItem>
            <SelectItem value="S">Sales Items</SelectItem>
            <SelectItem value="P">Purchase Items</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/items/${item.id}`}>
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/items/${item.id}/edit`}>
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(item.id, item.itemName)}
                        disabled={isDeleting === item.id}
                      >
                        {isDeleting === item.id ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{getTypeLabel(item.itemType)}</Badge>
                    <Badge variant={stockStatus.variant}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {stockStatus.label}
                    </Badge>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="mr-2 h-4 w-4" />
                    Group: {item.itemGroup.groupName}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-xs text-gray-500">On Hand</p>
                      <p className="font-medium">{item.onHand}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Committed</p>
                      <p className="font-medium">{item.committed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">On Order</p>
                      <p className="font-medium">{item.onOrder}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="font-medium">${item.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Procurement:</span>
                      <span className="font-medium">
                        {item.procurementMethod === 'B' ? 'Buy' : 'Make'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Lead Time:</span>
                      <span className="font-medium">{item.leadTime} days</span>
                    </div>
                  </div>
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