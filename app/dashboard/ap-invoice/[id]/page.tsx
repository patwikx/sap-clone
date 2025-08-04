import { notFound } from 'next/navigation'
import { getAPInvoiceById } from '@/lib/actions/ap-invoice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, DollarSign, Package, User, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface APInvoiceDetailPageProps {
  params: {
    id: string
  }
}

export default async function APInvoiceDetailPage({ params }: APInvoiceDetailPageProps) {
  const apInvoice = await getAPInvoiceById(parseInt(params.id))

  if (!apInvoice) {
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
        <Link href="/dashboard/ap-invoice">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to AP Invoices
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AP Invoice PCH-{apInvoice.docNum}</h1>
          <p className="text-gray-600 mt-2">View AP invoice details and line items</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Lines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apInvoice.lines.map((line) => (
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
                            <strong>Unit Price:</strong> ${line.price.toFixed(2)}
                          </p>
                          {line.baseDocType && line.baseDocNum && (
                            <p className="text-sm text-gray-600">
                              <strong>Based on:</strong> {line.baseDocType} #{line.baseDocNum}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-red-600">
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
              <CardTitle>Invoice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Supplier</p>
                  <p className="text-gray-600">{apInvoice.businessPartner.cardName}</p>
                </div>
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Invoice Date</p>
                  <p className="text-gray-600">{format(new Date(apInvoice.docDate), 'PPP')}</p>
                </div>
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Due Date</p>
                  <p className="text-gray-600">{format(new Date(apInvoice.docDueDate), 'PPP')}</p>
                </div>
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Tax Date</p>
                  <p className="text-gray-600">{format(new Date(apInvoice.taxDate), 'PPP')}</p>
                </div>
              </div>

              {apInvoice.baseDocType && apInvoice.baseDocNum && (
                <div className="flex items-center text-sm">
                  <LinkIcon className="mr-2 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">Based on</p>
                    <p className="text-gray-600">{apInvoice.baseDocType} #{apInvoice.baseDocNum}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge variant={getStatusBadgeVariant(apInvoice.docStatus)}>
                  {getStatusLabel(apInvoice.docStatus)}
                </Badge>
              </div>

              {apInvoice.comments && (
                <div>
                  <p className="font-medium text-sm">Comments</p>
                  <p className="text-gray-600 text-sm mt-1">{apInvoice.comments}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Package className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Total Items:</span>
                  <span className="ml-auto font-medium">{apInvoice.lines.length}</span>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Amount:</span>
                    <div className="flex items-center text-lg font-bold text-red-600">
                      <DollarSign className="h-4 w-4" />
                      {apInvoice.docTotal.toFixed(2)}
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