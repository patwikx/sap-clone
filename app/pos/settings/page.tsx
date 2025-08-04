import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Monitor, 
  Plus, 
  CreditCard,
  Percent,
  Utensils,
  Edit,
  Trash2
} from 'lucide-react'
import { getPOSTerminals, getPaymentMethods, getDiscounts, getRestaurantTables } from '@/lib/actions/pos'
import { TerminalForm } from '../components/terminal-form'
import { TableForm } from '../components/table-form'
import { POSTerminalWithShifts, PaymentMethodData, DiscountData, RestaurantTableWithDetails } from '@/lib/types'

export default async function POSSettingsPage() {
  const [terminals, paymentMethods, discounts, tables]: [
    POSTerminalWithShifts[],
    PaymentMethodData[],
    DiscountData[],
    RestaurantTableWithDetails[]
  ] = await Promise.all([
    getPOSTerminals(),
    getPaymentMethods(),
    getDiscounts(),
    getRestaurantTables()
  ])

  return (
    <div className="space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">POS Configuration</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Configure terminals, payment methods, and system settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* POS Terminals */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                <Monitor className="mr-3 h-6 w-6 text-blue-600" />
                POS Terminals
              </CardTitle>
              <TerminalForm>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 px-4 py-2">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Terminal
                </Button>
              </TerminalForm>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {terminals.map((terminal) => (
                <div key={terminal.id} className="flex items-center justify-between p-4 border-2 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${terminal.shifts.length > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Monitor className={`h-5 w-5 ${terminal.shifts.length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{terminal.name}</h3>
                      <p className="text-sm text-gray-500">{terminal.businessUnit.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={terminal.shifts.length > 0 ? 'default' : 'secondary'}
                      className={terminal.shifts.length > 0 ? 'bg-green-600' : ''}
                    >
                      {terminal.shifts.length > 0 ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:bg-red-50 text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {terminals.length === 0 && (
                <div className="text-center py-8">
                  <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No terminals configured</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Tables */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                <Utensils className="mr-3 h-6 w-6 text-orange-600" />
                Restaurant Tables
              </CardTitle>
              <TableForm>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 px-4 py-2">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Table
                </Button>
              </TableForm>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
              {tables.map((table) => (
                <div key={table.id} className="flex flex-col items-center justify-center p-3 border-2 rounded-lg hover:border-orange-300 transition-colors">
                  <span className="font-bold text-gray-800 text-lg">{table.number}</span>
                  <Badge variant={
                    table.status === 'Available' ? 'default' :
                    table.status === 'Occupied' ? 'destructive' : 'secondary'
                  } className="mt-1 text-xs">
                    {table.status}
                  </Badge>
                </div>
              ))}
              {tables.length === 0 && (
                <div className="col-span-3 text-center py-8">
                  <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No tables configured</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                <CreditCard className="mr-3 h-6 w-6 text-green-600" />
              Payment Methods
              </CardTitle>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 px-4 py-2">
                <Plus className="mr-2 h-4 w-4" />
                Add Method
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 border-2 rounded-lg hover:border-green-300 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CreditCard className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="font-semibold text-gray-800">{method.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="hover:bg-green-50">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:bg-red-50 text-red-600">
                      <Trash2 className="h-4 w-4" />
                  </Button>
                  </div>
                </div>
              ))}
              {paymentMethods.length === 0 && (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No payment methods configured</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Discounts */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                <Percent className="mr-3 h-6 w-6 text-purple-600" />
              Discounts
              </CardTitle>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 px-4 py-2">
                <Plus className="mr-2 h-4 w-4" />
                Add Discount
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {discounts.map((discount) => (
                <div key={discount.id} className="flex items-center justify-between p-3 border-2 rounded-lg hover:border-purple-300 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Percent className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">{discount.name}</span>
                      <p className="text-xs text-gray-500">
                      {discount.type === 'Percentage' ? `${Number(discount.value)}%` : `$${Number(discount.value)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:bg-red-50 text-red-600">
                      <Trash2 className="h-4 w-4" />
                  </Button>
                  </div>
                </div>
              ))}
              {discounts.length === 0 && (
                <div className="text-center py-8">
                  <Percent className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No discounts configured</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}