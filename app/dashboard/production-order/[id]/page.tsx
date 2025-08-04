import { notFound } from 'next/navigation'
import { getProductionOrderById } from '@/lib/actions/production-order'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Package, Factory, CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface ProductionOrderDetailPageProps {
  params: {
    id: string
  }
}

export default async function ProductionOrderDetailPage({ params }: ProductionOrderDetailPageProps) {
  const productionOrder = await getProductionOrderById(parseInt(params.id))

  if (!productionOrder) {
    notFound()
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'P': return 'Planned'
      case 'R': return 'Released'
      case 'C': return 'Closed'
      case 'L': return 'Cancelled'
      default: return status
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'P': return 'outline' as const
      case 'R': return 'default' as const
      case 'C': return 'secondary' as const
      case 'L': return 'destructive' as const
      default: return 'default' as const
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'P': return Clock
      case 'R': return Factory
      case 'C': return CheckCircle
      case 'L': return XCircle
      default: return Clock
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'S': return 'Standard'
      case 'P': return 'Special'
      case 'D': return 'Disassembly'
      default: return type
    }
  }

  const StatusIcon = getStatusIcon(productionOrder.status)
  const completionPercentage = productionOrder.plannedQty > 0 ? (productionOrder.completedQty / productionOrder.plannedQty) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/production-order">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Production Orders
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production Order PRO-{productionOrder.docNum}</h1>
          <p className="text-gray-600 mt-2">View production order details and components</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {productionOrder.lines.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Components</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productionOrder.lines.map((line) => (
                    <div key={line.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {line.itemCode}
                          </h4>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600">
                              <strong>Base Quantity:</strong> {line.baseQty}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Planned Quantity:</strong> {line.plannedQty}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Issued Quantity:</strong> {line.issuedQty}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-blue-600">
                            <p className="text-sm font-medium">Remaining</p>
                            <p className="text-lg font-bold">
                              {line.plannedQty - line.issuedQty}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Production Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm">
                <Package className="mr-2 h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Item to Produce</p>
                  <p className="text-gray-600">{productionOrder.item.itemName}</p>
                  <p className="text-xs text-gray-500">{productionOrder.item.itemCode}</p>
                </div>
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Posting Date</p>
                  <p className="text-gray-600">{format(new Date(productionOrder.postingDate), 'PPP')}</p>
                </div>
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Due Date</p>
                  <p className="text-gray-600">{format(new Date(productionOrder.dueDate), 'PPP')}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge variant={getStatusBadgeVariant(productionOrder.status)}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {getStatusLabel(productionOrder.status)}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="text-sm font-medium">{getTypeLabel(productionOrder.type)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Production Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Planned</p>
                    <p className="font-medium text-lg">{productionOrder.plannedQty}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="font-medium text-lg text-green-600">{productionOrder.completedQty}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rejected</p>
                    <p className="font-medium text-lg text-red-600">{productionOrder.rejectedQty}</p>
                  </div>
                </div>

                {productionOrder.status === 'R' && (
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-medium">{completionPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}