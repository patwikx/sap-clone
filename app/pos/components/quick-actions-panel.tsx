'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Save, 
  RotateCcw, 
  Percent, 
  Zap,
  Clock,
  Calculator
} from 'lucide-react'

interface QuickActionsPanelProps {
  onHoldOrder: () => void
  onRecallOrder: (index: number) => void
  onApplyDiscount: (percent: number) => void
  heldOrdersCount: number
  currentDiscount: number
}

export function QuickActionsPanel({
  onHoldOrder,
  onRecallOrder,
  onApplyDiscount,
  heldOrdersCount,
  currentDiscount
}: QuickActionsPanelProps) {
  const quickDiscounts = [5, 10, 15, 20]

  return (
    <Card className="mb-4 border-dashed border-2 border-gray-200">
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Quick Actions Row 1 */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onHoldOrder}
              className="flex-1 h-8 text-xs"
            >
              <Save className="mr-1 h-3 w-3" />
              Hold
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRecallOrder(0)}
              disabled={heldOrdersCount === 0}
              className="flex-1 h-8 text-xs relative"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Recall
              {heldOrdersCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">
                  {heldOrdersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Quick Discounts */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Quick Discounts</span>
              {currentDiscount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {currentDiscount}% Applied
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1">
              {quickDiscounts.map((discount) => (
                <Button
                  key={discount}
                  variant={currentDiscount === discount ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onApplyDiscount(discount)}
                  className="h-7 text-xs"
                >
                  <Percent className="mr-1 h-2 w-2" />
                  {discount}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Functions */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
            >
              <Zap className="mr-1 h-3 w-3" />
              Split
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
            >
              <Clock className="mr-1 h-3 w-3" />
              Timer
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
            >
              <Calculator className="mr-1 h-3 w-3" />
              Calc
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}