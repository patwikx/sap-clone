'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Printer, 
  Download, 
  CheckCircle,
} from 'lucide-react'
import { CartItem, RestaurantTableWithDetails, BusinessPartnerForPOS } from '@/lib/types'

interface OrderConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  orderData: {
    billNumber: string
    table?: RestaurantTableWithDetails | null
    customer?: BusinessPartnerForPOS | null
    items: CartItem[]
    subtotal: number
    tax: number
    serviceCharge: number
    discount: number
    tips: number
    total: number
    paymentMethod: string
    paymentAmount: number
    change: number
    waiter: string
    orderType: string
    createdAt: Date
  }
}

export function OrderConfirmationDialog({ 
  isOpen, 
  onClose, 
  orderData 
}: OrderConfirmationDialogProps) {
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      // Simulate printing
      await new Promise(resolve => setTimeout(resolve, 1000))
      // TODO: Implement actual printing logic
      console.log('Printing receipt...')
    } catch (error) {
      console.error('Print error:', error)
    } finally {
      setIsPrinting(false)
    }
  }

  const handleDownload = () => {
    // TODO: Implement PDF download
    console.log('Downloading receipt...')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Order Confirmed - Bill #{orderData.billNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 h-full overflow-hidden">
          {/* Left Side - Bill Details */}
          <div className="flex-1 flex flex-col max-h-[70vh] overflow-y-auto">
            {/* Bill Information */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Bill Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Bill No.:</span>
                      <span className="font-semibold">{orderData.billNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Guest Type:</span>
                      <span className="font-semibold">{orderData.customer ? 'Customer' : 'Visitor'}</span>
                    </div>
                    {orderData.customer && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">ID:</span>
                          <span className="font-semibold">{orderData.customer.cardCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Name:</span>
                          <span className="font-semibold">{orderData.customer.cardName}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Outstanding:</span>
                      <span className="font-semibold text-orange-600">$0.00</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {orderData.table && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Table No.:</span>
                        <span className="font-semibold">TB{orderData.table.number}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Waiter:</span>
                      <span className="font-semibold">{orderData.waiter}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cover:</span>
                      <span className="font-semibold">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Order Type:</span>
                      <Badge variant="outline">{orderData.orderType}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Charges Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Sub Total:</span>
                      <span className="font-semibold">₱{orderData.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tax:</span>
                      <span className="font-semibold">₱{orderData.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Service Charge:</span>
                      <span className="font-semibold">₱{orderData.serviceCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Discount:</span>
                      <span className="font-semibold text-green-600">-₱{orderData.discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tips:</span>
                      <span className="font-semibold">₱{orderData.tips.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span className="text-green-600">₱{orderData.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Payment:</span>
                      <span className="font-semibold">₱{orderData.paymentAmount.toFixed(2)}</span>
                    </div>
                    {orderData.change > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Change:</span>
                        <span className="font-semibold text-blue-600">₱{orderData.change.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Item List and Actions */}
          <div className="w-80 flex flex-col">
            {/* Item List */}
            <Card className="flex-1 mb-4 max-h-96 overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-lg">Ordered Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orderData.items.map((item, index) => (
                    <div key={item.itemCode} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">#{index + 1}</span>
                          <h4 className="font-medium text-sm">{item.description}</h4>
                        </div>
                        <p className="text-xs text-gray-500">₱{item.price.toFixed(2)} each</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold">Qty: {item.quantity}</span>
                        <div className="font-bold text-sm">₱{item.total.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className="bg-blue-600 hover:bg-blue-700 h-10"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {isPrinting ? 'Printing...' : 'Print Bill'}
                </Button>
                <Button 
                  onClick={handleDownload}
                  variant="outline"
                  className="h-10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <Button 
                onClick={onClose}
                className="w-full bg-green-600 hover:bg-green-700 h-12 text-base font-semibold"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 