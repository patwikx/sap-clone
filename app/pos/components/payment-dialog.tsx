'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Minus, CreditCard, DollarSign, Percent } from 'lucide-react'
import { PaymentMethodData, DiscountData, PaymentItem, AppliedDiscount } from '@/lib/types'

interface PaymentDialogProps {
  total: number
  paymentMethods: PaymentMethodData[]
  discounts: DiscountData[]
  onPayment: (payments: PaymentItem[], discounts: AppliedDiscount[]) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PaymentDialog({ 
  total, 
  paymentMethods, 
  discounts, 
  onPayment, 
  open, 
  onOpenChange 
}: PaymentDialogProps) {
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [appliedDiscounts, setAppliedDiscounts] = useState<AppliedDiscount[]>([])
  const [customAmount, setCustomAmount] = useState('')

  const discountedTotal = total - appliedDiscounts.reduce((sum, d) => sum + d.amount, 0)
  const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0)
  const remainingAmount = Math.max(0, discountedTotal - paidAmount)
  const changeAmount = Math.max(0, paidAmount - discountedTotal)

  const addPayment = (method: PaymentMethodData, amount?: number) => {
    const paymentAmount = amount || remainingAmount
    if (paymentAmount <= 0) return

    setPayments(prev => {
      const existing = prev.find(p => p.paymentMethodId === method.id)
      if (existing) {
        return prev.map(p =>
          p.paymentMethodId === method.id
            ? { ...p, amount: p.amount + paymentAmount }
            : p
        )
      } else {
        return [...prev, {
          paymentMethodId: method.id,
          paymentMethodName: method.name,
          amount: paymentAmount
        }]
      }
    })
  }

  const removePayment = (paymentMethodId: string) => {
    setPayments(prev => prev.filter(p => p.paymentMethodId !== paymentMethodId))
  }

  const addDiscount = (discount: DiscountData) => {
    let discountAmount = 0
    if (discount.type === 'Percentage') {
      discountAmount = total * (Number(discount.value) / 100)
    } else {
      discountAmount = Number(discount.value)
    }

    setAppliedDiscounts(prev => {
      const existing = prev.find(d => d.discountId === discount.id)
      if (existing) return prev

      return [...prev, {
        discountId: discount.id,
        discountName: discount.name,
        amount: discountAmount
      }]
    })
  }

  const removeDiscount = (discountId: string) => {
    setAppliedDiscounts(prev => prev.filter(d => d.discountId !== discountId))
  }

  const handlePaymentSubmit = () => {
    if (remainingAmount > 0.005) { // Allow for rounding differences
      return
    }

    onPayment(payments, appliedDiscounts)
    
    // Reset state
    setPayments([])
    setAppliedDiscounts([])
    setCustomAmount('')
  }

  const addCustomAmount = () => {
    const amount = parseFloat(customAmount)
    if (amount > 0 && payments.length > 0) {
      const lastPayment = payments[payments.length - 1]
      const method = paymentMethods.find(m => m.id === lastPayment.paymentMethodId)
      if (method) {
        addPayment(method, amount)
        setCustomAmount('')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Complete Payment
            <div className="text-3xl font-bold text-green-600 mt-2">₱{total.toFixed(2)}</div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Methods */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Payment Methods</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <Button
                  key={method.id}
                  variant="outline"
                  onClick={() => addPayment(method)}
                  disabled={remainingAmount <= 0}
                  className="h-20 flex flex-col border-2 hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  {method.name === 'Cash' ? (
                    <DollarSign className="h-8 w-8 mb-2 text-green-600" />
                  ) : (
                    <CreditCard className="h-8 w-8 mb-2 text-blue-600" />
                  )}
                  <span className="text-sm font-medium">{method.name}</span>
                </Button>
              ))}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Custom Amount</label>
              <div className="flex space-x-2">
              <Input
                type="number"
                step="0.01"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={addCustomAmount} 
                disabled={remainingAmount > 0.005}
                className="px-4"
              >
                {remainingAmount > 0.005 ? `₱${remainingAmount.toFixed(2)} Remaining` : 'Complete Payment'}
              </Button>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Quick Cash Amounts</label>
              <div className="grid grid-cols-4 gap-2">
              {[5, 10, 20, 50].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  className="h-12 font-semibold"
                  onClick={() => {
                    const cashMethod = paymentMethods.find(m => m.name === 'Cash')
                    if (cashMethod) addPayment(cashMethod, amount)
                  }}
                >
                  ${amount}
                </Button>
              ))}
              </div>
            </div>

            {/* Discounts */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Available Discounts</h4>
              <div className="space-y-2">
                {discounts.map((discount) => (
                  <Button
                    key={discount.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addDiscount(discount)}
                    disabled={appliedDiscounts.some(d => d.discountId === discount.id)}
                    className="justify-start w-full h-12 border-dashed"
                  >
                    <Percent className="mr-3 h-4 w-4 text-orange-600" />
                    <div className="text-left">
                      <div className="font-medium">{discount.name}</div>
                      <div className="text-xs text-gray-500">
                        {discount.type === 'Percentage' ? `${discount.value}%` : `₱${discount.value}`}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Payment Summary</h3>

            {/* Applied Discounts */}
            {appliedDiscounts.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm mb-3 text-orange-800">Applied Discounts</h4>
                  {appliedDiscounts.map((discount) => (
                    <div key={discount.discountId} className="flex items-center justify-between mb-2 last:mb-0">
                      <span className="text-sm font-medium">{discount.discountName}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-orange-700">-₱{discount.amount.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-orange-200"
                          onClick={() => removeDiscount(discount.discountId)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Payments */}
            {payments.length > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm mb-3 text-blue-800">Payment Methods Used</h4>
                  {payments.map((payment, index) => (
                    <div key={`${payment.paymentMethodId}-${index}`} className="flex items-center justify-between mb-2 last:mb-0">
                      <span className="text-sm font-medium">{payment.paymentMethodName}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-blue-700">₱{payment.amount.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-blue-200"
                          onClick={() => removePayment(payment.paymentMethodId)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Totals */}
            <Card className="border-gray-300 bg-gray-50">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">₱{total.toFixed(2)}</span>
                </div>
                {appliedDiscounts.length > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span className="font-medium">Total Discount:</span>
                    <span className="font-bold">-₱{appliedDiscounts.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2">
                  <span className="text-gray-800">Total Due:</span>
                  <span className="text-green-600">₱{discountedTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-semibold text-blue-600">₱{paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className={`font-bold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₱{remainingAmount.toFixed(2)}
                  </span>
                </div>
                {changeAmount > 0 && (
                  <div className="flex justify-between text-purple-600 font-bold text-lg border-t border-gray-300 pt-2">
                    <span>Change Due:</span>
                    <span className="text-2xl">₱{changeAmount.toFixed(2)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button 
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg" 
              onClick={handlePaymentSubmit}
              disabled={remainingAmount > 0.01}
            >
              {remainingAmount > 0.01 ? `₱${remainingAmount.toFixed(2)} Remaining` : 'Complete Payment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}