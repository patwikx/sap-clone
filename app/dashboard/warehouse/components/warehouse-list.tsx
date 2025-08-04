'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Search,
  Building,
  Package
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { deleteWarehouse, getWarehouses } from '@/lib/actions/warehouse'

interface WarehousesListProps {
  warehouses: Awaited<ReturnType<typeof getWarehouses>>
}

export function WarehousesList({ warehouses }: WarehousesListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const filteredWarehouses = warehouses.filter(warehouse => 
    warehouse.whsName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.whsCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    setIsDeleting(id)
    try {
      const result = await deleteWarehouse(id)
      if (result.success) {
        toast.success('Warehouse deleted successfully')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to delete warehouse ${error}`)
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search warehouses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWarehouses.map((warehouse) => (
          <Card key={warehouse.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{warehouse.whsName}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{warehouse.whsCode}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/warehouses/${warehouse.id}`}>
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDelete(warehouse.id, warehouse.whsName)}
                      disabled={isDeleting === warehouse.id}
                    >
                      {isDeleting === warehouse.id ? 'Deleting...' : 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="mr-2 h-4 w-4" />
                  Warehouse Code: {warehouse.whsCode}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Package className="mr-2 h-4 w-4" />
                  {warehouse.itemWarehouses.length} item{warehouse.itemWarehouses.length !== 1 ? 's' : ''} stored
                </div>

                {warehouse.itemWarehouses.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500 mb-2">Items in Stock:</p>
                    <div className="space-y-1">
                      {warehouse.itemWarehouses.slice(0, 3).map((itemWarehouse) => (
                        <div key={itemWarehouse.id} className="flex justify-between text-xs">
                          <span className="truncate flex-1 mr-2">{itemWarehouse.item.itemName}</span>
                          <span className="flex-shrink-0">{itemWarehouse.onHand} units</span>
                        </div>
                      ))}
                      {warehouse.itemWarehouses.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{warehouse.itemWarehouses.length - 3} more item{warehouse.itemWarehouses.length - 3 !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredWarehouses.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No warehouses found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}