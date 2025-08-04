'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Users, 
  Clock, 
  Plus, 
  ShoppingCart,
  X
} from 'lucide-react'
import { RestaurantTableWithDetails, CartItem, MenuItemWithDetails } from '@/lib/types'

interface TableDialogProps {
  table: RestaurantTableWithDetails | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (item: MenuItemWithDetails) => void
  menuItems: MenuItemWithDetails[]
  cart: CartItem[]
}

export function TableDialog({ 
  table, 
  isOpen, 
  onClose, 
  onAddToCart, 
  menuItems, 
  cart 
}: TableDialogProps) {
  const [searchTerm, setSearchTerm] = useState('')

  if (!table) return null

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const tableCart = cart.filter(item => item.tableId === table.id)
  const tableTotal = tableCart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🪑</span>
            Table {table.number} - {table.status}
            <Badge 
              variant={table.status === 'Available' ? 'default' : 'secondary'}
              className={table.status === 'Available' ? 'bg-green-600' : 'bg-purple-600'}
            >
              {table.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 h-full overflow-hidden">
          {/* Left Side - Table Info and Cart */}
          <div className="flex-1 flex flex-col">
            {/* Table Information */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Capacity: {table.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Status: {table.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Cart */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Current Order
                  {tableCart.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {tableCart.length} items
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {tableCart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No items in cart</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tableCart.map((item) => (
                      <div key={item.itemCode} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.description}</p>
                          <p className="text-xs text-gray-500">{item.itemCode}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Qty: {item.quantity}</span>
                          <span className="font-medium">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center font-bold">
                        <span>Total:</span>
                        <span>${tableTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Menu Items */}
          <div className="w-80 flex flex-col">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {filteredItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className="cursor-pointer hover:shadow-md transition-all duration-200 border-0 shadow-sm"
                    onClick={() => onAddToCart(item)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                          <span className="text-lg">🍽️</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{item.code}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600 text-sm">${Number(item.price).toFixed(2)}</p>
                          <Plus className="h-4 w-4 text-gray-400 mx-auto mt-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          {tableCart.length > 0 && (
            <Button className="bg-green-600 hover:bg-green-700">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Process Order
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 