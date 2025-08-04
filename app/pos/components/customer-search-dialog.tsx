'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, User, Plus } from 'lucide-react'
import { searchCustomers } from '@/lib/actions/pos'
import { BusinessPartnerForPOS } from '@/lib/types'

interface CustomerSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectCustomer: (customer: BusinessPartnerForPOS | null) => void
}

export function CustomerSearchDialog({ open, onOpenChange, onSelectCustomer }: CustomerSearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState<BusinessPartnerForPOS[]>([])
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

  const selectCustomer = (customer: BusinessPartnerForPOS) => {
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Select Customer</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, code, email, or phone..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <Button
            variant="outline"
            className="w-full justify-start h-14 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50"
            onClick={selectWalkIn}
          >
            <div className="flex items-center">
              <div className="bg-gray-100 rounded-full p-2 mr-3">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Walk-in Customer</div>
                <div className="text-xs text-gray-500">No customer information required</div>
              </div>
            </div>
          </Button>

          {isSearching && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Searching customers...</p>
            </div>
          )}

          {customers.length > 0 && (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-700">Search Results</h4>
              {customers.map((customer) => (
                <Card 
                  key={customer.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-0 shadow-sm"
                  onClick={() => selectCustomer(customer)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">{customer.cardName}</h4>
                        <p className="text-sm text-gray-500">{customer.cardCode}</p>
                        {customer.email && (
                          <p className="text-xs text-blue-600">{customer.email}</p>
                        )}
                        {customer.phone && (
                          <p className="text-xs text-green-600">{customer.phone}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-1">
                          Customer
                        </Badge>
                        {customer.phone && (
                          <p className="text-xs text-green-600 font-semibold">
                            {customer.phone}
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
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-4">No customers found for &quot;{searchTerm}&quot;</p>
              <Button variant="outline" size="sm" className="border-dashed">
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