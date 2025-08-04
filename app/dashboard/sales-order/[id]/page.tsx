import { notFound } from 'next/navigation'
import { getSalesOrderById } from '@/lib/sales-orders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, DollarSign, Package, User } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface SalesOrderDetailPageProps {
  params: {
    id: string
  }
}

export default async function SalesOrderDetailPage({ params }: SalesOrderDetailPageProps) {
  const salesOrder = await getSalesOrderById(parseInt(params.id))

  if (!salesOrder) {
    notFound()
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'O': return 'Open'
      case 'C': return 'Closed'
      case 'L': return 'Cancelled'
      default: return status
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'O': return 'default' as const
      case 'C': return 'secondary' as const
      case 'L': return 'destructive' as const
      default: return 'default' as const
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/sales-order">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sales Orders
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Order SO-{salesOrder.docNum}</h1>
          <p className="text-gray-600 mt-2">View sales order details and line items</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Lines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesOrder.lines.map((line) => (
                  <div key={line.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {line.itemCode} - {line.description}
                        </h4>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">
                            <strong>Quantity:</strong> {line.quantity}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Open Quantity:</strong> {line.openQty}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Unit Price:</strong> ${line.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600">
                          <p className="text-sm font-medium">Line Total</p>
                          <p className="text-lg font-bold flex items-center justify-end">
                            <DollarSign className="h-4 w-4" />
                            {line.lineTotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Customer</p>
                  <p className="text-gray-600">{salesOrder.businessPartner.cardName}</p>
                </div>
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Order Date</p>
                  <p className="text-gray-600">{format(new Date(salesOrder.docDate), 'PPP')}</p>
                </div>
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Due Date</p>
                  <p className="text-gray-600">{format(new Date(salesOrder.docDueDate), 'PPP')}</p>
                </div>
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Tax Date</p>
                  <p className="text-gray-600">{format(new Date(salesOrder.taxDate), 'PPP')}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge variant={getStatusBadgeVariant(salesOrder.docStatus)}>
                  {getStatusLabel(salesOrder.docStatus)}
                </Badge>
              </div>

              {salesOrder.comments && (
                <div>
                  <p className="font-medium text-sm">Comments</p>
                  <p className="text-gray-600 text-sm mt-1">{salesOrder.comments}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Package className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Total Items:</span>
                  <span className="ml-auto font-medium">{salesOrder.lines.length}</span>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Amount:</span>
                    <div className="flex items-center text-lg font-bold text-green-600">
                      <DollarSign className="h-4 w-4" />
                      {salesOrder.docTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}