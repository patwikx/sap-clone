import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Monitor, 
  Plus, 
  Settings, 
  Users, 
  CreditCard,
  Percent,
  Utensils
} from 'lucide-react'
import Link from 'next/link'
import { getPOSTerminals, getPaymentMethods, getDiscounts, getRestaurantTables } from '@/lib/actions/pos'
import { TerminalForm } from '../components/terminal-form'
import { TableForm } from '../components/table-form'

export default async function POSSettingsPage() {
  const [terminals, paymentMethods, discounts, tables] = await Promise.all([
    getPOSTerminals(),
    getPaymentMethods(),
    getDiscounts(),
    getRestaurantTables()
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">POS Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure terminals, payment methods, and system settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* POS Terminals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Monitor className="mr-2 h-5 w-5" />
                POS Terminals
              </CardTitle>
              <TerminalForm>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Terminal
                </Button>
              </TerminalForm>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {terminals.map((terminal) => (
                <div key={terminal.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{terminal.name}</h3>
                    <p className="text-sm text-gray-600">{terminal.businessUnit.name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={terminal.shifts.length > 0 ? 'default' : 'secondary'}>
                      {terminal.shifts.length > 0 ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Tables */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Utensils className="mr-2 h-5 w-5" />
                Restaurant Tables
              </CardTitle>
              <TableForm>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Table
                </Button>
              </TableForm>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {tables.map((table) => (
                <div key={table.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{table.tableNumber}</span>
                  <Badge variant={
                    table.status === 'Available' ? 'default' :
                    table.status === 'Occupied' ? 'destructive' : 'secondary'
                  }>
                    {table.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{method.name}</span>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Discounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Percent className="mr-2 h-5 w-5" />
              Discounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {discounts.map((discount) => (
                <div key={discount.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{discount.name}</span>
                    <p className="text-xs text-gray-600">
                      {discount.type === 'PERCENTAGE' ? `${discount.value}%` : `$${discount.value}`}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}