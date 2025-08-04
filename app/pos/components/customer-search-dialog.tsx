'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search, User, Plus } from 'lucide-react'
import { searchCustomers } from '@/lib/actions/pos'

interface CustomerSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectCustomer: (customer: any) => void
}

export function CustomerSearchDialog({ open, onOpenChange, onSelectCustomer }: CustomerSearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (query: string) => {
    setSearchTerm(query)
    if (query.length < 2) {
      setCustomers([])
      return
    }

    setIsSearching(true)
    try {
      const results = await searchCustomers(query)
      setCustomers(results)
    } catch (error) {
      console.error('Error searching customers:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const selectCustomer = (customer: any) => {
    onSelectCustomer(customer)
    onOpenChange(false)
    setSearchTerm('')
    setCustomers([])
  }

  const selectWalkIn = () => {
    onSelectCustomer(null)
    onOpenChange(false)
    setSearchTerm('')
    setCustomers([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Customer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, code, email, or phone..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={selectWalkIn}
          >
            <User className="mr-2 h-4 w-4" />
            Walk-in Customer
          </Button>

          {isSearching && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">Searching...</p>
            </div>
          )}

          {customers.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {customers.map((customer) => (
                <Card 
                  key={customer.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => selectCustomer(customer)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{customer.cardName}</h4>
                        <p className="text-sm text-gray-600">{customer.cardCode}</p>
                        {customer.email && (
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        )}
                        {customer.phone1 && (
                          <p className="text-xs text-gray-500">{customer.phone1}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant={customer.cardType === 'G' ? 'default' : 'secondary'}>
                          {customer.cardType === 'G' ? 'Guest' : 'Customer'}
                        </Badge>
                        {customer.balance > 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            Balance: ${customer.balance.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {searchTerm.length >= 2 && customers.length === 0 && !isSearching && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-2">No customers found</p>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create New Customer
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}