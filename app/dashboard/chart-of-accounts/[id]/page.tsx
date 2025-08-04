import { notFound } from 'next/navigation'
import { getAccountById } from '@/lib/actions/chart-of-accounts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, DollarSign, Shield, Calendar } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface AccountDetailPageProps {
  params: {
    id: string
  }
}

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
  const account = await getAccountById(params.id)

  if (!account) {
    notFound()
  }

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'asset': return 'default' as const
      case 'liability': return 'destructive' as const
      case 'equity': return 'secondary' as const
      case 'revenue': return 'default' as const
      case 'expense': return 'outline' as const
      default: return 'default' as const
    }
  }

  const getBalanceColor = (balance: number, type: string) => {
    if (balance === 0) return 'text-gray-600'
    
    // Assets and Expenses are positive on debit side
    if (type === 'asset' || type === 'expense') {
      return balance > 0 ? 'text-green-600' : 'text-red-600'
    }
    // Liabilities, Equity, and Revenue are positive on credit side
    else {
      return balance < 0 ? 'text-green-600' : 'text-red-600'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/chart-of-accounts">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Chart of Accounts
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{account.acctName}</h1>
          <p className="text-gray-600 mt-2">Account Code: {account.acctCode}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Journal Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {account.journalEntryLines.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No journal entries found for this account</p>
              ) : (
                <div className="space-y-4">
                  {account.journalEntryLines.slice(0, 10).map((line) => (
                    <div key={line.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Link 
                            href={`/dashboard/journal-entries/${line.journalEntryId}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            Journal Entry #{line.journalEntryId}
                          </Link>
                          {line.shortName && (
                            <p className="text-sm text-gray-600">Reference: {line.shortName}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {line.debit > 0 && (
                            <div className="text-green-600">
                              <p className="text-sm font-medium">Debit</p>
                              <p className="font-bold">${line.debit.toFixed(2)}</p>
                            </div>
                          )}
                          {line.credit > 0 && (
                            <div className="text-red-600">
                              <p className="text-sm font-medium">Credit</p>
                              <p className="font-bold">${line.credit.toFixed(2)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="mr-1 h-3 w-3" />
                        {format(new Date(line.journalEntry.refDate), 'PPP')}
                      </div>
                      {line.lineMemo && (
                        <p className="text-sm text-gray-600 mt-1">{line.lineMemo}</p>
                      )}
                    </div>
                  ))}
                  {account.journalEntryLines.length > 10 && (
                    <p className="text-sm text-gray-500 text-center">
                      Showing 10 of {account.journalEntryLines.length} entries
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Account Code</p>
                <p className="font-medium">{account.acctCode}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Account Name</p>
                <p className="font-medium">{account.acctName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Account Type</p>
                <Badge variant={getTypeBadgeVariant(account.acctType)}>
                  {getTypeLabel(account.acctType)}
                </Badge>
              </div>

              {account.isControlAccount && (
                <div>
                  <p className="text-sm text-gray-600">Control Account</p>
                  <Badge variant="outline">
                    <Shield className="mr-1 h-3 w-3" />
                    Yes
                  </Badge>
                </div>
              )}

              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">Current Balance</p>
                <div className={`text-2xl font-bold ${getBalanceColor(account.balance, account.acctType)}`}>
                  <DollarSign className="inline h-5 w-5" />
                  {Math.abs(account.balance).toFixed(2)}
                </div>
                <p className="text-xs text-gray-500">
                  {account.balance >= 0 ? 'Debit Balance' : 'Credit Balance'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/dashboard/chart-of-accounts/${account.id}/edit`}>
                <Button variant="outline" className="w-full">
                  Edit Account
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                View All Entries
              </Button>
              <Button variant="outline" className="w-full">
                Account Statement
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}