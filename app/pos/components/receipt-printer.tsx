'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Printer, Download, Mail, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

interface ReceiptData {
  billNumber: string
  date: Date
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: string
  change: number
  customer?: {
    name: string
    phone?: string
    email?: string
  }
  table?: {
    number: string
  }
  waiter: string
}

interface ReceiptPrinterProps {
  receiptData: ReceiptData
  onPrint?: () => void
  onEmail?: (email: string) => void
  onSMS?: (phone: string) => void
}

export function ReceiptPrinter({ receiptData, onPrint, onEmail, onSMS }: ReceiptPrinterProps) {
  const [isPrinting, setIsPrinting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      // Simulate printing delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (onPrint) {
        onPrint()
      } else {
        // Default print behavior
        window.print()
      }
      
      toast.success('Receipt printed successfully')
    } catch (error) {
      toast.error(`Failed to print receipt: ${error}`)
    } finally {
      setIsPrinting(false)
    }
  }

  const handleEmail = () => {
    if (receiptData.customer?.email) {
      onEmail?.(receiptData.customer.email)
      toast.success('Receipt sent via email')
    } else {
      toast.error('No email address available')
    }
  }

  const handleSMS = () => {
    if (receiptData.customer?.phone) {
      onSMS?.(receiptData.customer.phone)
      toast.success('Receipt sent via SMS')
    } else {
      toast.error('No phone number available')
    }
  }

  const generateReceiptHTML = () => {
    return `
      <div style="font-family: monospace; width: 300px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px;">
          <h2 style="margin: 0;">RESTAURANT NAME</h2>
          <p style="margin: 5px 0;">123 Main Street</p>
          <p style="margin: 5px 0;">City, State 12345</p>
          <p style="margin: 5px 0;">Tel: (555) 123-4567</p>
        </div>
        
        <div style="margin-bottom: 10px;">
          <p><strong>Bill #:</strong> ${receiptData.billNumber}</p>
          <p><strong>Date:</strong> ${receiptData.date.toLocaleString()}</p>
          <p><strong>Waiter:</strong> ${receiptData.waiter}</p>
          ${receiptData.table ? `<p><strong>Table:</strong> ${receiptData.table.number}</p>` : ''}
          ${receiptData.customer ? `<p><strong>Customer:</strong> ${receiptData.customer.name}</p>` : ''}
        </div>
        
        <div style="border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 10px 0;">
          ${receiptData.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>${item.name}</span>
              <span>${item.quantity} x ₱${item.price.toFixed(2)} = ₱${item.total.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        
        <div style="margin-top: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Subtotal:</span>
            <span>₱${receiptData.subtotal.toFixed(2)}</span>
          </div>
          ${receiptData.discount > 0 ? `
            <div style="display: flex; justify-content: space-between;">
              <span>Discount:</span>
              <span>-₱${receiptData.discount.toFixed(2)}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between;">
            <span>Tax:</span>
            <span>₱${receiptData.tax.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; border-top: 1px solid #000; padding-top: 5px; margin-top: 5px;">
            <span>TOTAL:</span>
            <span>₱${receiptData.total.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 5px;">
            <span>Payment (${receiptData.paymentMethod}):</span>
            <span>₱${receiptData.total.toFixed(2)}</span>
          </div>
          ${receiptData.change > 0 ? `
            <div style="display: flex; justify-content: space-between;">
              <span>Change:</span>
              <span>₱${receiptData.change.toFixed(2)}</span>
            </div>
          ` : ''}
        </div>
        
        <div style="text-align: center; margin-top: 20px; border-top: 1px solid #000; padding-top: 10px;">
          <p>Thank you for your visit!</p>
          <p>Please come again</p>
        </div>
      </div>
    `
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={handlePrint}
          disabled={isPrinting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Printer className="mr-2 h-4 w-4" />
          {isPrinting ? 'Printing...' : 'Print'}
        </Button>
        
        <Button
          onClick={() => setShowPreview(true)}
          variant="outline"
        >
          <Download className="mr-2 h-4 w-4" />
          Preview
        </Button>
      </div>

      {receiptData.customer && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleEmail}
            variant="outline"
            disabled={!receiptData.customer.email}
            className="text-xs"
          >
            <Mail className="mr-1 h-3 w-3" />
            Email
          </Button>
          
          <Button
            onClick={handleSMS}
            variant="outline"
            disabled={!receiptData.customer.phone}
            className="text-xs"
          >
            <MessageSquare className="mr-1 h-3 w-3" />
            SMS
          </Button>
        </div>
      )}

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
          </DialogHeader>
          <div 
            className="border p-4 bg-white text-sm"
            dangerouslySetInnerHTML={{ __html: generateReceiptHTML() }}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button onClick={handlePrint} disabled={isPrinting}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}