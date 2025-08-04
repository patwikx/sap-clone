'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, CreditCard, DollarSign, Percent } from 'lucide-react'

interface PaymentDialogProps {
  children: React.ReactNode
  total: number
  paymentMethods: any[]
  discounts: any[]
  onPayment: (payments: any[], discounts: any[]) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Payment {
  paymentMethodId: string
  paymentMethodName: string
  amount: number
}

interface AppliedDiscount {
  discountId: string
  discountName: string
  amount: number
}

export function PaymentDialog({ 
  children, 
  total, 
  paymentMethods, 
  discounts, 
  onPayment, 
  open, 
  onOpenChange 
}: PaymentDialogProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [appliedDiscounts, setAppliedDiscounts] = useState<AppliedDiscount[]>([])
  const [customAmount, setCustomAmount] = useState('')

  const discountedTotal = total - appliedDiscounts.reduce((sum, d) => sum + d.amount, 0)
  const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0)
  const remainingAmount = Math.max(0, discountedTotal - paidAmount)
  const changeAmount = Math.max(0, paidAmount - discountedTotal)

  const addPayment = (method: any, amount?: number) => {
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

  const addDiscount = (discount: any) => {
    let discountAmount = 0
    if (discount.type === 'PERCENTAGE') {
      discountAmount = total * (discount.value / 100)
    } else {
      discountAmount = discount.value
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

  const handlePayment = () => {
    if (remainingAmount > 0.01) {
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment - ${total.toFixed(2)}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <div className="space-y-4">
            <h3 className="font-medium">Payment Methods</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => (
                <Button
                  key={method.id}
                  variant="outline"
                  onClick={() => addPayment(method)}
                  disabled={remainingAmount <= 0}
                  className="h-16 flex flex-col"
                >
                  {method.name === 'Cash' ? (
                    <DollarSign className="h-6 w-6 mb-1" />
                  ) : (
                    <CreditCard className="h-6 w-6 mb-1" />
                  )}
                  <span className="text-xs">{method.name}</span>
                </Button>
              ))}
            </div>

            <div className="flex space-x-2">
              <Input
                type="number"
                step="0.01"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
              <Button onClick={addCustomAmount} disabled={!customAmount}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 20, 50].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const cashMethod = paymentMethods.find(m => m.name === 'Cash')
                    if (cashMethod) addPayment(cashMethod, amount)
                  }}
                >
                  ${amount}
                </Button>
              ))}
            </div>

            {/* Discounts */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Discounts</h4>
              <div className="grid grid-cols-1 gap-2">
                {discounts.map((discount) => (
                  <Button
                    key={discount.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addDiscount(discount)}
                    disabled={appliedDiscounts.some(d => d.discountId === discount.id)}
                    className="justify-start"
                  >
                    <Percent className="mr-2 h-3 w-3" />
                    {discount.name} ({discount.type === 'PERCENTAGE' ? `${discount.value}%` : `$${discount.value}`})
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="space-y-4">
            <h3 className="font-medium">Payment Summary</h3>

            {/* Applied Discounts */}
            {appliedDiscounts.length > 0 && (
              <Card>
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm mb-2">Applied Discounts</h4>
                  {appliedDiscounts.map((discount) => (
                    <div key={discount.discountId} className="flex items-center justify-between mb-1">
                      <span className="text-sm">{discount.discountName}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">-${discount.amount.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
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
              <Card>
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm mb-2">Payments</h4>
                  {payments.map((payment, index) => (
                    <div key={`${payment.paymentMethodId}-${index}`} className="flex items-center justify-between mb-1">
                      <span className="text-sm">{payment.paymentMethodName}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">${payment.amount.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
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
            <Card>
              <CardContent className="p-3 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                {appliedDiscounts.length > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount:</span>
                    <span>-${appliedDiscounts.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${discountedTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid:</span>
                  <span>${paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span className={remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                    ${remainingAmount.toFixed(2)}
                  </span>
                </div>
                {changeAmount > 0 && (
                  <div className="flex justify-between text-blue-600 font-bold">
                    <span>Change:</span>
                    <span>${changeAmount.toFixed(2)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button 
              className="w-full" 
              onClick={handlePayment}
              disabled={remainingAmount > 0.01}
            >
              Complete Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}